'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // PostgreSQL approach: modify enum type
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_queues_status" ADD VALUE 'emergency_cancelled';
      `);
    } else {
      // For other databases, drop and recreate the column
      await queryInterface.removeColumn('queues', 'status');
      await queryInterface.addColumn('queues', 'status', {
        type: Sequelize.ENUM('waiting', 'in_service', 'completed', 'cancelled', 'no_show', 'emergency_cancelled'),
        allowNull: false,
        defaultValue: 'waiting'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // PostgreSQL: recreate enum without emergency_cancelled
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_queues_status" RENAME TO "enum_queues_status_old";
      `);
      
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_queues_status" AS ENUM('waiting', 'in_service', 'completed', 'cancelled', 'no_show');
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE "queues" 
        ALTER COLUMN "status" TYPE "enum_queues_status" 
        USING "status"::text::"enum_queues_status";
      `);
      
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_queues_status_old";
      `);
    } else {
      // For other databases
      await queryInterface.removeColumn('queues', 'status');
      await queryInterface.addColumn('queues', 'status', {
        type: Sequelize.ENUM('waiting', 'in_service', 'completed', 'cancelled', 'no_show'),
        allowNull: false,
        defaultValue: 'waiting'
      });
    }
  }
};