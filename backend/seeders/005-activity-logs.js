'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if activity logs already exist
    const [results] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM activity_logs WHERE DATE("createdAt") = '${today}'`
    );
    
    if (results[0].count > 0) {
      console.log('Activity logs for today already exist, skipping seed...');
      return;
    }

    // Get today's queues and patients
    const [queues] = await queryInterface.sequelize.query(`
      SELECT q.id as queueId, q."queueNumber", q.status, q."userId", u."fullName" 
      FROM queues q 
      JOIN users u ON q."userId" = u.id 
      WHERE q."appointmentDate" = '${today}' 
      ORDER BY q."queueNumber"
    `);

    if (queues.length === 0) {
      console.log('No queues found for today, skipping activity logs');
      return;
    }

    const activities = [];
    const now = new Date();

    // Create activity logs for each queue
    queues.forEach((queue, index) => {
      const baseTime = new Date(now);
      baseTime.setHours(7, 30, 0, 0); // Start at 7:30 AM
      
      // Queue created activity
      const createdTime = new Date(baseTime);
      createdTime.setMinutes(createdTime.getMinutes() + (index * 5)); // 5 min intervals
      
      activities.push({
        id: Sequelize.literal('gen_random_uuid()'),
        type: 'queue_created',
        title: 'Antrian baru dibuat',
        description: `${queue.fullName} membuat antrian nomor ${queue.queueNumber} untuk tanggal ${today}`,
        userId: queue.userId,
        queueId: queue.queueId,
        metadata: JSON.stringify({
          queueNumber: queue.queueNumber,
          appointmentDate: today,
          patientName: queue.fullName
        }),
        createdAt: createdTime,
        updatedAt: createdTime
      });

      // Add more activities based on queue status
      if (queue.status === 'completed' || queue.status === 'in_service') {
        // Queue called activity
        const calledTime = new Date(createdTime);
        calledTime.setHours(8, 0, 0, 0);
        calledTime.setMinutes(calledTime.getMinutes() + (index * 20));
        
        activities.push({
          id: Sequelize.literal('gen_random_uuid()'),
          type: 'queue_called',
          title: 'Antrian dipanggil',
          description: `${queue.fullName} (Nomor ${queue.queueNumber}) dipanggil untuk dilayani`,
          userId: queue.userId,
          queueId: queue.queueId,
          metadata: JSON.stringify({
            queueNumber: queue.queueNumber,
            patientName: queue.fullName,
            calledAt: calledTime
          }),
          createdAt: calledTime,
          updatedAt: calledTime
        });

        // Queue completed activity (only for completed status)
        if (queue.status === 'completed') {
          const completedTime = new Date(calledTime);
          completedTime.setMinutes(completedTime.getMinutes() + Math.floor(Math.random() * 10) + 10);
          
          activities.push({
            id: Sequelize.literal('gen_random_uuid()'),
            type: 'queue_completed',
            title: 'Antrian selesai',
            description: `${queue.fullName} (Nomor ${queue.queueNumber}) telah selesai dilayani`,
            userId: queue.userId,
            queueId: queue.queueId,
            metadata: JSON.stringify({
              queueNumber: queue.queueNumber,
              patientName: queue.fullName,
              serviceTime: Math.floor(Math.random() * 10) + 10,
              completedAt: completedTime
            }),
            createdAt: completedTime,
            updatedAt: completedTime
          });
        }
      }
    });

    await queryInterface.bulkInsert('activity_logs', activities);
    console.log(`✅ ${activities.length} activity logs created for today`);
  },

  down: async (queryInterface, Sequelize) => {
    const today = new Date().toISOString().split('T')[0];
    await queryInterface.sequelize.query(
      `DELETE FROM activity_logs WHERE DATE("createdAt") = '${today}'`
    );
  }
};