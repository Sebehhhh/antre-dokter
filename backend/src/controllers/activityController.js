const { ActivityLog, User, Queue } = require('../models');
const { Op } = require('sequelize');

const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20, type, date } = req.query;
    
    const whereClause = {};
    
    // Filter by type if provided
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.createdAt = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      };
    }

    const activities = await ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['fullName', 'phoneNumber'],
          required: false
        },
        {
          model: Queue,
          as: 'queue',
          attributes: ['queueNumber', 'appointmentDate'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const getActivityStats = async (req, res) => {
  try {
    const { date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];
    
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);

    const stats = await ActivityLog.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { stats: formattedStats }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

module.exports = {
  getRecentActivities,
  getActivityStats
};