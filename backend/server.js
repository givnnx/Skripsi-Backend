require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, getWeatherData } = require('./db');
const { initWebSocketServer, connectToDevice } = require('./websocket');
const ExcelJS = require('exceljs');
const fastCsv = require('fast-csv');
const fs = require('fs');

// Environment variables
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;
const DEVICE_WS_URL = process.env.DEVICE_WS_URL || 'ws://localhost:8080';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.get('/api/weather', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getWeatherData(startDate, endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Export data as CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getWeatherData(startDate, endDate);
    
    // Convert Prisma's DateTime objects to serializable format
    const serializedData = data.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
    
    fastCsv
      .write(serializedData, { headers: true })
      .pipe(res);
      
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export data as Excel
app.get('/api/export/excel', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getWeatherData(startDate, endDate);
    
    // Convert Prisma's DateTime objects to serializable format
    const serializedData = data.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Data');
    
    // Add headers
    const headers = Object.keys(serializedData[0] || {});
    worksheet.addRow(headers);
    
    // Add data rows
    serializedData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    
    // Initialize WebSocket server for frontend clients
    initWebSocketServer(WS_PORT);
    
    // Connect to weather monitoring device
    connectToDevice(DEVICE_WS_URL);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 