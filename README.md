# Weather Monitoring System

A simple weather monitoring system with backend and frontend components for educational purposes.

## Components

- **Backend**: Node.js server that:
  - Connects to weather monitoring device via WebSocket
  - Stores data in MySQL database
  - Provides WebSocket server for frontend
  - Offers API endpoints for data export (CSV, Excel)

- **Frontend**: Simple HTML/CSS/JS interface with:
  - Real-time weather data display
  - Interactive charts for data visualization
  - Export functionality

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL server
- Weather monitoring device that supports WebSocket

### Installation

1. Clone this repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Configure database:
   - Create MySQL database
   - Update `.env` file with database credentials
4. Start the server:
   ```
   npm start
   ```
5. Open `frontend/index.html` in a browser or serve it using a simple HTTP server

## Project Structure
```
/
├── backend/             # Backend server code
│   ├── server.js        # Main server file
│   ├── db.js            # Database connection
│   ├── websocket.js     # WebSocket handling
│   └── package.json     # Dependencies
├── frontend/            # Frontend code
│   ├── index.html       # Main HTML page
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript files
└── README.md            # This file
``` 