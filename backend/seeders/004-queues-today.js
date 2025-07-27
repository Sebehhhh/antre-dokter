'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Check if queues for today already exist
    const [results] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM queues WHERE "appointmentDate" = '${today}'`
    );
    
    if (results[0].count > 0) {
      console.log('Queues for today already exist, skipping seed...');
      return;
    }

    // Get all patient users
    const [patients] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'patient' ORDER BY \"createdAt\" LIMIT 30"
    );

    if (patients.length === 0) {
      console.log('No patients found, please seed patients first');
      return;
    }

    const queues = [];
    const statuses = ['waiting', 'waiting', 'waiting', 'waiting', 'waiting', 'in_service', 'completed', 'completed'];

    // Create 30 queues for today
    for (let i = 0; i < Math.min(30, patients.length); i++) {
      const queueNumber = i + 1;
      const status = i === 0 ? 'in_service' : // First queue is currently being served
                    i <= 5 ? 'waiting' :      // Next 5 are waiting
                    i <= 20 ? 'completed' :   // Most are completed
                    'waiting';                // Rest are waiting
      
      const queue = {
        id: Sequelize.literal('gen_random_uuid()'),
        queueNumber: queueNumber,
        appointmentDate: today,
        status: status,
        estimatedServiceTime: 15,
        userId: patients[i].id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add service times for completed queues
      if (status === 'completed') {
        const serviceStart = new Date();
        serviceStart.setHours(8, 0, 0, 0); // Start at 8 AM
        serviceStart.setMinutes(serviceStart.getMinutes() + (i * 20)); // 20 min intervals
        
        const serviceEnd = new Date(serviceStart);
        serviceEnd.setMinutes(serviceEnd.getMinutes() + Math.floor(Math.random() * 10) + 10); // 10-20 min service time
        
        queue.serviceStartedAt = serviceStart;
        queue.serviceCompletedAt = serviceEnd;
        queue.actualServiceTime = Math.floor((serviceEnd - serviceStart) / (1000 * 60));
      } else if (status === 'in_service') {
        const serviceStart = new Date();
        serviceStart.setMinutes(serviceStart.getMinutes() - 5); // Started 5 min ago
        queue.serviceStartedAt = serviceStart;
      }

      queues.push(queue);
    }

    await queryInterface.bulkInsert('queues', queues);
    
    console.log(`✅ ${queues.length} queues created for today (${today})`);
    console.log(`   - 1 in service`);
    console.log(`   - ${queues.filter(q => q.status === 'waiting').length} waiting`);
    console.log(`   - ${queues.filter(q => q.status === 'completed').length} completed`);
  },

  down: async (queryInterface, Sequelize) => {
    const today = new Date().toISOString().split('T')[0];
    await queryInterface.bulkDelete('queues', { appointmentDate: today }, {});
  }
};