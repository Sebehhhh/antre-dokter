const { PracticeSettings, User } = require('../models');

const seedPracticeSettings = async () => {
  try {
    const existingSettings = await PracticeSettings.findOne({ where: { isActive: true } });
    
    if (!existingSettings) {
      await PracticeSettings.create({
        doctorName: 'Dr. Contoh',
        practiceName: 'Klinik AntreDokter',
        practiceAddress: 'Jalan Kesehatan No. 123, Jakarta',
        practicePhone: '021-12345678',
        operatingDays: [0, 1, 2, 3, 4, 5, 6], // All days (Sunday to Saturday)
        operatingHours: { start: '08:00', end: '17:00' },
        maxSlotsPerDay: 30,
        allowWalkIn: true,
        cancellationDeadline: 120,
        isActive: true
      });
      
      console.log('Default practice settings created successfully');
    } else {
      console.log('Practice settings already exist');
    }
  } catch (error) {
    console.error('Error seeding practice settings:', error);
  }
};

const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (!existingAdmin) {
      await User.create({
        fullName: 'Administrator',
        phoneNumber: '081234567890',
        password: 'Admin123!',
        role: 'admin'
      });
      
      console.log('Default admin user created successfully');
      console.log('Admin credentials: 081234567890 / Admin123!');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = { seedPracticeSettings, seedAdminUser };