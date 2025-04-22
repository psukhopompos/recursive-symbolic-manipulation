// server/app.js - Express App Configuration
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const { AZURE_API_BASE, AZURE_API_KEY, DEPLOYMENT_NAME, MODEL_NAME } = require('./config/env');
const log = require('./utils/logger');
const requestLoggerMiddleware = require('./middleware/requestLogger');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// --- Basic Security Middleware ---
app.use(helmet()); // Set various security headers
app.use(cors());   // Enable CORS - configure origins if needed for production

// --- Body Parsing ---
app.use(bodyParser.json());

// --- Request Logging ---
app.use(requestLoggerMiddleware);

// --- Static File Serving ---
// Serve files from the 'public' directory at the root level
const publicPath = path.join(__dirname, '../public');
log.info(`Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// --- API Routes ---
// Mount the API routes under the /api prefix
app.use('/api', apiRoutes);

// --- Catch-all for SPA (Optional, if needed for frontend routing) ---
// If your frontend uses client-side routing, this sends index.html for any non-API routes.
// Ensure this is placed *after* static serving and API routes.
app.get('*', (req, res, next) => {
  // Check if the request is for an API endpoint or a static file path that wasn't found
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
     return next(); // Pass to 404 handler if it's likely an asset/API call
  }
  // Otherwise, serve the main HTML file for client-side routing
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
          // Handle error sending file (e.g., file not found)
          log.error(`Error sending index.html: ${err.message}`);
          next(err); // Pass to the central error handler
      }
  });
});


// --- Central Error Handling ---
// This middleware MUST be defined last, after all other routes and middleware.
app.use(errorHandlerMiddleware);

// --- Log Configuration on Start ---
log.info('Azure OpenAI Configuration Status:');
log.info(`  - API Base: ${AZURE_API_BASE ? '✓ Configured' : '✗ Missing'}`);
log.info(`  - API Key: ${AZURE_API_KEY ? '✓ Configured' : '✗ Missing'}`);
log.info(`  - Deployment: ${DEPLOYMENT_NAME ? `✓ ${DEPLOYMENT_NAME}` : '✗ Missing'}`);
log.info(`  - Model: ${MODEL_NAME}`);
if (!AZURE_API_KEY || !AZURE_API_BASE || !DEPLOYMENT_NAME) {
   log.warn("Azure credentials missing. LLM features will fail.");
}


module.exports = app; // Export the configured app