const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to MySQL database via Prisma');
    
    // We don't need to create tables manually as Prisma handles migrations,
    // but we can add a check to ensure we're connected properly
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Function to save weather data to database
async function saveWeatherData(data) {
  try {
    const result = await prisma.weatherData.create({
      data: {
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
        wind_speed: data.wind_speed,
        wind_direction: data.wind_direction,
        rainfall: data.rainfall
      }
    });
    return result.id;
  } catch (error) {
    console.error('Error saving weather data:', error);
    throw error;
  }
}

// Function to get weather data with optional date range
async function getWeatherData(startDate, endDate) {
  try {
    const whereCondition = {};
    
    if (startDate && endDate) {
      whereCondition.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      whereCondition.timestamp = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      whereCondition.timestamp = {
        lte: new Date(endDate)
      };
    }
    
    const data = await prisma.weatherData.findMany({
      where: whereCondition,
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error retrieving weather data:', error);
    throw error;
  }
}

// Function to get the latest weather data
async function getLatestWeatherData() {
  try {
    const data = await prisma.weatherData.findFirst({
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    return data || null;
  } catch (error) {
    console.error('Error retrieving latest weather data:', error);
    throw error;
  }
}

// Clean up Prisma connection when app shuts down
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  initializeDatabase,
  saveWeatherData,
  getWeatherData,
  getLatestWeatherData
}; 