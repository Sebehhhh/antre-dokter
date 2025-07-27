const { PracticeSettings } = require('../models');

const getSettings = async (req, res) => {
  try {
    const settings = await PracticeSettings.findOne({ where: { isActive: true } });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Pengaturan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      doctorName,
      practiceName,
      practiceAddress,
      practicePhone,
      operatingDays,
      operatingHours,
      maxSlotsPerDay,
      allowWalkIn,
      cancellationDeadline
    } = req.body;

    let settings = await PracticeSettings.findOne({ where: { isActive: true } });
    
    if (!settings) {
      // Create new settings if none exist
      settings = await PracticeSettings.create({
        doctorName,
        practiceName,
        practiceAddress,
        practicePhone,
        operatingDays,
        operatingHours,
        maxSlotsPerDay,
        allowWalkIn,
        cancellationDeadline,
        isActive: true
      });
    } else {
      // Update existing settings
      await settings.update({
        doctorName,
        practiceName,
        practiceAddress,
        practicePhone,
        operatingDays,
        operatingHours,
        maxSlotsPerDay,
        allowWalkIn,
        cancellationDeadline
      });
    }

    res.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui',
      data: { settings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};