const { Queue, User, PracticeSettings, ActivityLog } = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('../utils/activityLogger');

const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal diperlukan'
      });
    }

    const settings = await PracticeSettings.findOne({ where: { isActive: true } });
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: 'Pengaturan praktik belum dikonfigurasi'
      });
    }

    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    if (!settings.operatingDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: 'Praktik tidak beroperasi pada hari tersebut'
      });
    }

    // Get all booked queues for the date
    const bookedQueues = await Queue.findAll({
      where: {
        appointmentDate: date,
        status: { [Op.not]: 'cancelled' }
      },
      attributes: ['queueNumber'],
      order: [['queueNumber', 'ASC']]
    });

    const totalBooked = bookedQueues.length;
    const availableSlots = settings.maxSlotsPerDay - totalBooked;

    res.json({
      success: true,
      data: {
        date,
        availableSlots: Math.max(0, availableSlots),
        maxSlots: settings.maxSlotsPerDay,
        totalBooked,
        operatingHours: settings.operatingHours,
        operatingDays: settings.operatingDays
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const bookQueue = async (req, res) => {
  try {
    const { appointmentDate } = req.body;
    const userId = req.user.id;

    const existingQueue = await Queue.findOne({
      where: {
        userId,
        appointmentDate,
        status: { [Op.not]: 'cancelled' }
      }
    });

    if (existingQueue) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memiliki antrian pada tanggal tersebut'
      });
    }

    const settings = await PracticeSettings.findOne({ where: { isActive: true } });
    const queueCount = await Queue.count({
      where: {
        appointmentDate,
        status: { [Op.not]: 'cancelled' }
      }
    });

    if (queueCount >= settings.maxSlotsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Slot antrian untuk tanggal tersebut sudah penuh'
      });
    }

    const queueNumber = queueCount + 1;

    const queue = await Queue.create({
      userId,
      appointmentDate,
      queueNumber
    });

    const queueWithUser = await Queue.findByPk(queue.id, {
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }]
    });

    // Log activity
    await logActivity({
      type: 'queue_created',
      title: 'Antrian baru dibuat',
      description: `${queueWithUser.patient.fullName} membuat antrian nomor ${queueWithUser.queueNumber}`,
      userId: queueWithUser.userId,
      queueId: queueWithUser.id,
      metadata: {
        queueNumber: queueWithUser.queueNumber,
        appointmentDate: queueWithUser.appointmentDate,
        patientName: queueWithUser.patient.fullName
      }
    });

    res.status(201).json({
      success: true,
      message: 'Antrian berhasil dibuat',
      data: { queue: queueWithUser }
    });
  } catch (error) {
    console.error('Book queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getMyQueues = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const queues = await Queue.findAll({
      where: { userId },
      order: [['appointmentDate', 'DESC'], ['queueNumber', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      data: { queues }
    });
  } catch (error) {
    console.error('Get my queues error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getCurrentQueue = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const currentQueue = await Queue.findOne({
      where: {
        appointmentDate: today,
        status: 'in_service'
      },
      include: [{ model: User, as: 'patient', attributes: ['fullName'] }]
    });

    const waitingQueues = await Queue.findAll({
      where: {
        appointmentDate: today,
        status: 'waiting'
      },
      include: [{ model: User, as: 'patient', attributes: ['fullName'] }],
      order: [['queueNumber', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        currentQueue,
        waitingQueues,
        totalWaiting: waitingQueues.length
      }
    });
  } catch (error) {
    console.error('Get current queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const cancelQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    const userId = req.user.id;

    const queue = await Queue.findOne({
      where: { id: queueId, userId }
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Antrian tidak ditemukan'
      });
    }

    if (queue.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Antrian tidak dapat dibatalkan'
      });
    }

    // Check if it's still possible to cancel (e.g., not on the same day or past operating hours)
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = queue.appointmentDate;
    
    // Allow cancellation if appointment is not today, or if it's today but still early
    const now = new Date();
    const currentHour = now.getHours();
    
    if (appointmentDate === today && currentHour >= 8) { // Assuming practice starts at 8 AM
      return res.status(400).json({
        success: false,
        message: 'Antrian tidak dapat dibatalkan pada hari yang sama setelah jam praktik dimulai'
      });
    }

    await queue.update({ status: 'cancelled' });

    const queueWithUser = await Queue.findByPk(queue.id, {
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }]
    });

    // Log activity
    await logActivity({
      type: 'queue_cancelled',
      title: 'Antrian dibatalkan',
      description: `${queueWithUser.patient.fullName} membatalkan antrian nomor ${queueWithUser.queueNumber}`,
      userId: queueWithUser.userId,
      queueId: queueWithUser.id,
      metadata: {
        queueNumber: queueWithUser.queueNumber,
        patientName: queueWithUser.patient.fullName,
        appointmentDate: queueWithUser.appointmentDate,
        cancelledAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Antrian berhasil dibatalkan'
    });
  } catch (error) {
    console.error('Cancel queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const callNextQueue = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a queue in service
    const currentQueue = await Queue.findOne({
      where: {
        appointmentDate: today,
        status: 'in_service'
      }
    });

    if (currentQueue) {
      return res.status(400).json({
        success: false,
        message: 'Masih ada pasien yang sedang dilayani'
      });
    }

    // Get next waiting queue
    const nextQueue = await Queue.findOne({
      where: {
        appointmentDate: today,
        status: 'waiting'
      },
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }],
      order: [['queueNumber', 'ASC']]
    });

    if (!nextQueue) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada antrian yang menunggu'
      });
    }

    // Update queue status to in_service
    await nextQueue.update({
      status: 'in_service',
      serviceStartedAt: new Date()
    });

    // Log activity
    await logActivity({
      type: 'queue_called',
      title: 'Antrian dipanggil',
      description: `${nextQueue.patient.fullName} (Nomor ${nextQueue.queueNumber}) dipanggil untuk dilayani`,
      userId: nextQueue.userId,
      queueId: nextQueue.id,
      metadata: {
        queueNumber: nextQueue.queueNumber,
        patientName: nextQueue.patient.fullName,
        calledAt: new Date()
      }
    });

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('queue_called', {
        queue: nextQueue,
        message: `Panggilan untuk ${nextQueue.patient.fullName} - Nomor Antrian ${nextQueue.queueNumber}`
      });
    }

    res.json({
      success: true,
      message: 'Antrian berhasil dipanggil',
      data: { queue: nextQueue }
    });
  } catch (error) {
    console.error('Call next queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const completeQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    
    const queue = await Queue.findOne({
      where: { id: queueId, status: 'in_service' },
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }]
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Antrian tidak ditemukan atau tidak sedang dilayani'
      });
    }

    const serviceStartedAt = new Date(queue.serviceStartedAt);
    const serviceCompletedAt = new Date();
    const actualServiceTime = Math.round((serviceCompletedAt - serviceStartedAt) / (1000 * 60)); // in minutes

    await queue.update({
      status: 'completed',
      serviceCompletedAt,
      actualServiceTime
    });

    // Log activity
    await logActivity({
      type: 'queue_completed',
      title: 'Antrian selesai',
      description: `${queue.patient.fullName} (Nomor ${queue.queueNumber}) telah selesai dilayani`,
      userId: queue.userId,
      queueId: queue.id,
      metadata: {
        queueNumber: queue.queueNumber,
        patientName: queue.patient.fullName,
        serviceTime: actualServiceTime,
        completedAt: serviceCompletedAt
      }
    });

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('queue_completed', {
        queue: queue,
        message: `${queue.patient.fullName} telah selesai dilayani`
      });
    }

    res.json({
      success: true,
      message: 'Antrian berhasil diselesaikan',
      data: { queue }
    });
  } catch (error) {
    console.error('Complete queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const updateQueueStatus = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['waiting', 'in_service', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const queue = await Queue.findByPk(queueId, {
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }]
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Antrian tidak ditemukan'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    if (status === 'completed' && queue.status === 'in_service') {
      updateData.serviceCompletedAt = new Date();
      if (queue.serviceStartedAt) {
        const actualServiceTime = Math.round((new Date() - new Date(queue.serviceStartedAt)) / (1000 * 60));
        updateData.actualServiceTime = actualServiceTime;
      }
    }

    await queue.update(updateData);

    // Log activity based on status
    const activityTypes = {
      'completed': 'queue_completed',
      'cancelled': 'queue_cancelled',
      'no_show': 'queue_no_show'
    };

    const activityTitles = {
      'completed': 'Antrian selesai',
      'cancelled': 'Antrian dibatalkan',
      'no_show': 'Pasien tidak hadir'
    };

    if (activityTypes[status]) {
      await logActivity({
        type: activityTypes[status],
        title: activityTitles[status],
        description: `${queue.patient.fullName} (Nomor ${queue.queueNumber}) - ${activityTitles[status].toLowerCase()}${notes ? `. Catatan: ${notes}` : ''}`,
        userId: queue.userId,
        queueId: queue.id,
        metadata: {
          queueNumber: queue.queueNumber,
          patientName: queue.patient.fullName,
          previousStatus: queue.status,
          newStatus: status,
          notes: notes || null,
          updatedAt: new Date()
        }
      });
    }

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('queue_updated', {
        queue: queue,
        message: `Status antrian ${queue.patient.fullName} diubah menjadi ${status}`
      });
    }

    res.json({
      success: true,
      message: 'Status antrian berhasil diperbarui',
      data: { queue }
    });
  } catch (error) {
    console.error('Update queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getQueuesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal diperlukan'
      });
    }

    const queues = await Queue.findAll({
      where: { appointmentDate: date },
      include: [{ model: User, as: 'patient', attributes: ['fullName', 'phoneNumber'] }],
      order: [['queueNumber', 'ASC']]
    });

    const stats = {
      total: queues.length,
      waiting: queues.filter(q => q.status === 'waiting').length,
      in_service: queues.filter(q => q.status === 'in_service').length,
      completed: queues.filter(q => q.status === 'completed').length,
      cancelled: queues.filter(q => q.status === 'cancelled').length,
      no_show: queues.filter(q => q.status === 'no_show').length
    };

    res.json({
      success: true,
      data: { queues, stats }
    });
  } catch (error) {
    console.error('Get queues by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

module.exports = {
  getAvailableSlots,
  bookQueue,
  getMyQueues,
  getCurrentQueue,
  cancelQueue,
  callNextQueue,
  completeQueue,
  updateQueueStatus,
  getQueuesByDate
};