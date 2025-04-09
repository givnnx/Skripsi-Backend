#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  console.log('Setting up database...');
  
  // Check if .env file is properly configured
  const requiredEnvVars = ['DATABASE_URL', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file and try again.');
    process.exit(1);
  }
  
  try {
    // Push Prisma schema to database
    console.log('Pushing Prisma schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Test database connection
    console.log('Testing database connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    console.log('Database setup completed successfully!');
    console.log(`Database '${process.env.DB_NAME}' is ready to use.`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 