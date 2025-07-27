const { Queue, User, EmergencyClosure } = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('../utils/activityLogger');
const { createEmergencyNotifications } = require('./notificationController');

const createEmergencyClosure = async (req, res) => {
  try {
    const { closureDate, reason } = req.body;
    const adminId = req.user.id;

    if (!closureDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal penutupan dan alasan harus diisi'
      });
    }

    // Check if there's already an active emergency closure for this date
    const existingClosure = await EmergencyClosure.findOne({
      where: {
        closureDate,
        isActive: true
      }
    });

    if (existingClosure) {
      return res.status(400).json({
        success: false,
        message: 'Sudah ada penutupan darurat untuk tanggal tersebut'
      });
    }

    // Get all active queues for the closure date
    const affectedQueues = await Queue.findAll({
      where: {
        appointmentDate: closureDate,
        status: { [Op.in]: ['waiting', 'in_service'] }
      },
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }]
    });

    // Create emergency closure record
    const emergencyClosure = await EmergencyClosure.create({
      closureDate,
      reason,
      affectedQueuesCount: affectedQueues.length,
      createdBy: adminId
    });

    // Update all affected queues to 'emergency_cancelled' status
    const queueIds = affectedQueues.map(q => q.id);
    if (queueIds.length > 0) {
      await Queue.update(
        { 
          status: 'emergency_cancelled',
          notes: `Praktik ditutup darurat: ${reason}`
        },
        { where: { id: queueIds } }
      );
    }

    // Log activity for each affected queue
    for (const queue of affectedQueues) {
      await logActivity({
        type: 'emergency_closure',
        title: 'Penutupan praktik darurat',
        description: `Antrian ${queue.patient.fullName} (No. ${queue.queueNumber}) dibatalkan karena penutupan darurat: ${reason}`,
        userId: queue.userId,
        queueId: queue.id,
        metadata: {
          queueNumber: queue.queueNumber,
          patientName: queue.patient.fullName,
          closureReason: reason,
          emergencyClosureId: emergencyClosure.id,
          originalStatus: queue.status
        }
      });
    }

    // Log admin activity
    await logActivity({
      type: 'admin_emergency_closure',
      title: 'Admin membuat penutupan darurat',
      description: `Praktik ditutup darurat pada ${closureDate}: ${reason}. ${affectedQueues.length} antrian terpengaruh`,
      userId: adminId,
      metadata: {
        closureDate,
        reason,
        affectedQueuesCount: affectedQueues.length,
        emergencyClosureId: emergencyClosure.id
      }
    });

    // Create notifications for affected patients
    await createEmergencyNotifications(emergencyClosure.id, affectedQueues);

    // Emit socket event for real-time notifications
    if (req.app.locals.io) {
      affectedQueues.forEach(queue => {
        req.app.locals.io.to(`user_${queue.userId}`).emit('emergency_closure', {
          type: 'emergency_closure',
          title: 'Praktik Ditutup Darurat',
          message: `Praktik ditutup darurat pada ${new Date(closureDate).toLocaleDateString('id-ID')}. Alasan: ${reason}`,
          closureDate,
          reason,
          queueNumber: queue.queueNumber
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Penutupan darurat berhasil dibuat dan notifikasi telah dikirim',
      data: {
        emergencyClosure: {
          ...emergencyClosure.dataValues,
          affectedQueues: affectedQueues.map(q => ({
            id: q.id,
            queueNumber: q.queueNumber,
            patientName: q.patient.fullName,
            phoneNumber: q.patient.phoneNumber
          }))
        }
      }
    });
  } catch (error) {
    console.error('Create emergency closure error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getEmergencyClosures = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    
    const whereClause = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const offset = (page - 1) * limit;
    
    const closures = await EmergencyClosure.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'creator', attributes: ['fullName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        closures: closures.rows,
        pagination: {
          total: closures.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(closures.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get emergency closures error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const checkEmergencyClosure = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal diperlukan'
      });
    }

    const emergencyClosure = await EmergencyClosure.findOne({
      where: {
        closureDate: date,
        isActive: true
      },
      include: [{ model: User, as: 'creator', attributes: ['fullName'] }]
    });

    res.json({
      success: true,
      data: {
        hasEmergencyClosure: !!emergencyClosure,
        emergencyClosure
      }
    });
  } catch (error) {
    console.error('Check emergency closure error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const rescheduleAffectedQueues = async (req, res) => {
  try {
    const { emergencyClosureId, newDate } = req.body;
    const adminId = req.user.id;

    if (!emergencyClosureId || !newDate) {
      return res.status(400).json({
        success: false,
        message: 'ID penutupan darurat dan tanggal baru harus diisi'
      });
    }

    const emergencyClosure = await EmergencyClosure.findByPk(emergencyClosureId);
    if (!emergencyClosure) {
      return res.status(404).json({
        success: false,
        message: 'Penutupan darurat tidak ditemukan'
      });
    }

    // Get all emergency cancelled queues for this closure
    const affectedQueues = await Queue.findAll({
      where: {
        appointmentDate: emergencyClosure.closureDate,
        status: 'emergency_cancelled'
      },
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }]
    });

    let rescheduledCount = 0;
    
    for (const queue of affectedQueues) {
      // Check if patient already has a queue on the new date
      const existingQueue = await Queue.findOne({
        where: {
          userId: queue.userId,
          appointmentDate: newDate,
          status: { [Op.not]: 'cancelled' }
        }
      });

      if (!existingQueue) {
        // Get next queue number for the new date
        const queueCount = await Queue.count({
          where: {
            appointmentDate: newDate,
            status: { [Op.not]: 'cancelled' }
          }
        });

        // Create new queue for the new date
        await Queue.create({
          userId: queue.userId,
          appointmentDate: newDate,
          queueNumber: queueCount + 1,
          notes: `Dijadwal ulang dari ${emergencyClosure.closureDate} karena penutupan darurat`
        });

        // Log rescheduling activity
        await logActivity({
          type: 'queue_rescheduled',
          title: 'Antrian dijadwal ulang',
          description: `Antrian ${queue.patient.fullName} dijadwal ulang dari ${emergencyClosure.closureDate} ke ${newDate}`,
          userId: queue.userId,
          queueId: queue.id,
          metadata: {
            originalDate: emergencyClosure.closureDate,
            newDate,
            queueNumber: queue.queueNumber,
            patientName: queue.patient.fullName,
            rescheduledBy: adminId
          }
        });

        rescheduledCount++;
      }
    }

    // Update emergency closure record
    await emergencyClosure.update({
      reschedulingOffered: true
    });

    res.json({
      success: true,
      message: `${rescheduledCount} antrian berhasil dijadwal ulang`,
      data: {
        rescheduledCount,
        totalAffected: affectedQueues.length,
        newDate
      }
    });
  } catch (error) {
    console.error('Reschedule affected queues error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const deactivateEmergencyClosure = async (req, res) => {
  try {
    const { emergencyClosureId } = req.params;
    const adminId = req.user.id;

    const emergencyClosure = await EmergencyClosure.findByPk(emergencyClosureId);
    if (!emergencyClosure) {
      return res.status(404).json({
        success: false,
        message: 'Penutupan darurat tidak ditemukan'
      });
    }

    await emergencyClosure.update({ isActive: false });

    await logActivity({
      type: 'emergency_closure_deactivated',
      title: 'Penutupan darurat dinonaktifkan',
      description: `Penutupan darurat pada ${emergencyClosure.closureDate} dinonaktifkan`,
      userId: adminId,
      metadata: {
        emergencyClosureId,
        closureDate: emergencyClosure.closureDate,
        deactivatedBy: adminId
      }
    });

    res.json({
      success: true,
      message: 'Penutupan darurat berhasil dinonaktifkan'
    });
  } catch (error) {
    console.error('Deactivate emergency closure error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

module.exports = {
  createEmergencyClosure,
  getEmergencyClosures,
  checkEmergencyClosure,
  rescheduleAffectedQueues,
  deactivateEmergencyClosure
};