const { Notification, RescheduleRequest, Queue, User, EmergencyClosure, PracticeSettings } = require('../models');
const { Op } = require('sequelize');

// Removed complex auto-reschedule functionality
// Emergency closure now just notifies patients to book manually

const getPatientNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const whereClause = { userId };
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const offset = (page - 1) * limit;
    
    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
        unreadCount,
        pagination: {
          total: notifications.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(notifications.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get patient notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notifikasi berhasil ditandai sebagai dibaca'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({
      success: true,
      message: 'Semua notifikasi berhasil ditandai sebagai dibaca'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Removed complex reschedule request functionality
// Patients will book new appointments manually

const createEmergencyNotifications = async (emergencyClosureId, affectedQueues) => {
  try {
    const emergencyClosure = await EmergencyClosure.findByPk(emergencyClosureId, {
      include: [{ model: User, as: 'creator', attributes: ['fullName'] }]
    });

    if (!emergencyClosure) return;

    const notifications = [];

    for (const queue of affectedQueues) {
      const message = `Maaf, praktik ditutup darurat pada ${new Date(queue.appointmentDate).toLocaleDateString('id-ID')}. Alasan: ${emergencyClosure.reason}. Silakan buat jadwal baru melalui aplikasi atau hubungi admin untuk bantuan.`;
      
      notifications.push({
        userId: queue.userId,
        type: 'emergency_closure',
        title: 'Praktik Ditutup Darurat',
        message: message,
        actionRequired: false,
        actionData: {
          emergencyClosureId: emergencyClosureId,
          originalQueueId: queue.id,
          originalDate: queue.appointmentDate,
          originalQueueNumber: queue.queueNumber
        },
        relatedId: queue.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // Bulk create notifications
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }

    // Update emergency closure to mark notifications as sent
    await emergencyClosure.update({ notificationSent: true });

    return true;
  } catch (error) {
    console.error('Create emergency notifications error:', error);
    return false;
  }
};

module.exports = {
  getPatientNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createEmergencyNotifications
};