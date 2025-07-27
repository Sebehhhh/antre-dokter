const { User, Queue, ActivityLog } = require('../models');
const { Op } = require('sequelize');

const getAllPatients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      role: 'patient'
    };

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: patients } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'phoneNumber', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Queue,
          as: 'queues',
          attributes: ['id', 'status'],
          required: false
        }
      ]
    });

    // Add statistics for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const stats = await Queue.findAll({
          where: { userId: patient.id },
          attributes: [
            'status',
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        });

        const queueStats = {
          total: 0,
          waiting: 0,
          completed: 0,
          cancelled: 0,
          in_service: 0,
          no_show: 0
        };

        stats.forEach(stat => {
          queueStats[stat.status] = parseInt(stat.count);
          queueStats.total += parseInt(stat.count);
        });

        // Get last queue
        const lastQueue = await Queue.findOne({
          where: { userId: patient.id },
          order: [['createdAt', 'DESC']],
          attributes: ['appointmentDate', 'status', 'createdAt']
        });

        return {
          ...patient.toJSON(),
          queueStats,
          lastQueue
        };
      })
    );

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        patients: patientsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getPatientDetail = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findOne({
      where: { 
        id: patientId,
        role: 'patient'
      },
      attributes: ['id', 'fullName', 'phoneNumber', 'isActive', 'lastLogin', 'createdAt', 'updatedAt']
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }

    // Get patient's queue history
    const queues = await Queue.findAll({
      where: { userId: patientId },
      order: [['createdAt', 'DESC']],
      limit: 50 // Last 50 queues
    });

    // Get patient's activity logs
    const activities = await ActivityLog.findAll({
      where: { userId: patientId },
      order: [['createdAt', 'DESC']],
      limit: 20 // Last 20 activities
    });

    // Calculate statistics
    const stats = await Queue.findAll({
      where: { userId: patientId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const queueStats = {
      total: 0,
      waiting: 0,
      completed: 0,
      cancelled: 0,
      in_service: 0,
      no_show: 0
    };

    stats.forEach(stat => {
      queueStats[stat.status] = parseInt(stat.count);
      queueStats.total += parseInt(stat.count);
    });

    // Calculate visit frequency (per month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const visitFrequency = await Queue.findAll({
      where: {
        userId: patientId,
        appointmentDate: {
          [Op.gte]: sixMonthsAgo.toISOString().split('T')[0]
        },
        status: 'completed'
      },
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('appointmentDate')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'visits']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('appointmentDate'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('appointmentDate')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        patient: patient.toJSON(),
        queues,
        activities,
        stats: queueStats,
        visitFrequency
      }
    });
  } catch (error) {
    console.error('Get patient detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const updatePatientStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { isActive } = req.body;

    const patient = await User.findOne({
      where: { 
        id: patientId,
        role: 'patient'
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }

    await patient.update({ isActive });

    res.json({
      success: true,
      message: `Status pasien berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: { patient: patient.toJSON() }
    });
  } catch (error) {
    console.error('Update patient status error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getPatientStats = async (req, res) => {
  try {
    // Total patients
    const totalPatients = await User.count({
      where: { role: 'patient' }
    });

    // Active patients
    const activePatients = await User.count({
      where: { 
        role: 'patient',
        isActive: true
      }
    });

    // New patients this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await User.count({
      where: {
        role: 'patient',
        createdAt: {
          [Op.gte]: thisMonth
        }
      }
    });

    // Patients with active queues
    const patientsWithActiveQueues = await User.count({
      where: {
        role: 'patient'
      },
      include: [
        {
          model: Queue,
          as: 'queues',
          where: {
            status: ['waiting', 'in_service']
          },
          required: true
        }
      ]
    });

    res.json({
      success: true,
      data: {
        totalPatients,
        activePatients,
        inactivePatients: totalPatients - activePatients,
        newThisMonth,
        patientsWithActiveQueues
      }
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientDetail,
  updatePatientStatus,
  getPatientStats
};