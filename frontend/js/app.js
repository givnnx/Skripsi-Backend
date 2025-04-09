// DOM Elements
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const pressureEl = document.getElementById('pressure');
const windEl = document.getElementById('wind');
const rainfallEl = document.getElementById('rainfall');
const lastUpdatedEl = document.getElementById('last-updated');
const chartTypeSelect = document.getElementById('chart-type');
const timeRangeSelect = document.getElementById('time-range');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

// Chart Configuration
let weatherChart;
let weatherData = [];
let selectedChartType = 'temperature';
let selectedTimeRange = '24h';

// WebSocket Setup
const WS_URL = `ws://${window.location.hostname}:3001`;
let socket;

// Initialize the application
function init() {
  initWebSocket();
  setupChart();
  loadInitialData();
  
  // Initialize date inputs with default values
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  startDateInput.value = formatDateTimeForInput(oneWeekAgo);
  endDateInput.value = formatDateTimeForInput(now);
}

// Format date for datetime-local input
function formatDateTimeForInput(date) {
  return date.toISOString().slice(0, 16);
}

// Initialize WebSocket connection
function initWebSocket() {
  socket = new WebSocket(WS_URL);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'weather_update') {
        updateCurrentWeather(data.data);
        addDataPoint(data.data);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    setTimeout(initWebSocket, 3000);
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Update the current weather display
function updateCurrentWeather(data) {
  if (!data) return;
  
  temperatureEl.textContent = `${data.temperature.toFixed(1)} °C`;
  humidityEl.textContent = `${data.humidity.toFixed(1)} %`;
  
  if (data.pressure) {
    pressureEl.textContent = `${data.pressure.toFixed(1)} hPa`;
  }
  
  if (data.wind_speed) {
    const direction = data.wind_direction ? ` ${data.wind_direction}` : '';
    windEl.textContent = `${data.wind_speed.toFixed(1)} km/h${direction}`;
  }
  
  if (data.rainfall !== undefined) {
    rainfallEl.textContent = `${data.rainfall.toFixed(1)} mm`;
  }
  
  lastUpdatedEl.textContent = new Date().toLocaleTimeString();
}

// Load initial weather data
function loadInitialData() {
  fetch('/api/weather')
    .then(response => response.json())
    .then(data => {
      weatherData = data;
      
      // Update the latest data
      if (data.length > 0) {
        updateCurrentWeather(data[0]);
      }
      
      // Update chart with loaded data
      updateChart();
    })
    .catch(error => {
      console.error('Error loading initial data:', error);
    });
}

// Setup Chart.js chart
function setupChart() {
  const ctx = document.getElementById('weather-chart').getContext('2d');
  
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Temperature (°C)',
        data: [],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Weather Data'
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });
}

// Add a new data point to the chart
function addDataPoint(data) {
  if (!data || !weatherChart) return;
  
  weatherData.unshift({
    ...data,
    timestamp: new Date().toISOString()
  });
  
  // Limit array size to prevent memory issues
  if (weatherData.length > 1000) {
    weatherData.pop();
  }
  
  updateChart();
}

// Update chart based on selected type and time range
function updateChart() {
  if (!weatherChart || weatherData.length === 0) return;
  
  const filteredData = filterDataByTimeRange(weatherData);
  const chartData = extractChartData(filteredData, selectedChartType);
  
  weatherChart.data.labels = chartData.labels;
  weatherChart.data.datasets[0].data = chartData.values;
  
  // Update chart styling based on the type
  updateChartStyling(selectedChartType);
  
  weatherChart.update();
}

// Filter data by selected time range
function filterDataByTimeRange(data) {
  const now = new Date();
  let cutoffTime;
  
  switch (selectedTimeRange) {
    case '1h':
      cutoffTime = new Date(now - 60 * 60 * 1000);
      break;
    case '24h':
      cutoffTime = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoffTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      cutoffTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoffTime = new Date(now - 24 * 60 * 60 * 1000);
  }
  
  return data.filter(item => new Date(item.timestamp) >= cutoffTime);
}

// Extract data for chart based on selected type
function extractChartData(data, type) {
  let values = [];
  let labels = [];
  
  data.forEach(item => {
    let value;
    
    switch (type) {
      case 'temperature':
        value = item.temperature;
        break;
      case 'humidity':
        value = item.humidity;
        break;
      case 'pressure':
        value = item.pressure;
        break;
      case 'wind':
        value = item.wind_speed;
        break;
      case 'rainfall':
        value = item.rainfall;
        break;
      default:
        value = item.temperature;
    }
    
    if (value !== undefined) {
      values.push(value);
      labels.push(formatTimestamp(item.timestamp, selectedTimeRange));
    }
  });
  
  // Reverse arrays to show oldest data first
  return {
    values: values.reverse(),
    labels: labels.reverse()
  };
}

// Format timestamp based on selected time range
function formatTimestamp(timestamp, timeRange) {
  const date = new Date(timestamp);
  
  if (timeRange === '1h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (timeRange === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// Update chart styling based on type
function updateChartStyling(type) {
  let color, label, yAxisLabel;
  
  switch (type) {
    case 'temperature':
      color = '#e74c3c';
      label = 'Temperature (°C)';
      yAxisLabel = 'Temperature (°C)';
      break;
    case 'humidity':
      color = '#3498db';
      label = 'Humidity (%)';
      yAxisLabel = 'Humidity (%)';
      break;
    case 'pressure':
      color = '#9b59b6';
      label = 'Pressure (hPa)';
      yAxisLabel = 'Pressure (hPa)';
      break;
    case 'wind':
      color = '#2ecc71';
      label = 'Wind Speed (km/h)';
      yAxisLabel = 'Wind Speed (km/h)';
      break;
    case 'rainfall':
      color = '#1abc9c';
      label = 'Rainfall (mm)';
      yAxisLabel = 'Rainfall (mm)';
      break;
    default:
      color = '#e74c3c';
      label = 'Temperature (°C)';
      yAxisLabel = 'Temperature (°C)';
  }
  
  weatherChart.data.datasets[0].borderColor = color;
  weatherChart.data.datasets[0].backgroundColor = `${color}20`;
  weatherChart.data.datasets[0].label = label;
  weatherChart.options.scales.y.title.text = yAxisLabel;
}

// Event handler for chart type change
function updateChartType() {
  selectedChartType = chartTypeSelect.value;
  updateChart();
}

// Event handler for time range change
function updateTimeRange() {
  selectedTimeRange = timeRangeSelect.value;
  updateChart();
}

// Export data as CSV or Excel
function exportData(format) {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  
  if (!startDate || !endDate) {
    alert('Please select both start and end dates');
    return;
  }
  
  let url = `/api/export/${format}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
  
  // Open in a new tab
  window.open(url, '_blank');
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 