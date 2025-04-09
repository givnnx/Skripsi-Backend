# Weather Monitoring System - Quick Start Guide

This is a simple weather monitoring system built for educational purposes. It consists of a backend server that connects to a weather device via WebSocket, stores data in MySQL database using Prisma ORM, and provides a frontend interface for visualization.

## Prerequisites

- Node.js (v14 or higher)
- MySQL database server
- Web browser

## Setup Steps

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**

   Copy the `.env.example` file to `.env` and update the values:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Then edit the `.env` file with your MySQL credentials. The most important settings are:
   
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=weather_monitoring
   DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:3306/${DB_NAME}"
   ```

3. **Set Up Database**

   Create a MySQL database for the application:

   ```sql
   CREATE DATABASE weather_monitoring;
   ```

   Then run the setup script to initialize the database with Prisma:

   ```bash
   cd backend
   npm run db:setup
   ```

   This will create the necessary tables based on the Prisma schema.

4. **Explore the Database with Prisma Studio (Optional)**

   Prisma provides a useful visual interface for your database:

   ```bash
   cd backend
   npm run prisma:studio
   ```

   This will open Prisma Studio in your browser where you can browse and edit your data.

5. **Start the Device Simulator**

   For testing purposes, you can start the included device simulator:

   ```bash
   node backend/device-simulator.js
   ```

   This simulates a weather monitoring device that sends data via WebSocket.

6. **Start the Backend Server**

   In a new terminal window, start the backend server:

   ```bash
   cd backend
   node server.js
   ```

7. **Access the Frontend**

   Open your web browser and navigate to:

   ```
   http://localhost:3000
   ```

   You should see the weather monitoring dashboard with real-time data updates.

## Using the Application

- The dashboard displays current weather conditions received from the (simulated) device
- Historical data is visualized in charts
- You can export data as CSV or Excel files by selecting a date range

## Troubleshooting

- If you see connection errors, ensure that all ports are available (3000, 3001, 8080)
- Check the console logs for detailed error messages
- Make sure your MySQL server is running and accessible with the provided credentials
- If database issues occur, try using Prisma Studio (`npm run prisma:studio`) to check your database state
- For Prisma-related issues, check the `.env` file to ensure DATABASE_URL is properly formatted 