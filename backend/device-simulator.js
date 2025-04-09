const WebSocket = require('ws');

// Create a WebSocket server to simulate the weather monitoring device
const WS_PORT = 8080;
const wss = new WebSocket.Server({ port: WS_PORT });

console.log(`Weather device simulator running on ws://localhost:${WS_PORT}`);

// Function to generate random weather data
function generateWeatherData() {
  // Generate realistic-ish data with some random variation
  const baseTemp = 22 + (Math.random() * 10 - 5);
  const baseHumidity = 60 + (Math.random() * 20 - 10);
  const basePressure = 1013 + (Math.random() * 10 - 5);
  const baseWindSpeed = Math.random() * 15;
  
  // Wind direction as cardinal points
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const windDirection = directions[Math.floor(Math.random() * directions.length)];
  
  // Random chance of rainfall
  const rainfallChance = Math.random();
  const rainfall = rainfallChance > 0.7 ? Math.random() * 5 : 0;
  
  return {
    temperature: parseFloat(baseTemp.toFixed(2)),
    humidity: parseFloat(baseHumidity.toFixed(2)),
    pressure: parseFloat(basePressure.toFixed(2)),
    wind_speed: parseFloat(baseWindSpeed.toFixed(2)),
    wind_direction: windDirection,
    rainfall: parseFloat(rainfall.toFixed(2))
  };
}

// Send data at regular intervals to connected clients
wss.on('connection', (ws) => {
  console.log('Backend connected to the device simulator');
  
  // Generate and send data every 5 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const data = generateWeatherData();
      ws.send(JSON.stringify(data));
      console.log('Sent data:', data);
    }
  }, 5000);
  
  ws.on('close', () => {
    console.log('Backend disconnected from the device simulator');
    clearInterval(interval);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });
  
  // Send initial data immediately
  const initialData = generateWeatherData();
  ws.send(JSON.stringify(initialData));
  console.log('Sent initial data:', initialData);
});

// Handle server errors
wss.on('error', (error) => {
  console.error('Server error:', error);
}); 