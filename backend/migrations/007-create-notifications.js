'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('emergency_closure', 'reschedule_request', 'reschedule_approved', 'reschedule_denied', 'queue_cancelled', 'general_announcement'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      actionRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      actionData: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      relatedId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Related queue, emergency closure, or other entity ID'
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
    await queryInterface.addIndex('notifications', ['userId']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['isRead']);
    await queryInterface.addIndex('notifications', ['actionRequired']);
    await queryInterface.addIndex('notifications', ['createdAt']);
    await queryInterface.addIndex('notifications', ['expiresAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type";');
  }
};