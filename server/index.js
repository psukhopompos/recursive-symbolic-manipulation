
// ADD THESE LINES AT THE VERY TOP
console.log(`--- NODE_ENV: ${process.env.NODE_ENV} ---`); // Check if env var is read
console.log(`--- AZURE_API_BASE: ${process.env.AZURE_API_BASE ? 'SET' : 'MISSING'} ---`); // Check a key env var
console.log(`--- SUPABASE_URL: ${process.env.SUPABASE_URL ? 'SET' : 'MISSING'} ---`); // Check another key env var
console.log("!!! server/index.js TOP - Before ANY requires !!!");

// server/index.js - Server Entry Point
const http = require('http');
console.log("!!! server/index.js - After http require !!!"); // Check basic module loading
const app = require('./app'); // Import the configured Express app
console.log("!!! server/index.js - After app require !!!"); // Check if app configuration causes crash
const { PORT } = require('./config/env'); // PORT from env.js
console.log(`!!! server/index.js - After config require - PORT value from env.js: ${PORT} !!!`); // Check config loading
const log = require('./utils/logger'); // Assuming logger itself doesn't crash early
console.log("!!! server/index.js - After logger require !!!");

log.info("--- Server process starting (using logger) ---"); // Use our logger

const server = http.createServer(app);
console.log("!!! server/index.js - Server created !!!");

// Use process.env.PORT directly provided by Azure platform
const platformPort = process.env.PORT || 3000; // Fallback just in case
console.log(`!!! server/index.js - Attempting to listen on platformPort: ${platformPort} !!!`);

server.listen(platformPort, () => {
  // Use console.log here as it's the most basic output
  console.log(`!!! SUCCESS: Server listening on PORT ${platformPort} !!!`);
  log.info(`Server is running (reported by logger)`); // Secondary log
});

server.on('error', (error) => {
  console.error("!!! SERVER ERROR EVENT (server.on('error')) !!!", error); // Log errors directly
  log.error(`Server error event: ${error.message}`, error); // Also use logger

  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof platformPort === 'string' ? 'Pipe ' + platformPort : 'Port ' + platformPort;
  switch (error.code) {
    case 'EACCES':
      console.error(`!!! ${bind} requires elevated privileges !!!`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`!!! ${bind} is already in use !!!`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown (optional but good practice) - Keep these
process.on('SIGTERM', () => {
    console.log('!!! SIGTERM signal received !!!');
    log.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('!!! HTTP server closed via SIGTERM !!!');
        log.info('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('!!! SIGINT signal received !!!');
    log.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('!!! HTTP server closed via SIGINT !!!');
        log.info('HTTP server closed');
        process.exit(0);
    });
});

console.log("!!! server/index.js - Reached end of file execution !!!"); // Check if script runs to completion