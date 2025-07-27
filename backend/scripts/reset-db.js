const { Sequelize } = require('sequelize');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Starting database reset...');
  
  try {
    // Connect to PostgreSQL without specific database
    const sequelize = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      dialect: 'postgres',
      database: 'postgres', // Connect to default postgres database
      logging: false
    });

    const dbName = process.env.DB_NAME || 'antredokter_db';
    
    console.log('📋 Dropping existing database...');
    await sequelize.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    
    console.log('🆕 Creating new database...');
    await sequelize.query(`CREATE DATABASE "${dbName}"`);
    
    await sequelize.close();
    console.log('✅ Database reset completed!');
    console.log('🚀 Now run: npm run db:migrate && npm run db:seed');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();