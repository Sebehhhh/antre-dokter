'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reschedule_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      originalQueueId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'queues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      patientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      emergencyClosureId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'emergency_closures',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      requestType: {
        type: Sequelize.ENUM('patient_request', 'admin_suggestion'),
        allowNull: false
      },
      originalDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      preferredDates: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      suggestedDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      suggestedQueueNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      patientResponse: {
        type: Sequelize.ENUM('waiting', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'waiting'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('reschedule_requests', ['patientId']);
    await queryInterface.addIndex('reschedule_requests', ['status']);
    await queryInterface.addIndex('reschedule_requests', ['patientResponse']);
    await queryInterface.addIndex('reschedule_requests', ['emergencyClosureId']);
    await queryInterface.addIndex('reschedule_requests', ['createdAt']);
    await queryInterface.addIndex('reschedule_requests', ['expiresAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reschedule_requests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reschedule_requests_requestType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reschedule_requests_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reschedule_requests_patientResponse";');
  }
};