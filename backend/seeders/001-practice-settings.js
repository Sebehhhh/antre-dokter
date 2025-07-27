'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM practice_settings WHERE \"isActive\" = true"
    );
    
    if (results[0].count > 0) {
      console.log('Practice settings already exist, skipping seed...');
      return;
    }

    await queryInterface.bulkInsert('practice_settings', [{
      id: Sequelize.literal('gen_random_uuid()'),
      doctorName: 'Dr. Nama Dokter',
      practiceName: 'Nama Praktik',
      practiceAddress: 'Alamat Praktik',
      practicePhone: '(000) 0000-0000',
      operatingDays: JSON.stringify([1, 2, 3, 4, 5, 6]), // Monday to Saturday (exclude Sunday=0)
      operatingHours: JSON.stringify({ start: '08:00', end: '17:00' }),
      maxSlotsPerDay: 30,
      allowWalkIn: false,
      cancellationDeadline: 120,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('practice_settings', null, {});
  }
};