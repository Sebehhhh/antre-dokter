'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    
    if (results[0].count > 0) {
      console.log('Admin user already exists, skipping seed...');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Administrator',
      phoneNumber: '08123456789',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { role: 'admin' }, {});
  }
};