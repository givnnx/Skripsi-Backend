const WebSocket = require('ws');
const { saveWeatherData } = require('./db');

// Store for connected clients
let clients = [];

// Initialize WebSocket server for frontend clients
function initWebSocketServer(port) {
  const wss = new WebSocket.Server({ port });
  
  wss.on('connection', (ws) => {
    console.log('Frontend client connected');
    clients.push(ws);
    
    // Send initial data if needed
    // ws.send(JSON.stringify({ type: 'initial', data: {...} }));
    
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('Received message from frontend:', parsedMessage);
        
        // Handle frontend client messages if needed
      } catch (error) {
        console.error('Error parsing frontend message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Frontend client disconnected');
      clients = clients.filter(client => client !== ws);
    });
    
    ws.on('error', (error) => {
      console.error('Frontend WebSocket error:', error);
      clients = clients.filter(client => client !== ws);
    });
  });
  
  console.log(`WebSocket server for frontend clients running on port ${port}`);
  return wss;
}

// Connect to weather monitoring device WebSocket
function connectToDevice(url) {
  const ws = new WebSocket(url);
  
  ws.on('open', () => {
    console.log(`Connected to weather monitoring device at ${url}`);
  });
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received data from device:', data);
      
      // Validate the data
      if (isValidWeatherData(data)) {
        // Save to database
        await saveWeatherData(data);
        
        // Broadcast to all connected frontend clients
        broadcastToClients(data);
      } else {
        console.warn('Received invalid data from device:', data);
      }
    } catch (error) {
      console.error('Error processing device data:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Disconnected from weather monitoring device');
    // Try to reconnect after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect to weather monitoring device...');
      connectToDevice(url);
    }, 5000);
  });
  
  ws.on('error', (error) => {
    console.error('Device WebSocket error:', error);
  });
  
  return ws;
}

// Validate weather data
function isValidWeatherData(data) {
  // Check if required fields exist and have valid values
  if (typeof data !== 'object' || data === null) return false;
  if (typeof data.temperature !== 'number') return false;
  if (typeof data.humidity !== 'number') return false;
  
  // Optional fields can be checked as needed
  
  return true;
}

// Broadcast data to all connected frontend clients
function broadcastToClients(data) {
  const message = JSON.stringify({
    type: 'weather_update',
    data,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = {
  initWebSocketServer,
  connectToDevice,
  broadcastToClients
}; 