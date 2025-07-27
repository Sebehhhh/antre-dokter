'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'patient'"
    );
    
    if (results[0].count >= 30) {
      console.log('Patients already exist, skipping seed...');
      return;
    }

    const hashedPassword = await bcrypt.hash('Patient123!', 12);
    const patients = [];

    // Generate 30 patients
    for (let i = 1; i <= 30; i++) {
      patients.push({
        id: Sequelize.literal('gen_random_uuid()'),
        fullName: `Pasien ${i.toString().padStart(2, '0')}`,
        phoneNumber: `0812345${i.toString().padStart(4, '0')}`, // 081234500001 - 081234500030
        password: hashedPassword,
        role: 'patient',
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('users', patients);
    console.log('✅ 30 patients created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { role: 'patient' }, {});
  }
};