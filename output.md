## File: /Users/limi/Documents/GitHub/fincrystal/output.md

```python
## File: /Users/limi/Documents/GitHub/fincrystal/README.md

```python
# Financial Crystal Gazer

A retro-themed financial therapist application using metaphorical questions to analyze your financial psyche, powered by Azure OpenAI.

## Description

The Financial Crystal Gazer simulates a 1984-era financial therapy application. It guides users through a 10-question adaptive ritual using metaphorical choices to analyze their financial attitudes, behaviors, and mindset. The application provides insights into the user's relationship with money based on their interactions with the "crystal ball."

**Features:**

*   Retro 80s synthwave aesthetic with dynamic grid background and crystal ball effects.
*   Adaptive questioning engine powered by Azure OpenAI.
*   Analysis of financial psyche parameters (e.g., risk tolerance, urgency) based on metaphorical choices.
*   Asynchronous processing model with status updates via polling.
*   Final comprehensive analysis report after 10 questions.

## Project Structure

```
/financial-crystal/
├── server/                   # All backend-specific code
│   ├── app.js                # Express app configuration (middleware, routes)
│   ├── index.js              # Entry point to start the server (imports app)
│   ├── config/               # Configuration files (e.g., env.js)
│   ├── middleware/           # Custom middleware (e.g., errorHandler.js, requestLogger.js)
│   ├── prompts/              # LLM Prompts used by the backend
│   │   └── sns_msm_prompt.txt
│   ├── routes/               # API route definitions (apiRoutes.js)
│   ├── services/             # Business logic (openaiService.js)
│   └── utils/                # Helper functions (parser.js, logger.js, constants.js)
│
├── public/                   # Static files served directly to the browser
│   ├── index.html            # Main HTML file
│   ├── js/                   # Frontend JavaScript (script.js)
│   ├── css/                  # Frontend CSS (style.css)
│   └── assets/               # Images, fonts, sounds
│
├── tools/                    # Developer utility scripts
│   └── generate-grid.js      # Script to generate the perspective grid background
│
├── .env                      # Local environment variables (ignored by git)
├── .env.example              # Example environment variables
├── .gitignore
├── package.json
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/financial-crystal.git
    cd financial-crystal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: `tools/generate-grid.js` requires `canvas`. If you encounter issues installing `canvas` (it has system dependencies like `cairo`, `pango`, `libjpeg`, `giflib`), you might skip its installation (`npm install --ignore-scripts`) if you don't need to regenerate the grid background, or follow platform-specific instructions for `node-canvas`.*

3.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`.
    *   Update `.env` with your Azure OpenAI credentials (see Azure Integration section below).
4.  **(Optional) Generate Grid Background:**
    If you have `canvas` installed correctly, you can generate/update the background:
    ```bash
    npm run generate:grid
    ```
    This will create `public/assets/grid-bg.png`.

5.  **Start the server:**
    *   For development (with auto-restarting):
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```
6.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000` (or the port specified in `.env`).

## Azure OpenAI Integration

This application requires access to an Azure OpenAI resource.

1.  **Azure Setup:**
    *   Create an Azure OpenAI resource.
    *   Deploy a chat model (e.g., `gpt-35-turbo`, `gpt-4`). Note the **Deployment Name**.
2.  **Credentials:**
    *   Get your Azure OpenAI resource **Endpoint URL** (e.g., `https://your-resource-name.openai.azure.com/`) and an **API Key**.
3.  **Configure `.env` file:**
    Add your credentials and deployment details:
    ```dotenv
    AZURE_API_KEY="your_api_key_here"
    AZURE_API_BASE="https://your-resource-name.openai.azure.com/"
    DEPLOYMENT_NAME="your_deployment_name"
    # AZURE_API_VERSION="2024-05-01-preview" # Optional: Default used if unset
    ```

*Note: LLM features will fail if Azure credentials are missing or invalid.*

## How It Works

1.  **Initiation:** User starts the consultation via the frontend (`public/index.html`).
2.  **Question Request:** Frontend (`public/js/script.js`) sends the current `session_state` to the backend (`POST /api/get_question`).
3.  **Backend Processing:**
    *   Server (`server/routes/apiRoutes.js`) accepts the request, generates a unique `sessionId`, stores the initial state, and responds `202 Accepted` with `{ status: 'processing', sessionId: '...' }`.
    *   In the background, `openaiService.js` formats a prompt and calls Azure OpenAI.
    *   The LLM response is parsed (`server/utils/parser.js`).
    *   The result (or error) is stored associated with the `sessionId`.
4.  **Polling:** Frontend polls `POST /api/get_result?sessionId=...`.
5.  **Result Retrieval:** Backend checks the status for the `sessionId`. If processing, returns `{ status: 'processing' }`. If done, returns the parsed question/analysis data (or error details) and clears the session data.
6.  **UI Update:** Frontend renders the new question/options or final analysis.
7.  **User Selection & State Update:** User selects an option. Frontend updates `session_state` and triggers step 2 again.
8.  **Repeat:** Steps 2-7 repeat for 10 iterations.
9.  **Final Analysis:** After iteration 10, the backend generates and returns the final analysis structure.

## API Endpoints (Backend)

*   `GET /`: Serves the main `index.html` page (via static middleware).
*   `POST /api/get_question`: Initiates background processing for the next question/analysis.
    *   Body: `{ session_state: { iteration: number, history: [...] } }`
    *   Response (202): `{ status: 'processing', sessionId: '...' }`
*   `POST /api/get_result?sessionId=...`: Polls for the result of a processing request.
    *   Body: (Empty)
    *   Response (200 - Processing): `{ status: 'processing', elapsedMs: ... }`
    *   Response (200 - Success): `{ iteration: ..., question: ..., options: [...], images: [...], debugContent: ..., psyche_parameters: {...} }` OR `{ final_analysis: { html: ..., metrics: {...} } }`
    *   Response (4xx/5xx - Error): `{ error: 'ERROR_CODE', message: '...' }`
*   Static Files: Serves all files from the `public/` directory.

## Technologies Used

*   **Backend:** Node.js, Express.js, node-fetch
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **AI:** Azure OpenAI Service
*   **Styling:** Retrowave/Synthwave aesthetic, CSS variables, animations.
*   **Font:** Lazer84

## Credits

*   **Concept & LLM Prompting:** Inspired by metaphorical analysis techniques.
*   **Font:** Lazer84 by Sunrise Digital
*   **Sound Effects:** SoundJay.com
*   **Images:** Unsplash (via source.unsplash.com)
*   **LLM Provider:** Microsoft Azure OpenAI Service

## License

MIT
```



## File: /Users/limi/Documents/GitHub/fincrystal/package.json

```python
{
    "name": "financial-crystal-gazer",
    "version": "1.0.0",
    "description": "Retro financial therapist application using metaphorical questions.",
    "main": "server/index.js",
    "scripts": {
      "start": "node server/index.js",
      "dev": "nodemon server/index.js",
      "lint": "eslint .",
      "generate:grid": "node tools/generate-grid.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
      "financial",
      "therapy",
      "metaphor",
      "retro",
      "openai",
      "azure"
    ],
    "author": "odysseus.bot",
    "license": "MIT",
    "dependencies": {
      "body-parser": "^1.20.2",
      "cors": "^2.8.5",
      "dotenv": "^16.4.5",
      "express": "^4.19.2",
      "helmet": "^7.1.0",
      "node-fetch": "^2.7.0"
    },
    "devDependencies": {
      "@eslint/js": "^9.3.0",
      "canvas": "^2.11.2",
      "eslint": "^9.3.0",
      "globals": "^15.3.0",
      "nodemon": "^3.1.1"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  }
```


## File: /Users/limi/Documents/GitHub/fincrystal/eslint.config.js

```python
// eslint.config.js - Keep the improved version
// @ts-check

import js from "@eslint/js";
// Remove TS-related imports if not using TS anywhere
// import * as importPlugin from "eslint-plugin-import";
import globals from "globals";
// import tseslint from "typescript-eslint";

export default [ // Use array export format for flat config
  { ignores: ["dist", "node_modules", "public/"] }, // Ignore build output, deps, and static frontend assets
  {
    // Apply JS rules to backend JS files
    files: ["server/**/*.js", "tools/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs", // Backend uses CommonJS modules
      globals: {
        ...globals.node, // Use Node.js globals
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn unused vars, ignore args starting with _
      "no-console": "off", // Allow console logging in backend for now
      "require-await": "warn",
      // Add other backend-specific JS rules here if needed
       "semi": ["warn", "always"], // Enforce semicolons (optional style choice)
       "quotes": ["warn", "single", { "avoidEscape": true }] // Prefer single quotes (optional style choice)
    },
  },
  // If you were using TypeScript, the TS-specific config block would go here
  // {
  //   files: ["**/*.{ts,tsx}"],
  //   extends: [...],
  //   languageOptions: {...},
  //   plugins: {...},
  //   settings: {...},
  //   rules: {...},
  // }
];
```

## File: /Users/limi/Documents/GitHub/fincrystal/tools/generate-grid.js

```python
// tools/generate-grid.js
// Generates the perspective grid background image.
// Requires: npm install canvas
// Run: node tools/generate-grid.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // Use node-canvas

const width = 1600; // Adjust size as needed for better quality/aspect ratio
const height = 1000;

function createGridBackground() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- Background ---
  ctx.fillStyle = "#0c0c1e"; // Dark blue/purple
  ctx.fillRect(0, 0, width, height);

  // --- Horizon Glow ---
  const horizonY = height * 0.55; // Horizon line position
  const glowHeight = height * 0.6; // How far down the glow extends
  const gradient = ctx.createLinearGradient(0, horizonY - glowHeight * 0.1, 0, horizonY + glowHeight);
  gradient.addColorStop(0, "rgba(255, 0, 255, 0.0)");  // Fade in magenta near horizon
  gradient.addColorStop(0.15, "rgba(255, 0, 255, 0.18)"); // Peak magenta
  gradient.addColorStop(0.6, "rgba(0, 255, 255, 0.12)");  // Transition to cyan
  gradient.addColorStop(1, "rgba(0, 255, 255, 0.0)");   // Fade out cyan
  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizonY - glowHeight * 0.1, width, glowHeight * 1.1);

  // --- Grid Lines ---
  ctx.strokeStyle = 'rgba(123, 57, 255, 0.35)'; // Grid color (purple), slightly more opaque
  ctx.lineWidth = 1.5; // Grid line thickness

  const vanishingPointX = width * 0.5;
  const numHorizontalLines = 30; // More lines for finer detail
  const numVerticalLines = 60;   // Number of vertical lines spreading from center

  // --- Horizontal Lines (Perspective) ---
  for (let i = 0; i <= numHorizontalLines; i++) {
    const perspectiveFactor = i / numHorizontalLines; // 0 at horizon, 1 near bottom
    // Exponential scaling for perspective (lines get further apart closer to viewer)
    // Adjust power (e.g., 2.0 to 3.0) to change perspective strength
    const yPos = horizonY + Math.pow(perspectiveFactor, 2.8) * (height - horizonY);

    if (yPos > height) continue; // Don't draw below screen

    // Fade out lines further away (closer to horizon), subtle effect
    const alpha = (1 - perspectiveFactor * 0.5) * 0.8; // Base alpha 0.8, fades slightly
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha)); // Clamp alpha 0-1

    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(width, yPos);
    ctx.stroke();
  }

  // --- Vertical Lines (Perspective) ---
  for (let i = 0; i <= numVerticalLines; i++) {
    const perspectiveFactor = Math.abs(i - numVerticalLines / 2) / (numVerticalLines / 2); // 0 at center, 1 at edge
    // Position on horizon - adjust multiplier for spread
    const xPosOnHorizon = vanishingPointX + (i - numVerticalLines / 2) * (width / numVerticalLines * 3.5);

    // Calculate intersection with bottom edge (simple linear perspective)
    // The further from center on horizon, the further out on bottom edge
    const bottomX = vanishingPointX + (xPosOnHorizon - vanishingPointX) * (height / (horizonY || 1)); // Avoid divide by zero

    // Fade out lines towards the edges
    const alpha = (1 - perspectiveFactor * 0.7) * 0.8; // Base alpha 0.8, fades more towards edge
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    ctx.beginPath();
    ctx.moveTo(xPosOnHorizon, horizonY);
    ctx.lineTo(bottomX, height); // Draw line to bottom edge
    ctx.stroke();
  }

  // --- Reset alpha ---
  ctx.globalAlpha = 1.0;

  // --- Save Image ---
  const outputPath = path.join(__dirname, '../public/assets/grid-bg.png'); // Save directly to public/assets
  try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Grid background generated and saved to: ${outputPath}`);
  } catch (error) {
     console.error(`❌ Error saving grid background image to ${outputPath}:`, error);
  }
}

// --- Run Generation ---
try {
  createGridBackground();
} catch (error) {
  console.error("❌ Failed to generate grid background:", error);
  process.exit(1); // Exit with error code if generation fails
}
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/index.js

```python
// server/index.js - Server Entry Point
const http = require('http');
const app = require('./app'); // Import the configured Express app
const { PORT } = require('./config/env');
const log = require('./utils/logger');

const server = http.createServer(app);

server.listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`);
  // Log configuration status moved to app.js or env.js if needed on start
});

// Optional: Handle server errors gracefully
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown (optional but good practice)
process.on('SIGTERM', () => {
    log.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        log.info('HTTP server closed');
        // Perform any other cleanup here
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        log.info('HTTP server closed');
        process.exit(0);
    });
});
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/app.js

```python
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
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/middleware/errorHandler.js

```python
// server/middleware/errorHandler.js
const log = require('../utils/logger');
const { NODE_ENV } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');

function errorHandlerMiddleware(err, req, res, next) {
    // Log the error internally
    log.error(`Error occurred for ${req.method} ${req.path}:`, err);

    // Determine status code - use error's statusCode if available, otherwise 500
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

    // Determine error code - use error's code if available
    const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;

    // Determine message - use error's message, fallback to generic message
    let message = err.message || 'An unexpected internal server error occurred.';
    // Avoid exposing sensitive internal details in production
    if (NODE_ENV !== 'development' && statusCode >= 500) {
        message = 'An internal server error occurred. Please try again later.';
    }

    res.status(statusCode).json({
        error: errorCode,
        message: message,
        // Optionally include details (like stack trace) in development environment only
        details: NODE_ENV === 'development' ? (err.details || err.stack) : undefined
    });
}

module.exports = errorHandlerMiddleware;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/middleware/requestLogger.js

```python
// server/middleware/requestLogger.js
const log = require('../utils/logger');

function requestLoggerMiddleware(req, res, next) {
    const sessionId = req.query?.sessionId || req.body?.sessionId || 'N/A';
    log.request(req, sessionId);
    next();
}

module.exports = requestLoggerMiddleware;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/config/env.js

```python
// server/config/env.js - Load and manage environment variables
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 3000,
    AZURE_API_KEY: process.env.AZURE_API_KEY,
    AZURE_API_BASE: process.env.AZURE_API_BASE,
    DEPLOYMENT_NAME: process.env.DEPLOYMENT_NAME,
    MODEL_NAME: process.env.MODEL_NAME || 'gpt-35-turbo', // Your preferred default
    AZURE_API_VERSION: process.env.AZURE_API_VERSION || '2024-05-01-preview',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Add other configuration variables as needed
    PROCESSING_TIMEOUT_MS: parseInt(process.env.PROCESSING_TIMEOUT_MS || '300000', 10), // 5 minutes
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
    RETRY_DELAY_MS: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/utils/constants.js

```python
// server/utils/constants.js - Define shared constants

const ERROR_CODES = {
    // Client Errors (4xx)
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',           // 404
    SESSION_STATE_REQUIRED: 'SESSION_STATE_REQUIRED', // 400
    INVALID_SESSION_STATE: 'INVALID_SESSION_STATE',   // 400
    INVALID_ITERATION: 'INVALID_ITERATION',           // 400
    MISSING_SESSION_ID: 'MISSING_SESSION_ID',         // 400

    // Server Errors (5xx)
    PROCESSING_ERROR: 'PROCESSING_ERROR',             // 500 (Generic backend processing error)
    INTERNAL_ERROR: 'INTERNAL_ERROR',                 // 500 (Generic unexpected server error)
    PARSING_FAILURE: 'PARSING_FAILURE',               // 502 (Error parsing LLM response)
    LLM_API_ERROR: 'LLM_API_ERROR',                   // 502 (Error calling Azure OpenAI API)
    MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',       // 500 (Server config error)
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',                   // 504 (Processing took too long)
    FINAL_ANALYSIS_FAILURE: 'FINAL_ANALYSIS_FAILURE', // 500 or 502 (Error during final analysis generation)
    NETWORK_ERROR: 'NETWORK_ERROR',                   // 503/504 (Fetch/network issues talking to Azure)
    FETCH_ERROR: 'FETCH_ERROR',                       // 500 (Generic fetch error)
    INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE'      // 502 (Bad response content type from upstream)
};

module.exports = {
    ERROR_CODES,
    // Add other constants here, e.g., MAX_QUESTIONS = 10
    MAX_QUESTIONS: 10,
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/utils/logger.js

```python
// server/utils/logger.js - Centralized logging utility

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
  
    fg: {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m", // Parsing
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",   // LLM
      white: "\x1b[37m",
      orange: "\x1b[38;5;214m", // Warnings
      gray: "\x1b[90m"    // Dividers
    },
    bg: {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      cyan: "\x1b[46m",
      white: "\x1b[47m",
      gray: "\x1b[100m"
    }
  };
  
  // Function to format messages with timestamps and levels
  function formatMessage(levelColor, levelTag, msg, details) {
      const timestamp = new Date().toISOString();
      let logMsg = `${colors.fg.gray}[${timestamp}]${colors.reset} ${levelColor}[${levelTag}]${colors.reset} ${msg}`;
      if (details) {
          if (details instanceof Error) {
              logMsg += `\n${colors.fg.red}${details.stack || details.message}${colors.reset}`;
          } else if (typeof details === 'object') {
              logMsg += `\n${JSON.stringify(details, null, 2)}`;
          } else {
              logMsg += `\n${details}`;
          }
      }
      return logMsg;
  }
  
  const log = {
    llm: (msg) => console.log(formatMessage(colors.fg.cyan, 'LLM', msg)),
    parse: (msg) => console.log(formatMessage(colors.fg.yellow, 'PARSE', msg)),
    error: (msg, error = '') => console.error(formatMessage(colors.fg.red, 'ERROR', msg, error)),
    info: (msg) => console.log(formatMessage(colors.fg.green, 'INFO', msg)),
    warn: (msg) => console.warn(formatMessage(colors.fg.orange, 'WARN', msg)),
    debug: (msg) => { // Only log debug messages if NODE_ENV is 'development'
        if (process.env.NODE_ENV === 'development') {
            console.debug(formatMessage(colors.fg.magenta, 'DEBUG', msg));
        }
    },
    divider: () => console.log(`${colors.fg.gray}──────────────────────────────────────────────────────────────${colors.reset}`),
    request: (req, sessionId = 'N/A') => {
        const ip = req.ip || req.connection?.remoteAddress;
        console.log(formatMessage(colors.fg.blue, 'HTTP', `${req.method} ${req.originalUrl} - Session: ${sessionId} - IP: ${ip}`));
    }
  };
  
  module.exports = log;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/utils/parser.js

```python
// server/utils/parser.js - Functions for parsing LLM responses
const log = require('./logger'); // Use the centralized logger
const { ERROR_CODES } = require('./constants');

// Helper to generate placeholder image URLs
function generateImages(options) {
    if (!Array.isArray(options)) return [];
    return options.map(option => {
      // Simple kebab-case conversion for keyword
      const keyword = String(option).toLowerCase()
                        .replace(/[^a-z0-9\s]+/g, '') // Remove non-alphanumeric/space chars
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .trim();
      // Use a placeholder service or default keyword if conversion fails
      return `https://source.unsplash.com/300x200/`;
    });
}

// Extracts psyche parameters from the debug reasoning text
function extractPsycheParameters(debugText) {
    if (!debugText) return {};
    log.parse("Extracting psyche parameters from debug text...");
    // <<< DEBUG LOGGING START >>>
    log.debug(`--- Full Debug Text ---\n${debugText}\n------------------------`);
    // <<< DEBUG LOGGING END >>>
    const paramMappings = {};
    let blockages = [];

    try {
        // Regex for mappings: "metaphor" -> {"key": value, ...} or 'metaphor' -> ... or metaphor -> ...
        // Improved to handle multi-line JSON-like structures more reliably
        const mappingRegex = /^\s*(?:\d+\.\s*)?(['"]?)(.*?)\1\s*→\s*(\{[\s\S]*?\})\s*(?:\[.*?\]|\/\/.*)?(?=\n|$)/gm;
        let match;
        let matchIndex = 0;

        while ((match = mappingRegex.exec(debugText)) !== null) {
          matchIndex++;
          const metaphorNameRaw = match[2] || `__UNKNOWN_METAPHOR_${matchIndex}__`;
          // Trim extra whitespace AND specifically remove potential quotes *if* group 1 didn't capture them
          // This handles cases where quotes might be inside the non-greedy match accidentally
          const metaphor = metaphorNameRaw.trim().replace(/^"|"$/g, '').toLowerCase();
          const paramsJsonText = match[3]?.trim() || '{}';

          log.debug(`[Match ${matchIndex}] Regex Captured Raw Metaphor: "${match[2]}" (Processed: "${metaphor}")`);
          log.debug(`[Match ${matchIndex}] Regex Captured JSON Text:\n${paramsJsonText}\n------------------------`);

          try {
              let correctedJson = paramsJsonText
                  // Be more aggressive removing potential non-JSON bits AFTER the last }
                  // Try finding the last '}' and taking only stuff before it? Risky.
                  // Let's focus on cleaning known patterns first.
                  .replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":') // Quote keys
                  .replace(/:\s*'((?:\\.|[^'\\])*)'/g, ': "$1"') // Fix single-quoted values
                  .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
                  .replace(/\s*\/\/.*$/gm, '') // Remove // comments
                  .replace(/\s*\[.*?\]\s*$/gm, '') // Remove [...] comments at end of lines
                  .trim(); // Trim whitespace again

              log.debug(`[Match ${matchIndex}] Corrected JSON Text Attempt: [${correctedJson}]`);

              if (correctedJson === '{}') {
                 log.warn(`[Match ${matchIndex}] Captured JSON text was empty for metaphor "${metaphor}". Skipping.`);
                 continue;
              }

              // More robust check: Does it look like a valid JSON object?
               // Basic check: Starts with { ends with }, and doesn't contain another { or } unexpectedly in the middle?
               // This isn't perfect but might catch some over-captures.
               const bracketBalance = (correctedJson.match(/{/g)?.length === correctedJson.match(/}/g)?.length);
               if (correctedJson.startsWith('{') && correctedJson.endsWith('}') && bracketBalance) {
                  const params = JSON.parse(correctedJson);
                  // Check if the value for the metaphor is already set, log warning if overwriting
                  if (paramMappings[metaphor]) {
                      log.warn(`[Match ${matchIndex}] Overwriting existing params for duplicate metaphor key "${metaphor}"`);
                  }
                  paramMappings[metaphor] = params;
                  log.parse(`[Match ${matchIndex}] Successfully Parsed Params for "${metaphor}": ${JSON.stringify(params)}`);
              } else {
                  log.warn(`[Match ${matchIndex}] Malformed JSON structure for metaphor "${metaphor}". Initial char: ${correctedJson.charAt(0)}, Final char: ${correctedJson.charAt(correctedJson.length-1)}, Bracket balance: ${bracketBalance}. Raw/Corrected logged above.`);
              }
          } catch (e) {
               log.warn(`[Match ${matchIndex}] JSON Parse FAILED for metaphor "${metaphor}" (Corrected Text logged above). Error: ${e.message}`);
          }
      }
       if (matchIndex === 0) {
           log.warn("Mapping Regex found ZERO matches in the debug text.");
       }
      // <<< DEBUG LOGGING END >>>

        // --- Blockage Parsing (Keep As Is - Seems to work) ---
        const blockageRegex = /(['"]?)blockage(?:s)?\1\s*:\s*(?:(\[[^\]]*\])|(['"]?)([\w\s-]+)\3)/gi;
        while ((match = blockageRegex.exec(debugText)) !== null) {
             if (match[2]) { /* ... */ } else if (match[4]) { /* ... */ }
             // Simplified blockage adding
             const foundBlockages = match[2]
                 ? match[2].replace(/[\[\]"']/g, '').split(',').map(item => item.trim()).filter(Boolean)
                 : [match[4]?.trim()].filter(Boolean);
             blockages = blockages.concat(foundBlockages);
        }
        blockages = [...new Set(blockages.filter(b => b.length > 0))];
        if (blockages.length > 0) {
             log.parse(`Identified blockages: ${blockages.join(', ')}`);
             paramMappings['_blockages'] = blockages;
        }

    } catch (error) {
        log.error("Exception during psyche parameter extraction:", error);
    }
    const successfulParses = Object.keys(paramMappings).filter(k => k !== '_blockages').length;
    log.parse(`Finished parameter extraction. Total Metaphor Mappings Parsed Successfully: ${successfulParses}`);
    if (successfulParses < 7 && successfulParses > 0) { // Log if partially successful
       log.warn(`Expected 7 parameter mappings, but only parsed ${successfulParses}.`);
    }
    return paramMappings;
}


// Parses the main question/options block
function parseQuestionContent(text, expectedIteration) {
    log.parse(`Attempting to parse question content (expected iter: ${expectedIteration})...`);
    try {
      // Regex with 's' flag for multiline content, non-greedy match for question text
      const questionMatch = text.match(/<question\s+iteration="(\d+)"\s*>(.*?)<\/question>/is);
      if (!questionMatch?.[2]) {
        log.parse("No valid <question iteration=\"N\">...</question> tag found.");
        return null;
      }

      const iteration = parseInt(questionMatch[1], 10);
      if (isNaN(iteration)) {
           log.warn("Parsed iteration number is invalid.");
           // Decide how to handle - fail or use expected? Failing for now.
           return null;
      }

      // Log warning if iteration mismatch, but proceed using parsed value
      if (iteration !== expectedIteration) {
          log.warn(`Parsed iteration ${iteration} does not match expected iteration ${expectedIteration}. Using parsed value.`);
      }

      const question = questionMatch[2].trim();
      log.parse(`Found question (Parsed Iteration ${iteration}): "${question.substring(0, 60)}..."`);

      // Robust options parsing: Find section, then extract numbered lines
      const optionsMatch = text.match(/##\s*Metaphorical\s*Options\s*:(.*?)(?:🔸\s*\*\*Debug Reasoning\*\*|<!--|<final_analysis>|$)/is);
      if (!optionsMatch?.[1]) {
        log.parse("Could not find '## Metaphorical Options:' section or it was empty.");
        return null; // Options are essential
      }

      const optionsText = optionsMatch[1].trim();
      // Match lines starting with number(s)+dot+space, capture everything after until next number+dot or end-of-string/section
      const optionLines = optionsText.match(/^\s*\d+\.\s*(.*?)(?=\s*\n\s*\d+\.|\s*$)/gm);

      if (!optionLines || optionLines.length === 0) {
          log.warn("Could not extract any numbered option lines from the options section.");
          log.parse(`Options text was:\n${optionsText}`);
          return null;
      }

      const options = optionLines.map(line => line.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean);

      log.parse(`Found ${options.length} potential options.`);
      if (options.length !== 7) {
        log.error(`OPTION COUNT ERROR! Found ${options.length}, expected 7.`);
        log.parse(`Raw options text analyzed:\n${optionsText}`);
        // Return null because 7 options are required by the frontend logic
        return null;
      }

      // Extract debug reasoning, stopping at final_analysis or end
      const debugMatch = text.match(/🔸\s*\*\*Debug Reasoning\*\*:\s*([\s\S]*?)(?:<final_analysis>|$)/i); // Use [\s\S]*? for multiline non-greedy
      const debugContent = debugMatch?.[1]?.trim() || ""; // Use optional chaining and provide default
      log.parse(`Found debug reasoning: ${debugContent.length > 0 ? debugContent.substring(0, 100) + '...' : 'Empty'}`);

      const psycheParams = extractPsycheParameters(debugContent);
      const images = generateImages(options); // Generate images based on parsed options

      return {
        iteration, // Use the iteration number parsed from the tag
        question,
        options,
        images,
        debugContent, // Raw debug content for potential display/logging
        psyche_parameters: psycheParams // Parsed parameters
      };

    } catch (error) {
      log.error(`Exception during question content parsing:`, error);
      return null; // Indicate failure
    }
}

// Parses the final analysis block
function parseFinalAnalysis(text) {
    log.parse("Attempting to parse final analysis block...");
    try {
      // Use 's' flag for multiline, non-greedy match
      const finalAnalysisMatch = text.match(/<final_analysis>(.*?)<\/final_analysis>/is);
      if (!finalAnalysisMatch?.[1]) {
        log.parse("No <final_analysis>...</final_analysis> tags found.");
        return null;
      }
      const analysisContent = finalAnalysisMatch[1].trim();
      log.parse(`Found final analysis content (length: ${analysisContent.length}).`);

      // Extract structured metrics (make regex more robust and case-insensitive)
      const alignmentMatch = analysisContent.match(/ALIGNMENT SCORE:\s*\[?(\d+(?:\.\d+)?)\s*%?\s*\]?/i);
      const trustMatch = analysisContent.match(/TRUST_LEVEL:\s*\[?(\d+(?:\.\d+)?)\s*%?\s*\]?/i);
      // Example: Extract TENSION_PROFILE (assuming it's a list)
      const tensionMatch = analysisContent.match(/TENSION_PROFILE:\s*\[?([^\]\n]+)\]?/i); // Simple capture, might need refinement

      const structuredAnalysis = {
        html: analysisContent, // The full content for rendering
        metrics: {
          alignment_score: alignmentMatch ? parseFloat(alignmentMatch[1]) : null,
          trust_level: trustMatch ? parseFloat(trustMatch[1]) : null,
          tension_profile: tensionMatch ? tensionMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [], // Example parsing
          // Add other metrics here as needed
        }
      };

      log.parse(`Parsed metrics: Alignment=${structuredAnalysis.metrics.alignment_score ?? 'N/A'}, Trust=${structuredAnalysis.metrics.trust_level ?? 'N/A'}`);
      return structuredAnalysis;
    } catch (error) {
      log.error(`Exception during final analysis parsing:`, error);
      return null;
    }
}

// Main parser function called by the service
function parseStructuredOutput(completion, expectedIteration) {
    log.parse(`Starting structured parsing for expected iteration ${expectedIteration}...`);
    let result = {};
    let parseError = null;

    try {
        // 1. Extract and log <think> block (doesn't affect parsing result object)
        const thinkMatch = completion.match(/<think>([\s\S]*?)<\/think>/is);
        if (thinkMatch?.[1]) {
          log.llm(`LLM Reasoning:\n${thinkMatch[1].trim()}`);
        }
        // Parse content *after* the think block if it exists
        const contentToParse = thinkMatch ? completion.substring(thinkMatch[0].length) : completion;
        log.parse(`Content for parsing (first 200 chars):\n${contentToParse.substring(0, 200)}...`);

        // 2. Attempt to parse question content
        const questionData = parseQuestionContent(contentToParse, expectedIteration);
        if (questionData) {
            Object.assign(result, questionData);
            log.parse(`Successfully parsed question content for iteration ${questionData.iteration}.`);
        } else {
            log.warn(`Could not parse standard question structure for expected iteration ${expectedIteration}.`);
            // Don't fail yet, it might be *only* a final analysis response
        }

        // 3. Attempt to parse final analysis (relevant for Q10 or if question parse failed)
        const finalAnalysisData = parseFinalAnalysis(contentToParse);
        if (finalAnalysisData) {
            result.final_analysis = finalAnalysisData; // Add { html: ..., metrics: ... }
            log.parse("Successfully parsed final analysis content.");
        }

        // 4. Validation: Check if we got what we expected
        if (!result.question && !result.final_analysis) {
            // If neither part was parsed successfully
            parseError = new Error("Parsing failed: No valid question or final analysis found in LLM output.");
            log.error(parseError.message);
        } else if (result.question && (!result.options || result.options.length !== 7)) {
            // If question was expected/found, but options are wrong
            parseError = new Error(`Parsing failed: Question found, but expected 7 options, got ${result.options?.length || 0}.`);
            log.error(parseError.message);
        } else if (!result.question && expectedIteration < 10 && result.final_analysis) {
            // Unexpected final analysis before Q10
            log.warn(`Unexpected final analysis found before iteration 10 (expected ${expectedIteration}).`);
            // Decide if this is an error or just unexpected structure
            // parseError = new Error("Unexpected final analysis received before final iteration.");
        } else if (result.question && expectedIteration === 10 && !result.final_analysis) {
             // Q10 but no final analysis included
             log.warn(`Expected final analysis for iteration 10, but it was not found in the response.`);
             // This might be okay if the analysis is generated separately, but the prompt asks for it here.
        }

    } catch (error) {
        log.error("Exception during main structured parsing execution:", error);
        parseError = error; // Assign the caught exception
    }

    // 5. Handle Parsing Failure
    if (parseError) {
        parseError.code = ERROR_CODES.PARSING_FAILURE;
        parseError.statusCode = 502; // Indicate upstream parsing issue
        // Maybe try legacy parser as a last resort? Currently throwing.
        // log.warn("Falling back to legacy parser due to structured parsing error...");
        // try { result = parseCompletionToQuestionFormat(completion, { iteration: expectedIteration - 1}); } catch { throw parseError; } // If legacy also fails, throw original
        throw parseError; // Throw the parsing error to be caught by the service
    }

    // 6. Post-processing (e.g., ensure images exist if options do)
    if (result.options && !result.images) {
        log.warn("Generating fallback images as they were missing after parsing.");
        result.images = generateImages(result.options);
    }

    log.parse("Structured parsing completed successfully.");
    return result;
}


// --- Legacy Parser (Optional Fallback) ---
// Kept minimal, as structured parsing should be the primary path
function parseCompletionToQuestionFormat(completion, session_state) {
    log.warn("Using legacy parser as fallback.");
    try {
      const questionMatch = completion.match(/<question iteration="(\d+)">(.*?)<\/question>/is);
      const iteration = questionMatch ? parseInt(questionMatch[1]) : (session_state?.iteration || 0) + 1;
      const question = questionMatch ? questionMatch[2].trim() : "Fallback: Describe your financial state metaphorically?";

      const optionsSection = completion.match(/## Metaphorical Options:(.*?)(?:🔸|<!--|$)/is);
      let options = [];
      if (optionsSection?.[1]) {
        options = optionsSection[1].trim().split('\n')
          .map(line => line.replace(/^\s*\d+\.\s*/, '').trim())
          .filter(Boolean);
      }

      if (options.length !== 7) {
         log.error(`Legacy Parser: Option count mismatch (${options.length}). Padding/truncating.`);
         while(options.length < 7) options.push(`Placeholder ${options.length + 1}`);
         options = options.slice(0, 7);
      }

      const debugMatch = completion.match(/🔸\s*\*\*Debug Reasoning\*\*:\s*([\s\S]*?)(?:<final_analysis>|$)/i);
      const debugContent = debugMatch ? debugMatch[1].trim() : "Debug info unavailable.";

      const images = generateImages(options);
      const psycheParams = extractPsycheParameters(debugContent);

      return { iteration, question, options, images, debugContent, psyche_parameters: psycheParams };
    } catch (error) {
      log.error("Error in legacy parser:", error);
      const legacyParseError = new Error("Failed to parse completion using legacy method.");
      legacyParseError.code = ERROR_CODES.PARSING_FAILURE;
      throw legacyParseError; // Throw error if legacy parsing fails
    }
}


module.exports = {
    parseStructuredOutput,
    parseQuestionContent, // Export if needed for testing
    parseFinalAnalysis,   // Export if needed for testing
    extractPsycheParameters, // Export if needed for testing
    generateImages,         // Export if needed for testing
    // parseCompletionToQuestionFormat // Optionally export legacy parser
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/routes/apiRoutes.js

```python
// server/routes/apiRoutes.js
const express = require('express');
const crypto = require('crypto');
const { PROCESSING_TIMEOUT_MS } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');
const log = require('../utils/logger');
const { generateQuestion, generateFinalAnalysis } = require('../services/openaiService');

const router = express.Router();

// In-memory store for processing state - could be replaced with Redis or similar
const processingQueue = new Map();

// Function to clean up timed-out entries
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of processingQueue.entries()) {
    if (session.processing && now - session.startTime > PROCESSING_TIMEOUT_MS) {
      log.warn(`Session ${sessionId} timed out and marked as error.`);
      // Update session to indicate timeout error instead of deleting immediately
      processingQueue.set(sessionId, {
        ...session,
        processing: false,
        error: true,
        errorCode: ERROR_CODES.TIMEOUT_ERROR,
        errorMessage: `Processing timed out after ${PROCESSING_TIMEOUT_MS / 1000} seconds.`
      });
    }
    // Clean up very old non-processing entries (e.g., > 2*timeout)
    else if (!session.processing && now - session.startTime > PROCESSING_TIMEOUT_MS * 2) {
        log.info(`Cleaning up old session entry: ${sessionId}`);
        processingQueue.delete(sessionId);
    }
  }
}, 60 * 1000); // Check every minute


// --- Route Handlers ---

// Initiate question generation
router.post('/get_question', async (req, res, next) => {
    const { session_state } = req.body;

    // --- Input Validation ---
    if (!session_state) {
      return res.status(400).json({
        error: ERROR_CODES.SESSION_STATE_REQUIRED,
        message: "Missing session_state in request body"
      });
    }
    if (typeof session_state?.iteration !== 'number' || session_state.iteration < 0) {
      return res.status(400).json({
        error: ERROR_CODES.INVALID_ITERATION,
        message: "session_state.iteration must be a non-negative number"
      });
    }
     if (!Array.isArray(session_state?.history)) {
        return res.status(400).json({
         error: ERROR_CODES.INVALID_SESSION_STATE,
         message: "session_state.history must be an array"
       });
     }
     // Add more detailed validation of history items if needed

    const sessionId = crypto.randomBytes(8).toString('hex');

    try {
        // Store initial processing state
        processingQueue.set(sessionId, {
          processing: true,
          startTime: Date.now(),
          session_state: JSON.parse(JSON.stringify(session_state)), // Deep copy state
        });

        // Respond immediately that processing has started
        res.status(202).json({ // 202 Accepted
          status: "processing",
          sessionId
        });

        // --- Start Background Processing ---
        // Do not await this call
        processRequest(sessionId, session_state)
          .catch(error => {
             // Catch errors during the async background process
             log.error(`Background processing failed for session ${sessionId}:`, error);
             processingQueue.set(sessionId, {
               ...processingQueue.get(sessionId), // Keep original info like startTime
               processing: false,
               error: true,
               errorCode: error.code || ERROR_CODES.PROCESSING_ERROR,
               errorMessage: error.message || "An unknown error occurred during processing."
             });
          });

    } catch (error) {
        log.error("Error initiating /api/get_question:", error);
        next(error); // Pass to central error handler
    }
});

// Consolidated processing logic called in the background
async function processRequest(sessionId, session_state) {
    const iteration = session_state?.iteration || 0;
    let result;

    log.info(`Starting background processing for session ${sessionId}, iteration ${iteration + 1}`);

    try {
        if (iteration >= 10) {
            result = await generateFinalAnalysis(session_state);
        } else {
            result = await generateQuestion(session_state);
        }

        // Update queue with successful result
        processingQueue.set(sessionId, {
            ...processingQueue.get(sessionId), // Keep startTime, etc.
            processing: false,
            result // Store the successful result
        });
        log.info(`Processing finished successfully for session ${sessionId}`);

    } catch (error) {
        log.error(`Error during background task for session ${sessionId}:`, error);
        // Let the catch block in the calling route handle updating the queue with error state
        throw error; // Re-throw the error so the .catch() in the route handler picks it up
    }
}

// Get the result of processing
router.post('/get_result', (req, res, next) => {
    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({
            error: ERROR_CODES.MISSING_SESSION_ID,
            message: "sessionId query parameter is required"
        });
    }

    if (!processingQueue.has(sessionId)) {
        // Session might be invalid, expired, or already retrieved
        return res.status(404).json({
            error: ERROR_CODES.SESSION_NOT_FOUND,
            message: "Session not found. It may have expired, timed out, or is invalid."
        });
    }

    const session = processingQueue.get(sessionId);

    if (session.processing) {
        // Still processing
        return res.status(200).json({ // 200 OK, status indicates processing
            status: "processing",
            elapsedMs: Date.now() - session.startTime
        });
    }

    // --- Processing is finished ---

    // Important: Remove the session from the queue *after* retrieving its final state
    processingQueue.delete(sessionId);
    log.info(`Session ${sessionId} result retrieved and removed from queue.`);

    if (session.error) {
        // Processing finished with an error
        log.error(`Returning error for session ${sessionId}: ${session.errorMessage}`);
        // Use a status code appropriate for the error type if possible
        const statusCode = (session.errorCode === ERROR_CODES.LLM_API_ERROR || session.errorCode === ERROR_CODES.PARSING_FAILURE) ? 502 : 500;
        return res.status(statusCode).json({
            error: session.errorCode || ERROR_CODES.PROCESSING_ERROR,
            message: session.errorMessage || "An error occurred while processing your request."
        });
    }

    // Processing finished successfully - return the result
    return res.json(session.result);
});

// Optional: Status check endpoint (alternative to polling /get_result)
router.get('/status', (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({
        error: ERROR_CODES.MISSING_SESSION_ID,
        message: "sessionId query parameter is required",
        processing: false // Indicate not processing if no ID
      });
    }

    if (!processingQueue.has(sessionId)) {
      // Consistent response: if not found, it's not processing
      return res.json({ processing: false });
    }

    const session = processingQueue.get(sessionId);
    res.json({
        processing: session.processing,
        elapsedMs: Date.now() - session.startTime
        // Don't return error/result here, keep this endpoint simple
    });
});


module.exports = router;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/services/openaiService.js

```python
// server/services/openaiService.js
const fetch = require('node-fetch'); // Use v2 if using CommonJS: npm install node-fetch@2
const fs = require('fs');
const path = require('path');
const { AZURE_API_KEY, AZURE_API_BASE, DEPLOYMENT_NAME, MODEL_NAME, AZURE_API_VERSION, MAX_RETRIES, RETRY_DELAY_MS } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');
const log = require('../utils/logger');
const { parseStructuredOutput, parseFinalAnalysis: parseFinalAnalysisUtil } = require('../utils/parser');

// --- Azure API Call ---
async function callAzureOpenAI(messages, options = {}, retries = MAX_RETRIES) {
    if (!AZURE_API_KEY || !AZURE_API_BASE || !DEPLOYMENT_NAME) {
      const error = new Error("Azure OpenAI credentials not configured in .env file.");
      error.code = ERROR_CODES.MISSING_CREDENTIALS;
      error.statusCode = 500; // Internal server configuration error
      throw error;
    }

    // Construct the correct URL format for Azure OpenAI
    const url = `${AZURE_API_BASE}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_API_VERSION}`;

    // ******** CORE CHANGE HERE ********
    // Use max_completion_tokens instead of max_tokens
    const payload = {
      messages,
      //temperature: options.temperature ?? 0.3,
      // Use the correct parameter name from the options object or default
      max_completion_tokens: options.max_completion_tokens ?? 4000,
      model: options.model || MODEL_NAME, // Pass model if needed by Azure (often determined by deployment)
      // stream: false, // Ensure streaming is off if not handling it
      // Add other parameters supported by your specific model/API version if needed
    };
    // Remove the old parameter if it somehow exists in options, just in case
    // Although we control the options passed in, this adds robustness
    if ('max_tokens' in options) {
        log.warn("Deprecated 'max_tokens' found in options, ignoring.");
        // delete payload.max_tokens; // Not needed as we build payload fresh
    }

    const body = JSON.stringify(payload);

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_API_KEY
        },
        body: body,
        // timeout: 30000 // Optional: Add a request timeout (e.g., 30 seconds)
    };

    log.llm(`Calling Azure OpenAI: ${url} (Model via Deployment: ${DEPLOYMENT_NAME})`);
    // log.debug(`Payload: ${body}`); // Be cautious logging full payloads

    try {
      const response = await fetch(url, requestOptions);
      const responseBody = await response.text(); // Read body as text first for better error diagnosis

      if (!response.ok) {
            log.error(`Azure OpenAI API Error (${response.status}): ${response.statusText}`);
            log.error(`Response Body: ${responseBody}`);
            let errorData = {};
            try { errorData = JSON.parse(responseBody); } catch (e) { /* Ignore JSON parse error */ }

            // Check if the specific error indicates the parameter issue again
            if (errorData.error?.code === 'unsupported_parameter' && errorData.error?.param === 'max_tokens') {
                 // This indicates the fix might not have been applied correctly or cached?
                 log.error("FATAL: Still getting 'max_tokens' error despite code change. Check deployment/cache.");
                 // Don't retry for this specific fatal error if the code *should* be fixed.
                 const error = new Error(errorData.error?.message || `Azure API parameter error with status ${response.status}`);
                 error.code = ERROR_CODES.LLM_API_ERROR;
                 error.details = errorData;
                 error.statusCode = response.status;
                 throw error; // Throw immediately
            }

            // Handle rate limits (429) or general server errors (5xx) for retries
            if ((response.status === 429 || response.status >= 500) && retries > 0) {
              log.warn(`Retrying Azure API call due to status ${response.status} (${retries} retries left)...`);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
              return callAzureOpenAI(messages, options, retries - 1); // Ensure options are passed correctly
            }

            // Throw a structured error for non-retried failures
            const error = new Error(errorData.error?.message || `Azure API request failed with status ${response.status}: ${response.statusText}`);
            error.code = ERROR_CODES.LLM_API_ERROR;
            error.details = errorData;
            error.statusCode = response.status; // Propagate HTTP status code
            throw error;
      }

      // Parse the successful JSON response
      const data = JSON.parse(responseBody);

      // Validate response structure
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
         log.error("Invalid response structure from Azure OpenAI:", data);
         const error = new Error("Received invalid or empty response from LLM.");
         error.code = ERROR_CODES.LLM_API_ERROR;
         error.statusCode = 502; // Bad Gateway - upstream error
         throw error;
      }

      const completion = data.choices[0].message.content;
      log.llm(`Received raw response snippet: ${completion.substring(0, 150)}...`);
      log.divider();
      return completion; // Return only the content string

    } catch (error) {
      // Catch fetch errors (network issues) or errors thrown above
      if (error.code !== ERROR_CODES.LLM_API_ERROR && error.code !== ERROR_CODES.MISSING_CREDENTIALS && retries > 0) {
         log.warn(`Network or fetch error during API call. Retrying (${retries} retries left)...`, error.message);
         await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
         return callAzureOpenAI(messages, options, retries - 1);
      }

      log.error('Failed to call Azure OpenAI after retries:', error);
      // Ensure the error has a code and potentially a statusCode if not already set
      if (!error.code) error.code = ERROR_CODES.LLM_API_ERROR;
      if (!error.statusCode) error.statusCode = 502; // Default to 502 for upstream failures
      throw error; // Re-throw the error after handling retries
    }
}

// --- Prompt Generation --- (Keep existing functions getSystemPrompt, createQuestionPrompt, createFinalAnalysisPrompt)
function getSystemPrompt() {
    const promptPath = path.join(__dirname, '../prompts', 'sns_msm_prompt.txt');
    try {
      if (!fs.existsSync(promptPath)) {
        log.warn(`Prompt file not found at ${promptPath}. Using fallback.`);
        throw new Error("Prompt file missing");
      }
      const promptTemplate = fs.readFileSync(promptPath, 'utf8');
      return promptTemplate.trim();
    } catch (error) {
      log.error("Error reading system prompt template:", error);
      // Fallback system prompt (keep concise)
      return "You are a 1984-era financial therapist using metaphors. Conduct a 10-question adaptive ritual. Respond ONLY in the specified XML-like format: <think>...</think> <question iteration=\"N\">...</question> ## Metaphorical Options:\n1. ...\n7. ...\n🔸 **Debug Reasoning**: ...";
    }
}

function createQuestionPrompt(session_state) {
    const iteration = session_state?.iteration || 0;
    const history = session_state?.history || [];

    let historyPrompt = "";
    if (history.length > 0) {
      historyPrompt = "User's session history so far:\n\n";
      history.forEach(item => {
        // Ensure essential items are present before adding to prompt
        if (item.iteration && item.question && item.metaphor) {
           historyPrompt += `Q${item.iteration}: ${item.question}\n`;
           historyPrompt += `User chose: "${item.metaphor}"\n`;
           // Include parameters if they were stored and seem useful
           if (item.parameters && Object.keys(item.parameters).length > 0) {
              historyPrompt += `Implied Parameters: ${JSON.stringify(item.parameters)}\n`;
           }
           if (item.avoided_metaphors && item.avoided_metaphors.length > 0) {
              historyPrompt += `Avoided: ${item.avoided_metaphors.join(', ')}\n`;
           }
           historyPrompt += "\n";
        }
      });
    }

    const finalAnalysisInstruction = iteration === 9
    ? "\n\nFINAL STEP: Generate the standard response block for Question 10 first (think, question, options, debug). IMMEDIATELY FOLLOWING that block, generate the final analysis, wrapping it ONLY in <final_analysis> tags and including the DEBUG LEDGER inside."
    : "";

    // Construct the user prompt for the LLM
    return `Continue the financial psyche analysis ritual. This is question #${iteration + 1} of 10.
Base your response STRICTLY on the user's history and your internal reasoning.

${historyPrompt}
Required Output Format:
1.  A <think> block explaining your reasoning for the question and options.
2.  A <question iteration="${iteration + 1}"> tag containing the question text.
3.  A "## Metaphorical Options:" section with exactly 7 numbered options.
4.  A "🔸 **Debug Reasoning**:" section detailing the psyche parameters mapped to each option (e.g., "volcano" → {"risk_tolerance": 0.8, "urgency": 0.7}). Include any identified 'blockages'.
${finalAnalysisInstruction}

Generate the response now.`;
}

function createFinalAnalysisPrompt(session_state) {
  const history = session_state?.history || [];
  let historySummary = "User's choices summary:\n";
  history.forEach(item => {
      if (item.iteration && item.metaphor) {
          historySummary += `Q${item.iteration}: Chose "${item.metaphor}"`;
          // Optionally add parameters for this choice if insightful
           if (item.parameters && Object.keys(item.parameters).length > 0) {
               // Keep concise for prompt
               const paramsSummary = Object.entries(item.parameters)
                   .map(([k, v]) => `${k}:${typeof v === 'number' ? v.toFixed(2) : v}`)
                   .join(', ');
               historySummary += ` (${paramsSummary})\n`;
           } else {
               historySummary += `\n`;
           }
      }
  });

  let aggregatedParamsSummary = "Aggregated Psyche Parameters (Estimate):\n";
  if (session_state.parameters && Object.keys(session_state.parameters).length > 0) {
      for (const [key, value] of Object.entries(session_state.parameters)) {
          // Format numbers, handle blockages separately if needed
          const formattedValue = typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value);
          aggregatedParamsSummary += `- ${key}: ${formattedValue}\n`;
      }
  } else {
      aggregatedParamsSummary += "- Parameters could not be aggregated.\n";
  }

  // --- NEW PROMPT STRUCTURE ---
  return `The 10-question SNS-MSM ritual is complete. Analyze the user's financial psyche based on the history and aggregated parameters below.

Session History:
${historySummary}
Aggregated Parameters:
${aggregatedParamsSummary}

Required Output Format:
Your response MUST be wrapped ONLY in <final_analysis> tags. Inside these tags, create an HTML structure suitable for display and potential sharing. Use the provided CSS classes.

<final_analysis>
<div class="profile-box">
  <div class="profile-header">
    <span class="profile-title">Financial Psyche Scan: SNS-MSM Profile</span>
    <span class="profile-session-id">Session ID: [Generate a short, thematic ID like '84-CRYSTAL-XYZ']</span>
  </div>

  <div class="profile-archetype">
    <h3>Dominant Archetype:</h3>
    <p>[Identify and name a core archetype based on the overall pattern, e.g., "The Calculated Risk Navigator", "The Cautious Legacy Builder", "The Impulsive Innovator". Use evocative 1984-therapist language.]</p>
  </div>

  <div class="profile-parameters">
    <h3>Key Psyche Parameters:</h3>
    <div class="param-grid">
      <div class="param-item">
        <span class="param-label">Risk Tolerance:</span>
        <span class="param-value">[Map aggregated risk_tolerance (0-1) to a label: e.g., Very Low, Low, Measured, Calculated, High, Volatile]</span>
        <!-- Optional: Add a simple visual bar/gauge representation if feasible -->
      </div>
      <div class="param-item">
        <span class="param-label">Planning Horizon:</span>
        <span class="param-value">[Map aggregated planning_horizon (0-1) to label: Immediate, Short-Term, Mid-Term, Long-Term, Generational]</span>
      </div>
      <div class="param-item">
        <span class="param-label">Security Focus:</span>
        <span class="param-value">[Map aggregated security_focus (0-1) to label: Low, Seeking, Balanced, High, Absolute]</span>
      </div>
       <div class="param-item">
        <span class="param-label">Innovation / Growth:</span>
        <span class="param-value">[Map aggregated innovation/growth_potential (0-1) to label: Resistant, Cautious, Adaptive, Eager, Disruptive]</span>
      </div>
       <div class="param-item">
        <span class="param-label">Resilience / Recovery:</span>
        <span class="param-value">[If data available, map resilience/transformation: Low, Moderate, High, Transformative]</span>
      </div>
       <div class="param-item">
        <span class="param-label">Trust Level (Est.):</span>
        <span class="param-value">[Estimate % based on choices related to systems/collaboration]</span>
      </div>
      <!-- Add more parameters as relevant based on your prompt/parsing -->
    </div>
  </div>

  <div class="profile-duality">
    <h3>Core Tension / Duality:</h3>
    <p class="duality-text">"[Quote or paraphrase the primary conflict, e.g., Security vs. Opportunity, Impulse vs. Control, Legacy vs. Innovation]"</p>
  </div>

  <div class="profile-shadow">
    <h3>Potential Shadow Aspect:</h3>
    <p class="shadow-text">[Identify a potential blind spot, fear, or hidden tendency suggested by consistent avoidances or contradictions. Frame it gently using therapist persona. e.g., "A potential reluctance to fully embrace stability, possibly stemming from a fear of stagnation." or "An aversion to external collaboration might mask a deeper distrust..."]</p>
  </div>

  <div class="profile-summary">
     <h3>Analyst's Observation:</h3>
     <p>[Provide a VERY concise (2-3 sentences max) narrative summary in the 1984 therapist voice, synthesizing the key findings.]</p>
  </div>

</div>
</final_analysis>`;
}


// --- Service Functions ---
async function generateQuestion(session_state) {
    const currentIteration = session_state?.iteration || 0;
    log.info(`Generating question for iteration ${currentIteration + 1}`);
    const prompt = createQuestionPrompt(session_state);
    log.debug(`User Prompt:\n${prompt}`); // Log the prompt being sent

    try {
      // ******** CHANGE HERE ********
      // Pass max_completion_tokens in the options object
      const completion = await callAzureOpenAI(
        [{ role: "system", content: getSystemPrompt() }, { role: "user", content: prompt }],
        { max_completion_tokens: 4000 } // Use the correct parameter name
      );

      log.debug(`Raw Completion for Q${currentIteration + 1}:\n${completion}`);
      const parsedResult = parseStructuredOutput(completion, currentIteration + 1);

      // Basic validation of parsed result
      if (!parsedResult || (!parsedResult.question && !parsedResult.final_analysis)) {
          log.error("Parsing failed to extract question or final analysis.", parsedResult);
          throw new Error("LLM response could not be parsed into the expected question format.");
      }
      if (parsedResult.question && (!parsedResult.options || parsedResult.options.length !== 7)) {
          log.error(`Parsing error: Expected 7 options, found ${parsedResult.options?.length || 0}.`);
          throw new Error("LLM response did not contain exactly 7 options.");
      }

      log.info(`Successfully generated and parsed question ${parsedResult.iteration || (currentIteration + 1)}.`);
      // If Q10 response includes final analysis, return both parts
      return parsedResult;

    } catch (error) {
      log.error(`Error in generateQuestion service for iteration ${currentIteration + 1}:`, error);
      // Ensure error is propagated correctly
      error.code = error.code || ERROR_CODES.LLM_API_ERROR;
      error.statusCode = error.statusCode || 502;
      throw error;
    }
}

// Make sure generateFinalAnalysis passes the *full* session_state
async function generateFinalAnalysis(session_state) { // Expect full state
  log.info("Generating final analysis.");
  // Pass the full state, including aggregated params, to the prompt function
  const prompt = createFinalAnalysisPrompt(session_state);
  log.debug(`Final Analysis Prompt:\n${prompt}`);

  try {
    const completion = await callAzureOpenAI(
      [{ role: "system", content: getSystemPrompt() }, { role: "user", content: prompt }],
      { temperature: 0.6, max_completion_tokens: 2000 } // Slightly more creative temp
    );

    log.debug(`Raw Final Analysis Completion:\n${completion}`);
    // Use the existing parser which expects <final_analysis> and extracts html/metrics
    const parsedAnalysis = parseFinalAnalysisUtil(completion);

    if (parsedAnalysis?.html) {
      log.info("Successfully parsed final analysis block.");
       // We only need the HTML part for the frontend now, metrics are implicit in the HTML
      return { final_analysis: { html: parsedAnalysis.html, metrics: {} } }; // Return structure frontend expects
    } else {
      log.warn("Could not parse <final_analysis> tag. Returning raw completion wrapped.");
      // Fallback: return the raw completion within the expected structure
      return { final_analysis: { html: `<div class="profile-box"><p>Analysis structure error. Raw output:</p><pre>${completion.replace(/</g, '<')}</pre></div>`, metrics: {} } };
    }

  } catch (error) {
    log.error("Error in generateFinalAnalysis service:", error);
    error.code = error.code || ERROR_CODES.FINAL_ANALYSIS_FAILURE;
    error.statusCode = error.statusCode || 502;
    throw error; // Re-throw
  }
}


module.exports = {
  generateQuestion,
  generateFinalAnalysis,
  // getSystemPrompt // Keep internal unless needed
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/public/js/script.js

```python
// public/js/script.js - Frontend Logic

// Wrap in IIFE to avoid global scope pollution
(function() {
    'use strict'; // Enable strict mode
  
    // --- State ---
    let currentSessionState = { iteration: 0, history: [], parameters: {} };
    let currentSessionId = null;
    let isProcessing = false; // Tracks if a request is currently in flight
    let pollingTimeoutId = null; // ID for the polling timeout
  
    // --- DOM Elements Cache ---
    const introScreen = document.getElementById('introScreen');
    const mainScreen = document.getElementById('mainScreen');
    const finalAnalysisScreen = document.getElementById('finalAnalysis');
    const progressBar = document.getElementById('progressBar');
    const progressPercentLabel = document.getElementById('progressPercent'); // Label for percentage
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const questionContainer = document.getElementById('questionContainer');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const analysisContentEl = document.getElementById('analysisContent');
    const sessionStateDebugEl = document.getElementById('session-state-debug');
    const debugInfoEl = document.getElementById('debug');
  
    // --- Constants ---
    const POLLING_INTERVAL_MS = 1500; // Check status every 1.5 seconds
    const MAX_POLLING_ATTEMPTS = 60; // Approx 1.5 minutes timeout for polling
    const API_BASE_URL = '/api'; // Prefix for all API calls
  
    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM Loaded. Initializing Crystal Gazer.");
      setupEventListeners();
      showScreen('intro');
      updateSessionStateDebug();
      // CSS should handle grid/animations now
    });
  
    function setupEventListeners() {
      startBtn?.addEventListener('click', startConsultation);
      restartBtn?.addEventListener('click', resetConsultation);
      // Listener for dynamically created retry buttons
      document.body.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('retry-btn')) {
          console.log("Retry button clicked.");
          clearLoadingAndError(); // Clear error message
          fetchNextQuestion(); // Retry fetching the question
        }
      });
    }
  
    // --- Screen Management ---
    function showScreen(screenName) {
      // Ensure elements exist before manipulating classes
      introScreen?.classList.add('hidden', 'fade-out');
      mainScreen?.classList.add('hidden', 'fade-out');
      finalAnalysisScreen?.classList.add('hidden', 'fade-out');
  
      let screenToShow = null;
      switch (screenName) {
        case 'intro': screenToShow = introScreen; break;
        case 'main': screenToShow = mainScreen; break;
        case 'final': screenToShow = finalAnalysisScreen; break;
        default: console.error(`Unknown screen name: ${screenName}`); return;
      }
  
      if (screenToShow) {
        screenToShow.classList.remove('hidden');
        void screenToShow.offsetWidth; // Trigger reflow for transition
        screenToShow.classList.remove('fade-out');
        screenToShow.classList.add('fade-in');
      } else {
         console.error(`Screen element not found for: ${screenName}`);
      }
    }
  
  
    // --- Core Logic ---
  
    function startConsultation() {
      console.log("Starting consultation...");
      resetSession(); // Ensure state is clean before starting
      showScreen('main');
      fetchNextQuestion();
    }
  
    function resetConsultation() {
      console.log("Resetting consultation...");
      showScreen('intro');
      resetSession();
      clearLoadingAndError();
    }
  
    function resetSession() {
      currentSessionState = { iteration: 0, history: [], parameters: {} };
      currentSessionId = null;
      isProcessing = false;
      stopPolling();
      updateProgressBar();
      updateSessionStateDebug();
      console.log("Session state reset.");
    }
  
    async function fetchNextQuestion() {
      if (isProcessing) {
        console.warn("Already processing, ignoring request to fetch next question.");
        return;
      }
      isProcessing = true;
      showLoading("Consulting the financial crystal...");
  
      try {
        // Make API call using the new structure /api prefix
        const response = await fetchFromServer(`${API_BASE_URL}/get_question`, 'POST', { session_state: currentSessionState });
  
        if (response.status === "processing" && response.sessionId) {
          currentSessionId = response.sessionId;
          console.log(`Request accepted (Session ID: ${currentSessionId}). Starting polling.`);
          startPolling(currentSessionId);
        } else {
          console.error("Received unexpected non-processing status from /get_question:", response);
          throw new Error("Invalid initial response from server. Expected 'processing' status.");
        }
      } catch (error) {
        console.error("Failed to initiate question request:", error);
        showErrorUI("Could not connect to the crystal ball.", error.message || "Please check your connection and retry.");
        // isProcessing = false; // Reset happens in showErrorUI
      }
    }
  
    function startPolling(sessionId) {
      stopPolling(); // Clear any previous polling timeouts
  
      let attempts = 0;
  
      async function poll() {
        if (!currentSessionId || sessionId !== currentSessionId) {
             console.log("Polling stopped: Session ID changed or cleared.");
             return; // Stop if session ID changed (e.g., reset)
         }
        if (attempts >= MAX_POLLING_ATTEMPTS) {
          console.error("Polling timed out after maximum attempts.");
          showErrorUI("The crystal ball seems unresponsive.", "The request took too long. Please try again later.");
          // isProcessing = false; // Reset in showErrorUI
          // currentSessionId = null; // Reset in showErrorUI
          return;
        }
  
        attempts++;
        console.log(`Polling attempt ${attempts}/${MAX_POLLING_ATTEMPTS} for session ${sessionId}...`);
  
        try {
          // Directly attempt to get the result
          const resultResponse = await fetchFromServer(`${API_BASE_URL}/get_result?sessionId=${sessionId}`, 'POST', {}); // No body needed for polling result
  
          // Check again if session context is still valid *after* the await
          if (sessionId !== currentSessionId) {
              console.log("Polling stopped: Session context changed during fetch.");
              return;
          }
  
          if (resultResponse.status === "processing") {
            // Still processing, schedule next poll with slight backoff
            pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL_MS + attempts * 50); // Small linear backoff
          } else {
            // Result is ready (or an error occurred during backend processing)
            console.log("Polling complete. Received result:", resultResponse);
            stopPolling(); // Stop polling now that we have a final response
  
            // The backend might return a structured error *within* the result endpoint
            if (resultResponse.error) {
               console.error("Backend processing resulted in an error:", resultResponse);
               // Throw an error to be caught by the outer catch block for UI display
               const backendError = new Error(resultResponse.message || "An error occurred on the server.");
               backendError.code = resultResponse.error;
               throw backendError;
            }
  
            // Successfully got data, render it
            processResult(resultResponse);
            // isProcessing = false; // Reset in processResult
            // currentSessionId = null; // Reset in processResult
          }
        } catch (error) {
           // Handle errors during the polling request itself (network, server 5xx, 404)
           console.error(`Polling attempt ${attempts} failed:`, error);
  
            // Check if session context is still valid *after* the await error
            if (sessionId !== currentSessionId) {
                console.log("Polling stopped: Session context changed during fetch error.");
                return;
            }
  
           // Decide whether to retry or fail based on error type
           if (error.code === 'SESSION_NOT_FOUND' || attempts >= MAX_POLLING_ATTEMPTS) {
               // Fatal error or max attempts reached
               stopPolling();
               showErrorUI("Session Expired or Invalid.", error.message || "Could not retrieve the result. Please try starting over.");
           } else {
               // Retry after a longer delay on error
               pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL_MS * 2 + attempts * 100);
           }
        }
      }
  
      // Start the first poll immediately
      pollingTimeoutId = setTimeout(poll, 100); // Start quickly
    }
  
    function stopPolling() {
      if (pollingTimeoutId) {
        clearTimeout(pollingTimeoutId);
        pollingTimeoutId = null;
        console.log("Polling stopped.");
      }
    }
  
    function processResult(data) {
       console.log("Processing final result from server:", data);
       clearLoadingAndError(); // Make sure loading/errors are hidden
  
       if (data.final_analysis) {
          renderFinalAnalysis(data.final_analysis);
       } else if (data.question && data.options) {
          // Check iteration consistency (optional, backend is source of truth)
          if(typeof data.iteration === 'number' && data.iteration !== currentSessionState.iteration + 1) {
              console.warn(`Iteration mismatch: Client expected ${currentSessionState.iteration + 1}, Server sent ${data.iteration}.`);
              // It's generally safer to trust the server's iteration number included with the question data
              // currentSessionState.iteration = data.iteration - 1; // Adjust client state? Risky if history relies on old numbers.
          }
          renderQuestionScreen(data);
       } else {
          console.error("Received invalid data structure from server:", data);
          showErrorUI("Received incomplete data from the crystal.", "The response from the server was malformed.");
       }
       isProcessing = false; // Mark processing as finished after rendering/handling result
       currentSessionId = null; // Clear session ID after successfully getting result
    }
  
  
    function selectOption(selectedMetaphor, questionData) {
      if (isProcessing) {
        console.warn("Currently processing, selection ignored.");
        return;
      }
      // Use the iteration number provided WITH the question data
      const questionIteration = questionData.iteration;
      console.log(`Selected: "${selectedMetaphor}" for Q${questionIteration}`);
      playSelectionSound();
  
      // --- Update UI ---
      const optionElements = optionsEl?.querySelectorAll('li');
      if (!optionElements) return;
  
      let selectedElement = null;
      optionElements.forEach(li => {
        li.classList.remove('selected');
        li.style.pointerEvents = 'none'; // Disable further clicks
        const span = li.querySelector('span');
        if (span && span.textContent === selectedMetaphor) {
          selectedElement = li;
        }
      });
      selectedElement?.classList.add('selected');
  
  
      // --- Update State ---
      const avoidedMetaphors = questionData.options.filter(opt => opt !== selectedMetaphor);
      // Use parameters associated with the *lowercase* version of the metaphor if keys are normalized
      const choiceParameters = questionData.psyche_parameters?.[selectedMetaphor.toLowerCase()] || {};
  
      // !! Important: Update iteration based on the question's iteration number !!
      currentSessionState.iteration = questionIteration; // Align client iteration with the question just answered
      currentSessionState.history.push({
        iteration: questionIteration, // Store the iteration number of the question answered
        question: questionData.question,
        metaphor: selectedMetaphor,
        avoided_metaphors: avoidedMetaphors,
        parameters: choiceParameters // Store parameters derived *from this choice*
      });
      // Aggregate parameters into the main state
      currentSessionState.parameters = aggregateParameters(currentSessionState.parameters, choiceParameters);
  
  
      updateProgressBar();
      updateSessionStateDebug();
  
      // --- Fetch Next ---
      setTimeout(() => {
        fetchNextQuestion();
      }, 700); // Delay for visual feedback
    }
  
    // Helper to aggregate psyche parameters (example implementation)
    function aggregateParameters(existingParams, newParams) {
        const aggregated = { ...existingParams };
        for (const key in newParams) {
            if (key === '_blockages') continue; // Handle blockages separately
  
            if (typeof newParams[key] === 'number') {
                // Average numerical parameters (adjust weight if needed)
                const existingValue = existingParams[key];
                const count = currentSessionState.history.filter(h => h.parameters && h.parameters[key] !== undefined).length; // How many times seen before?
                // Weighted average: give more weight to newer values? Or simple average?
                // Simple average example:
                aggregated[key] = ((existingValue || 0) * (count -1) + newParams[key]) / count;
                // Make sure value stays within expected bounds (e.g., 0-1)
                aggregated[key] = Math.max(0, Math.min(1, aggregated[key] || 0));
  
            } else {
                // Overwrite non-numerical params for simplicity, or implement specific logic (e.g., merge lists)
                aggregated[key] = newParams[key];
            }
        }
        // Aggregate blockages (unique list)
        if (newParams['_blockages']) {
            aggregated['_blockages'] = [...new Set([...(existingParams['_blockages'] || []), ...newParams['_blockages']])];
        }
        return aggregated;
    }
  
    // --- UI Update Functions ---
  
    function renderQuestionScreen(data) {
       if (!questionEl || !optionsEl) {
            console.error("Cannot render question: Core UI elements not found.");
            showErrorUI("Display Error", "Could not render the next question.");
            return;
        }
       console.log("Rendering question:", data.question);
       hideLoading();
       questionContainer?.classList.remove('error-state');
  
       // Fade out old content
       questionEl.style.opacity = '0';
       optionsEl.style.opacity = '0';
  
       setTimeout(() => {
          // Update content
          questionEl.textContent = data.question;
          optionsEl.innerHTML = ""; // Clear previous options
  
          (data.options || []).forEach((opt, i) => { // Add safety check for options array
              const li = document.createElement('li');
              const imgUrl = data.images?.[i] || `https://source.unsplash.com/300x200/?abstract`; // Default image
              // Added error handler for images
              li.innerHTML = `<img src="${imgUrl}" alt="${opt}" loading="lazy" onerror="this.onerror=null; this.src='https://source.unsplash.com/300x200/?texture';"/><span>${opt}</span>`;
              li.onclick = () => selectOption(opt, data);
              li.style.animationDelay = `${i * 0.08}s`;
              optionsEl.appendChild(li);
          });
  
          // Update debug info display if element exists
          if (debugInfoEl) {
              if (data.debugContent) {
                  debugInfoEl.innerHTML = `<strong>LLM Reasoning Snippet:</strong><br>${data.debugContent.substring(0, 250)}...`;
                  debugInfoEl.style.display = 'block'; // Show if content exists
              } else {
                  debugInfoEl.style.display = 'none'; // Hide if no content
              }
          }
  
          // Fade in new content
          questionEl.style.opacity = '1';
          optionsEl.style.opacity = '1';
          // Trigger option animation
          optionsEl.classList.remove('animate-options');
          void optionsEl.offsetWidth; // Force reflow
          optionsEl.classList.add('animate-options');
  
          questionContainer?.classList.remove('processing');
          // isProcessing = false; // Reset happens in processResult or showErrorUI
  
       }, 300); // Delay matches CSS transition
    }
  
     function renderFinalAnalysis(analysisData) {
          console.log("Rendering final analysis.");
          hideLoading();
          questionContainer?.classList.remove('error-state', 'processing');
  
          if (analysisContentEl && analysisData?.html) {
              // Basic sanitization: Remove <script> tags (More robust needed for production)
              const sanitizedHtml = analysisData.html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
              analysisContentEl.innerHTML = sanitizedHtml;
          } else if (analysisContentEl) {
               analysisContentEl.innerHTML = `<p>Analysis could not be displayed.</p><p>${analysisData?.html || 'No analysis content received.'}</p>`;
               console.error("Final analysis data is missing or invalid:", analysisData);
          }
  
          showScreen('final');
          // isProcessing = false; // Reset happens in processResult or showErrorUI
          // currentSessionId = null; // Reset happens in processResult or showErrorUI
      }
  
    function showLoading(message = "Consulting the crystal...") {
      console.log("Showing loading:", message);
      if (!questionContainer || !questionEl || !optionsEl) return;
  
      questionContainer.classList.add('processing');
      questionContainer.classList.remove('error-state');
      // Use textContent for security unless HTML is intended
      questionEl.innerHTML = `<div class="loading-indicator">${message}<span class="dots">.</span></div>`; // Add dots span
      optionsEl.innerHTML = ""; // Clear options
  
      // Animate dots (simple example)
      const dotsSpan = questionEl.querySelector('.dots');
      if (dotsSpan) {
          let dotCount = 1;
          dotsSpan.intervalId = setInterval(() => {
              dotsSpan.textContent = '.'.repeat(dotCount);
              dotCount = (dotCount % 3) + 1;
          }, 400);
      }
    }
  
    function hideLoading() {
       console.log("Hiding loading.");
       questionContainer?.classList.remove('processing');
       const loadingIndicator = questionEl?.querySelector('.loading-indicator');
       if (loadingIndicator) {
          const dotsSpan = loadingIndicator.querySelector('.dots');
          if (dotsSpan && dotsSpan.intervalId) {
              clearInterval(dotsSpan.intervalId); // Clear the dots interval
          }
         // Clear the loading message OR let renderQuestionScreen overwrite it
         // questionEl.innerHTML = '';
       }
    }
  
     function clearLoadingAndError() {
         hideLoading();
         questionContainer?.classList.remove('error-state');
         const errorMsg = questionEl?.querySelector('.error-message');
         if (errorMsg) {
             questionEl.innerHTML = ''; // Clear error message
         }
     }
  
  
    function showErrorUI(title, message = "An unknown error occurred.") {
      console.error("Showing Error UI:", title, message);
      hideLoading(); // Ensure loading indicator is hidden
      stopPolling(); // Stop any polling attempts
  
      if (!questionContainer || !questionEl || !optionsEl) return;
  
      questionContainer.classList.add('error-state');
      questionContainer.classList.remove('processing');
      // Use textContent for messages unless HTML is needed and sanitized
      const safeTitle = title || "Error";
      const safeMessage = message || "An unknown error occurred.";
      questionEl.innerHTML = `
        <div class="error-message">
          <strong>${safeTitle.replace(/</g, "&lt;")}</strong><br>
          <span>${safeMessage.replace(/</g, "&lt;")}</span><br><br>
          <button class="retry-btn glow-btn">Retry</button>
          <button class="restart-btn-error glow-btn" onclick="location.reload()">Restart</button> <!-- Add restart -->
        </div>
      `;
      optionsEl.innerHTML = ""; // Clear options
  
      isProcessing = false; // Ensure processing flag is reset
      currentSessionId = null; // Clear session ID on error
    }
  
    function updateProgressBar() {
        const progress = Math.min(100, Math.max(0, (currentSessionState.iteration / 10) * 100));
        const roundedProgress = Math.round(progress);
        if (progressBar) {
            progressBar.style.width = `${roundedProgress}%`;
            progressBar.setAttribute('aria-valuenow', roundedProgress);
        }
        if (progressPercentLabel) {
             progressPercentLabel.textContent = `${roundedProgress}%`; // Update label
        }
    }
  
    function updateSessionStateDebug() {
      if (sessionStateDebugEl) {
        try {
          // Use CSS to control visibility of the debug panel instead of display: none
          sessionStateDebugEl.textContent = JSON.stringify(currentSessionState, null, 2);
        } catch (e) {
          sessionStateDebugEl.textContent = "Error displaying session state.";
        }
      }
    }
  
    // --- Utilities ---
  
    async function fetchFromServer(endpoint, method = 'GET', body = null) {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
      if (body && method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(body);
      }
  
      console.log(`Fetching from ${endpoint} with method ${method}`);
  
      try {
        const response = await fetch(endpoint, options);
  
        // Try to parse JSON regardless of status code for error details
        let responseData;
        try {
            const text = await response.text();
            responseData = text ? JSON.parse(text) : {}; // Handle empty response
        } catch (e) {
            // If JSON parsing fails, create a basic error object
            responseData = {
                error: 'PARSE_ERROR',
                message: `Failed to parse response as JSON (Status: ${response.status})`,
                rawResponse: response.text // Include raw text if parse failed (careful with large responses)
            };
            // If status was OK but parse failed, it's still an error
            if (response.ok) {
                 const error = new Error(responseData.message);
                 error.code = responseData.error;
                 error.statusCode = 502; // Bad Gateway - invalid upstream response
                 error.details = responseData;
                 throw error;
            }
        }
  
        if (!response.ok) {
          console.error(`Server returned error ${response.status}:`, responseData);
          const error = new Error(responseData.message || `Request failed with status ${response.status}`);
          error.statusCode = response.status;
          error.code = responseData.error || 'FETCH_ERROR'; // Use error code from server if available
          error.details = responseData;
          throw error;
        }
  
        return responseData; // Return parsed JSON response
  
      } catch (error) {
         console.error(`Fetch failed for ${endpoint}:`, error);
         // Ensure the re-thrown error has consistent properties if possible
         if (!error.code) { error.code = 'NETWORK_ERROR'; }
         if (!error.statusCode) { error.statusCode = 0; } // 0 indicates network error?
         throw error; // Re-throw the error to be handled by the calling function
      }
    }
  
    function playSelectionSound() {
      try {
        const audio = new Audio('/assets/select.mp3'); // Ensure path is correct
        audio.volume = 0.25; // Adjust volume
        // Don't wait for play() to finish, just fire and forget
        audio.play().catch(e => console.warn('Audio playback failed:', e.message));
      } catch (e) {
        console.warn('Audio playback not supported or failed:', e.message);
      }
    }
  
  })(); // End of IIFE
```


```

## File: /Users/limi/Documents/GitHub/fincrystal/README.md

```python
# Financial Crystal Gazer

A retro-themed financial therapist application using metaphorical questions to analyze your financial psyche, powered by Azure OpenAI.

## Description

The Financial Crystal Gazer simulates a 1984-era financial therapy application. It guides users through a 10-question adaptive ritual using metaphorical choices to analyze their financial attitudes, behaviors, and mindset. The application provides insights into the user's relationship with money based on their interactions with the "crystal ball."

**Features:**

*   Retro 80s synthwave aesthetic with dynamic grid background and crystal ball effects.
*   Adaptive questioning engine powered by Azure OpenAI.
*   Analysis of financial psyche parameters (e.g., risk tolerance, urgency) based on metaphorical choices.
*   Asynchronous processing model with status updates via polling.
*   Final comprehensive analysis report after 10 questions.

## Project Structure

```
/financial-crystal/
├── server/                   # All backend-specific code
│   ├── app.js                # Express app configuration (middleware, routes)
│   ├── index.js              # Entry point to start the server (imports app)
│   ├── config/               # Configuration files (e.g., env.js)
│   ├── middleware/           # Custom middleware (e.g., errorHandler.js, requestLogger.js)
│   ├── prompts/              # LLM Prompts used by the backend
│   │   └── sns_msm_prompt.txt
│   ├── routes/               # API route definitions (apiRoutes.js)
│   ├── services/             # Business logic (openaiService.js)
│   └── utils/                # Helper functions (parser.js, logger.js, constants.js)
│
├── public/                   # Static files served directly to the browser
│   ├── index.html            # Main HTML file
│   ├── js/                   # Frontend JavaScript (script.js)
│   ├── css/                  # Frontend CSS (style.css)
│   └── assets/               # Images, fonts, sounds
│
├── tools/                    # Developer utility scripts
│   └── generate-grid.js      # Script to generate the perspective grid background
│
├── .env                      # Local environment variables (ignored by git)
├── .env.example              # Example environment variables
├── .gitignore
├── package.json
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/financial-crystal.git
    cd financial-crystal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: `tools/generate-grid.js` requires `canvas`. If you encounter issues installing `canvas` (it has system dependencies like `cairo`, `pango`, `libjpeg`, `giflib`), you might skip its installation (`npm install --ignore-scripts`) if you don't need to regenerate the grid background, or follow platform-specific instructions for `node-canvas`.*

3.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`.
    *   Update `.env` with your Azure OpenAI credentials (see Azure Integration section below).
4.  **(Optional) Generate Grid Background:**
    If you have `canvas` installed correctly, you can generate/update the background:
    ```bash
    npm run generate:grid
    ```
    This will create `public/assets/grid-bg.png`.

5.  **Start the server:**
    *   For development (with auto-restarting):
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```
6.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000` (or the port specified in `.env`).

## Azure OpenAI Integration

This application requires access to an Azure OpenAI resource.

1.  **Azure Setup:**
    *   Create an Azure OpenAI resource.
    *   Deploy a chat model (e.g., `gpt-35-turbo`, `gpt-4`). Note the **Deployment Name**.
2.  **Credentials:**
    *   Get your Azure OpenAI resource **Endpoint URL** (e.g., `https://your-resource-name.openai.azure.com/`) and an **API Key**.
3.  **Configure `.env` file:**
    Add your credentials and deployment details:
    ```dotenv
    AZURE_API_KEY="your_api_key_here"
    AZURE_API_BASE="https://your-resource-name.openai.azure.com/"
    DEPLOYMENT_NAME="your_deployment_name"
    # AZURE_API_VERSION="2024-05-01-preview" # Optional: Default used if unset
    ```

*Note: LLM features will fail if Azure credentials are missing or invalid.*

## How It Works

1.  **Initiation:** User starts the consultation via the frontend (`public/index.html`).
2.  **Question Request:** Frontend (`public/js/script.js`) sends the current `session_state` to the backend (`POST /api/get_question`).
3.  **Backend Processing:**
    *   Server (`server/routes/apiRoutes.js`) accepts the request, generates a unique `sessionId`, stores the initial state, and responds `202 Accepted` with `{ status: 'processing', sessionId: '...' }`.
    *   In the background, `openaiService.js` formats a prompt and calls Azure OpenAI.
    *   The LLM response is parsed (`server/utils/parser.js`).
    *   The result (or error) is stored associated with the `sessionId`.
4.  **Polling:** Frontend polls `POST /api/get_result?sessionId=...`.
5.  **Result Retrieval:** Backend checks the status for the `sessionId`. If processing, returns `{ status: 'processing' }`. If done, returns the parsed question/analysis data (or error details) and clears the session data.
6.  **UI Update:** Frontend renders the new question/options or final analysis.
7.  **User Selection & State Update:** User selects an option. Frontend updates `session_state` and triggers step 2 again.
8.  **Repeat:** Steps 2-7 repeat for 10 iterations.
9.  **Final Analysis:** After iteration 10, the backend generates and returns the final analysis structure.

## API Endpoints (Backend)

*   `GET /`: Serves the main `index.html` page (via static middleware).
*   `POST /api/get_question`: Initiates background processing for the next question/analysis.
    *   Body: `{ session_state: { iteration: number, history: [...] } }`
    *   Response (202): `{ status: 'processing', sessionId: '...' }`
*   `POST /api/get_result?sessionId=...`: Polls for the result of a processing request.
    *   Body: (Empty)
    *   Response (200 - Processing): `{ status: 'processing', elapsedMs: ... }`
    *   Response (200 - Success): `{ iteration: ..., question: ..., options: [...], images: [...], debugContent: ..., psyche_parameters: {...} }` OR `{ final_analysis: { html: ..., metrics: {...} } }`
    *   Response (4xx/5xx - Error): `{ error: 'ERROR_CODE', message: '...' }`
*   Static Files: Serves all files from the `public/` directory.

## Technologies Used

*   **Backend:** Node.js, Express.js, node-fetch
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **AI:** Azure OpenAI Service
*   **Styling:** Retrowave/Synthwave aesthetic, CSS variables, animations.
*   **Font:** Lazer84

## Credits

*   **Concept & LLM Prompting:** Inspired by metaphorical analysis techniques.
*   **Font:** Lazer84 by Sunrise Digital
*   **Sound Effects:** SoundJay.com
*   **Images:** Unsplash (via source.unsplash.com)
*   **LLM Provider:** Microsoft Azure OpenAI Service

## License

MIT
```

## File: /Users/limi/Documents/GitHub/fincrystal/package.json

```python
{
    "name": "financial-crystal-gazer",
    "version": "1.0.0",
    "description": "Retro financial therapist application using metaphorical questions.",
    "main": "server/index.js",
    "scripts": {
      "start": "node server/index.js",
      "dev": "nodemon server/index.js",
      "lint": "eslint .",
      "generate:grid": "node tools/generate-grid.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
      "financial",
      "therapy",
      "metaphor",
      "retro",
      "openai",
      "azure"
    ],
    "author": "odysseus.bot",
    "license": "MIT",
    "dependencies": {
      "body-parser": "^1.20.2",
      "cors": "^2.8.5",
      "dotenv": "^16.4.5",
      "express": "^4.19.2",
      "helmet": "^7.1.0",
      "node-fetch": "^2.7.0"
    },
    "devDependencies": {
      "@eslint/js": "^9.3.0",
      "canvas": "^2.11.2",
      "eslint": "^9.3.0",
      "globals": "^15.3.0",
      "nodemon": "^3.1.1"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  }
```

## File: /Users/limi/Documents/GitHub/fincrystal/eslint.config.js

```python
// eslint.config.js - Keep the improved version
// @ts-check

import js from "@eslint/js";
// Remove TS-related imports if not using TS anywhere
// import * as importPlugin from "eslint-plugin-import";
import globals from "globals";
// import tseslint from "typescript-eslint";

export default [ // Use array export format for flat config
  { ignores: ["dist", "node_modules", "public/"] }, // Ignore build output, deps, and static frontend assets
  {
    // Apply JS rules to backend JS files
    files: ["server/**/*.js", "tools/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs", // Backend uses CommonJS modules
      globals: {
        ...globals.node, // Use Node.js globals
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn unused vars, ignore args starting with _
      "no-console": "off", // Allow console logging in backend for now
      "require-await": "warn",
      // Add other backend-specific JS rules here if needed
       "semi": ["warn", "always"], // Enforce semicolons (optional style choice)
       "quotes": ["warn", "single", { "avoidEscape": true }] // Prefer single quotes (optional style choice)
    },
  },
  // If you were using TypeScript, the TS-specific config block would go here
  // {
  //   files: ["**/*.{ts,tsx}"],
  //   extends: [...],
  //   languageOptions: {...},
  //   plugins: {...},
  //   settings: {...},
  //   rules: {...},
  // }
];
```

## File: /Users/limi/Documents/GitHub/fincrystal/tools/generate-grid.js

```python
// tools/generate-grid.js
// Generates the perspective grid background image.
// Requires: npm install canvas
// Run: node tools/generate-grid.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // Use node-canvas

const width = 1600; // Adjust size as needed for better quality/aspect ratio
const height = 1000;

function createGridBackground() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- Background ---
  ctx.fillStyle = "#0c0c1e"; // Dark blue/purple
  ctx.fillRect(0, 0, width, height);

  // --- Horizon Glow ---
  const horizonY = height * 0.55; // Horizon line position
  const glowHeight = height * 0.6; // How far down the glow extends
  const gradient = ctx.createLinearGradient(0, horizonY - glowHeight * 0.1, 0, horizonY + glowHeight);
  gradient.addColorStop(0, "rgba(255, 0, 255, 0.0)");  // Fade in magenta near horizon
  gradient.addColorStop(0.15, "rgba(255, 0, 255, 0.18)"); // Peak magenta
  gradient.addColorStop(0.6, "rgba(0, 255, 255, 0.12)");  // Transition to cyan
  gradient.addColorStop(1, "rgba(0, 255, 255, 0.0)");   // Fade out cyan
  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizonY - glowHeight * 0.1, width, glowHeight * 1.1);

  // --- Grid Lines ---
  ctx.strokeStyle = 'rgba(123, 57, 255, 0.35)'; // Grid color (purple), slightly more opaque
  ctx.lineWidth = 1.5; // Grid line thickness

  const vanishingPointX = width * 0.5;
  const numHorizontalLines = 30; // More lines for finer detail
  const numVerticalLines = 60;   // Number of vertical lines spreading from center

  // --- Horizontal Lines (Perspective) ---
  for (let i = 0; i <= numHorizontalLines; i++) {
    const perspectiveFactor = i / numHorizontalLines; // 0 at horizon, 1 near bottom
    // Exponential scaling for perspective (lines get further apart closer to viewer)
    // Adjust power (e.g., 2.0 to 3.0) to change perspective strength
    const yPos = horizonY + Math.pow(perspectiveFactor, 2.8) * (height - horizonY);

    if (yPos > height) continue; // Don't draw below screen

    // Fade out lines further away (closer to horizon), subtle effect
    const alpha = (1 - perspectiveFactor * 0.5) * 0.8; // Base alpha 0.8, fades slightly
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha)); // Clamp alpha 0-1

    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(width, yPos);
    ctx.stroke();
  }

  // --- Vertical Lines (Perspective) ---
  for (let i = 0; i <= numVerticalLines; i++) {
    const perspectiveFactor = Math.abs(i - numVerticalLines / 2) / (numVerticalLines / 2); // 0 at center, 1 at edge
    // Position on horizon - adjust multiplier for spread
    const xPosOnHorizon = vanishingPointX + (i - numVerticalLines / 2) * (width / numVerticalLines * 3.5);

    // Calculate intersection with bottom edge (simple linear perspective)
    // The further from center on horizon, the further out on bottom edge
    const bottomX = vanishingPointX + (xPosOnHorizon - vanishingPointX) * (height / (horizonY || 1)); // Avoid divide by zero

    // Fade out lines towards the edges
    const alpha = (1 - perspectiveFactor * 0.7) * 0.8; // Base alpha 0.8, fades more towards edge
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    ctx.beginPath();
    ctx.moveTo(xPosOnHorizon, horizonY);
    ctx.lineTo(bottomX, height); // Draw line to bottom edge
    ctx.stroke();
  }

  // --- Reset alpha ---
  ctx.globalAlpha = 1.0;

  // --- Save Image ---
  const outputPath = path.join(__dirname, '../public/assets/grid-bg.png'); // Save directly to public/assets
  try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Grid background generated and saved to: ${outputPath}`);
  } catch (error) {
     console.error(`❌ Error saving grid background image to ${outputPath}:`, error);
  }
}

// --- Run Generation ---
try {
  createGridBackground();
} catch (error) {
  console.error("❌ Failed to generate grid background:", error);
  process.exit(1); // Exit with error code if generation fails
}
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/index.js

```python
// server/index.js - Server Entry Point
const http = require('http');
const app = require('./app'); // Import the configured Express app
const { PORT } = require('./config/env');
const log = require('./utils/logger');

const server = http.createServer(app);

server.listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`);
  // Log configuration status moved to app.js or env.js if needed on start
});

// Optional: Handle server errors gracefully
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown (optional but good practice)
process.on('SIGTERM', () => {
    log.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        log.info('HTTP server closed');
        // Perform any other cleanup here
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        log.info('HTTP server closed');
        process.exit(0);
    });
});
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/app.js

```python
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
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/middleware/errorHandler.js

```python
// server/middleware/errorHandler.js
const log = require('../utils/logger');
const { NODE_ENV } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');

function errorHandlerMiddleware(err, req, res, next) {
    // Log the error internally
    log.error(`Error occurred for ${req.method} ${req.path}:`, err);

    // Determine status code - use error's statusCode if available, otherwise 500
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

    // Determine error code - use error's code if available
    const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;

    // Determine message - use error's message, fallback to generic message
    let message = err.message || 'An unexpected internal server error occurred.';
    // Avoid exposing sensitive internal details in production
    if (NODE_ENV !== 'development' && statusCode >= 500) {
        message = 'An internal server error occurred. Please try again later.';
    }

    res.status(statusCode).json({
        error: errorCode,
        message: message,
        // Optionally include details (like stack trace) in development environment only
        details: NODE_ENV === 'development' ? (err.details || err.stack) : undefined
    });
}

module.exports = errorHandlerMiddleware;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/middleware/requestLogger.js

```python
// server/middleware/requestLogger.js
const log = require('../utils/logger');

function requestLoggerMiddleware(req, res, next) {
    const sessionId = req.query?.sessionId || req.body?.sessionId || 'N/A';
    log.request(req, sessionId);
    next();
}

module.exports = requestLoggerMiddleware;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/config/env.js

```python
// server/config/env.js - Load and manage environment variables
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 3000,
    AZURE_API_KEY: process.env.AZURE_API_KEY,
    AZURE_API_BASE: process.env.AZURE_API_BASE,
    DEPLOYMENT_NAME: process.env.DEPLOYMENT_NAME,
    MODEL_NAME: process.env.MODEL_NAME || 'gpt-35-turbo', // Your preferred default
    AZURE_API_VERSION: process.env.AZURE_API_VERSION || '2024-05-01-preview',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Add other configuration variables as needed
    PROCESSING_TIMEOUT_MS: parseInt(process.env.PROCESSING_TIMEOUT_MS || '300000', 10), // 5 minutes
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
    RETRY_DELAY_MS: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/utils/constants.js

```python
// server/utils/constants.js - Define shared constants

const ERROR_CODES = {
    // Client Errors (4xx)
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',           // 404
    SESSION_STATE_REQUIRED: 'SESSION_STATE_REQUIRED', // 400
    INVALID_SESSION_STATE: 'INVALID_SESSION_STATE',   // 400
    INVALID_ITERATION: 'INVALID_ITERATION',           // 400
    MISSING_SESSION_ID: 'MISSING_SESSION_ID',         // 400

    // Server Errors (5xx)
    PROCESSING_ERROR: 'PROCESSING_ERROR',             // 500 (Generic backend processing error)
    INTERNAL_ERROR: 'INTERNAL_ERROR',                 // 500 (Generic unexpected server error)
    PARSING_FAILURE: 'PARSING_FAILURE',               // 502 (Error parsing LLM response)
    LLM_API_ERROR: 'LLM_API_ERROR',                   // 502 (Error calling Azure OpenAI API)
    MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',       // 500 (Server config error)
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',                   // 504 (Processing took too long)
    FINAL_ANALYSIS_FAILURE: 'FINAL_ANALYSIS_FAILURE', // 500 or 502 (Error during final analysis generation)
    NETWORK_ERROR: 'NETWORK_ERROR',                   // 503/504 (Fetch/network issues talking to Azure)
    FETCH_ERROR: 'FETCH_ERROR',                       // 500 (Generic fetch error)
    INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE'      // 502 (Bad response content type from upstream)
};

module.exports = {
    ERROR_CODES,
    // Add other constants here, e.g., MAX_QUESTIONS = 10
    MAX_QUESTIONS: 10,
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/utils/logger.js

```python
// server/utils/logger.js - Centralized logging utility

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
  
    fg: {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m", // Parsing
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",   // LLM
      white: "\x1b[37m",
      orange: "\x1b[38;5;214m", // Warnings
      gray: "\x1b[90m"    // Dividers
    },
    bg: {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      cyan: "\x1b[46m",
      white: "\x1b[47m",
      gray: "\x1b[100m"
    }
  };
  
  // Function to format messages with timestamps and levels
  function formatMessage(levelColor, levelTag, msg, details) {
      const timestamp = new Date().toISOString();
      let logMsg = `${colors.fg.gray}[${timestamp}]${colors.reset} ${levelColor}[${levelTag}]${colors.reset} ${msg}`;
      if (details) {
          if (details instanceof Error) {
              logMsg += `\n${colors.fg.red}${details.stack || details.message}${colors.reset}`;
          } else if (typeof details === 'object') {
              logMsg += `\n${JSON.stringify(details, null, 2)}`;
          } else {
              logMsg += `\n${details}`;
          }
      }
      return logMsg;
  }
  
  const log = {
    llm: (msg) => console.log(formatMessage(colors.fg.cyan, 'LLM', msg)),
    parse: (msg) => console.log(formatMessage(colors.fg.yellow, 'PARSE', msg)),
    error: (msg, error = '') => console.error(formatMessage(colors.fg.red, 'ERROR', msg, error)),
    info: (msg) => console.log(formatMessage(colors.fg.green, 'INFO', msg)),
    warn: (msg) => console.warn(formatMessage(colors.fg.orange, 'WARN', msg)),
    debug: (msg) => { // Only log debug messages if NODE_ENV is 'development'
        if (process.env.NODE_ENV === 'development') {
            console.debug(formatMessage(colors.fg.magenta, 'DEBUG', msg));
        }
    },
    divider: () => console.log(`${colors.fg.gray}──────────────────────────────────────────────────────────────${colors.reset}`),
    request: (req, sessionId = 'N/A') => {
        const ip = req.ip || req.connection?.remoteAddress;
        console.log(formatMessage(colors.fg.blue, 'HTTP', `${req.method} ${req.originalUrl} - Session: ${sessionId} - IP: ${ip}`));
    }
  };
  
  module.exports = log;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/utils/parser.js

```python
// server/utils/parser.js - Functions for parsing LLM responses
const log = require('./logger'); // Use the centralized logger
const { ERROR_CODES } = require('./constants');

// Helper to generate placeholder image URLs
function generateImages(options) {
    if (!Array.isArray(options)) return [];
    return options.map(option => {
      // Simple kebab-case conversion for keyword
      const keyword = String(option).toLowerCase()
                        .replace(/[^a-z0-9\s]+/g, '') // Remove non-alphanumeric/space chars
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .trim();
      // Use a placeholder service or default keyword if conversion fails
      // Defaulting to 'abstract' if keyword becomes empty
      const query = keyword || 'abstract';
      return `https://source.unsplash.com/300x200/?${query}`; // Add keyword to URL
    });
}

// Extracts psyche parameters from the debug reasoning text
function extractPsycheParameters(debugText) {
  if (!debugText) return {};
  log.parse("Extracting psyche parameters from debug text...");
  log.debug(`--- Full Debug Text ---\n${debugText}\n------------------------`);

  const paramMappings = {};
  let blockages = [];
  let matchIndex = 0; // Keep declaration outside try

  try {
      // *** SIMPLIFIED REGEX ***
      // ^                  - Start of line (m flag)
      // \s*                - Optional leading space
      // (?:\d+\.\s*)?     - Optional number and dot
      // (.*?)              - Capture Group 1: The *entire* metaphor text, including potential quotes/spaces
      // \s*→\s*           - The arrow separator
      // (\{[\s\S]*?\})     - Capture Group 2: The JSON block (non-greedy)
      // \s*.*?(?=\r?\n|$)  - Optional trailing junk before newline/end
      const mappingRegex = /^\s*(?:\d+\.\s*)?(.*?)\s*→\s*(\{[\s\S]*?\})\s*.*?(?=\r?\n|$)/gm;

      let match;

      while ((match = mappingRegex.exec(debugText)) !== null) {
          matchIndex++;

          // --- ** NEW PROCESSING for Capture Group 1 ** ---
          let metaphorNameRaw = match[1]?.trim() || `__UNKNOWN_METAPHOR_${matchIndex}__`;
          // Explicitly remove leading/trailing quotes AND trim again
          let metaphor = metaphorNameRaw.replace(/^['"]|['"]$/g, '').trim().toLowerCase();

          // --- JSON Processing (Capture Group 2) ---
          const paramsJsonText = match[2]?.trim() || '{}';

          log.debug(`[Match ${matchIndex}] Regex Captured Raw Metaphor: "${match[1]}" (Processed: "${metaphor}")`); // Log original capture group 1
          log.debug(`[Match ${matchIndex}] Regex Captured JSON Text:\n${paramsJsonText}\n------------------------`);

          try {
              // Keep the JSON cleaning steps
               let correctedJson = paramsJsonText
                   .replace(/<!--[\s\S]*?-->/g, '')
                   .replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":')
                   .replace(/:\s*'((?:\\.|[^'\\])*)'/g, ': "$1"')
                   .replace(/,\s*([}\]])/g, '$1')
                   .replace(/\s*\/\/.*$/gm, '')
                   .replace(/\s*\(.*?\)$/gm, '')
                   .replace(/;\s*.*$/gm, '')
                   .trim();

               log.debug(`[Match ${matchIndex}] Corrected JSON Text Attempt: [${correctedJson}]`);

               if (correctedJson === '{}') {
                  log.warn(`[Match ${matchIndex}] Captured JSON text was empty or only comments for metaphor "${metaphor}". Skipping.`);
                  continue;
               }

               const bracketBalance = (correctedJson.match(/{/g)?.length === correctedJson.match(/}/g)?.length);
               if (correctedJson.startsWith('{') && correctedJson.endsWith('}') && bracketBalance) {
                   const params = JSON.parse(correctedJson);
                   if (paramMappings[metaphor]) {
                       log.warn(`[Match ${matchIndex}] Overwriting existing params for duplicate metaphor key "${metaphor}"`);
                   }
                   paramMappings[metaphor] = params;
                   log.parse(`[Match ${matchIndex}] Successfully Parsed Params for "${metaphor}": ${JSON.stringify(params)}`);
               } else {
                    log.warn(`[Match ${matchIndex}] Malformed JSON structure after cleaning for metaphor "${metaphor}". Raw/Corrected logged above.`);
               }
          } catch (e) {
               log.warn(`[Match ${matchIndex}] JSON Parse FAILED for metaphor "${metaphor}" (Corrected Text logged above). Error: ${e.message}`);
          }
      } // End while

      // Check for zero matches after loop
       if (matchIndex === 0) {
           log.warn("Mapping Regex found ZERO matches in the debug text.");
       }

      // --- Blockage Parsing ---
      const blockageRegex = /(?:blockage|tension)[s]?\s*(?:identified|detected|noted)?:?\s*\[?(['"]?)(.*?)\1\]?/gi;
      let blockageMatch;
      while ((blockageMatch = blockageRegex.exec(debugText)) !== null) {
          const found = blockageMatch[2];
          if (found) {
              const items = found.includes(',') && (found.startsWith('[') || found.startsWith('"'))
                  ? found.replace(/[\[\]"']/g, '').split(',').map(item => item.trim()).filter(Boolean)
                  : [found.trim()];
              blockages = blockages.concat(items);
          }
      }
      blockages = [...new Set(blockages.filter(b => b.length > 0))];
      if (blockages.length > 0) {
          log.parse(`Identified blockages: ${blockages.join('; ')}`);
          paramMappings['_blockages'] = blockages;
      }

  } catch (error) {
      log.error("Exception during main parameter/blockage extraction loop:", error);
  }

  // --- Final Logging & Return ---
  const successfulParses = Object.keys(paramMappings).filter(k => k !== '_blockages').length;
  log.parse(`Finished parameter extraction. Total Metaphor Mappings Parsed Successfully: ${successfulParses}`);

  if (matchIndex > 0 && successfulParses < matchIndex && successfulParses < 7) {
      log.warn(`Expected up to 7 parameter mappings, but only parsed ${successfulParses} out of ${matchIndex} potential matches found by regex.`);
  } else if (matchIndex === 7 && successfulParses < 7) {
      log.warn(`Found 7 potential matches via regex, but only parsed ${successfulParses} successfully.`);
  } else if (matchIndex < 7 && matchIndex > 0) {
       log.warn(`Regex only found ${matchIndex} potential mapping lines to parse.`);
  }
  // If matchIndex remained 0, the warning from inside the try block should cover it.

  return paramMappings;
}


// Parses the main question/options block
function parseQuestionContent(text, expectedIteration) {
  log.parse(`Attempting to parse question content (expected iter: ${expectedIteration})...`);
  try {
    // Regex with 's' flag for multiline content, non-greedy match for question text
    const questionMatch = text.match(/<question\s+iteration="(\d+)"\s*>(.*?)<\/question>/is);
    if (!questionMatch?.[2]) {
      log.parse("No valid <question iteration=\"N\">...</question> tag found.");
      return null;
    }

    const iteration = parseInt(questionMatch[1], 10);
    if (isNaN(iteration)) {
         log.warn("Parsed iteration number is invalid.");
         return null;
    }

    if (iteration !== expectedIteration) {
        log.warn(`Parsed iteration ${iteration} does not match expected iteration ${expectedIteration}. Using parsed value.`);
    }

    const question = questionMatch[2].trim();
    log.parse(`Found question (Parsed Iteration ${iteration}): "${question.substring(0, 60)}..."`);

    const optionsMatch = text.match(/##\s*Metaphorical\s*Options\s*:(.*?)(?:🔸\s*\*\*Debug Reasoning\*\*|<!--|<final_analysis>|$)/is);
    if (!optionsMatch?.[1]) {
      log.parse("Could not find '## Metaphorical Options:' section or it was empty.");
      return null;
    }

    const optionsText = optionsMatch[1].trim();
    const optionLines = optionsText.match(/^\s*\d+\.\s*(.*?)(?=\s*\n\s*\d+\.|\s*$)/gm);

    if (!optionLines || optionLines.length === 0) {
        log.warn("Could not extract any numbered option lines from the options section.");
        log.parse(`Options text was:\n${optionsText}`);
        return null;
    }

    const options = optionLines.map(line => line.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean);

    log.parse(`Found ${options.length} potential options.`);
    if (options.length !== 7) {
      log.error(`OPTION COUNT ERROR! Found ${options.length}, expected 7.`);
      log.parse(`Raw options text analyzed:\n${optionsText}`);
      return null;
    }

    const debugMatch = text.match(/🔸\s*\*\*Debug Reasoning\*\*:\s*([\s\S]*?)(?:<final_analysis>|$)/i);
    const debugContent = debugMatch?.[1]?.trim() || "";
    log.parse(`Found debug reasoning: ${debugContent.length > 0 ? debugContent.substring(0, 100) + '...' : 'Empty'}`);

    const psycheParams = extractPsycheParameters(debugContent); // Call the corrected function
    const images = generateImages(options);

    return {
      iteration,
      question,
      options,
      images,
      debugContent,
      psyche_parameters: psycheParams
    };

  } catch (error) {
    // Log the specific error during question parsing itself
    log.error(`Exception during question content parsing:`, error);
    // Return null to indicate failure, the calling function (parseStructuredOutput) will handle it
    return null;
  }
}

// Parses the final analysis block
function parseFinalAnalysis(text) {
  log.parse("Attempting to parse final analysis block...");
  try {
    const finalAnalysisMatch = text.match(/<final_analysis>(.*?)<\/final_analysis>/is);
    if (!finalAnalysisMatch?.[1]) {
      log.parse("No <final_analysis>...</final_analysis> tags found.");
      return null;
    }
    const analysisContent = finalAnalysisMatch[1].trim();
    log.parse(`Found final analysis content (length: ${analysisContent.length}).`);

    const alignmentMatch = analysisContent.match(/ALIGNMENT SCORE:\s*\[?(\d+(?:\.\d+)?)\s*%?\s*\]?/i);
    const trustMatch = analysisContent.match(/TRUST_LEVEL:\s*\[?(\d+(?:\.\d+)?)\s*%?\s*\]?/i);
    const tensionMatch = analysisContent.match(/TENSION_PROFILE:\s*\[?([^\]\n]+)\]?/i);

    const structuredAnalysis = {
      html: analysisContent,
      metrics: {
        alignment_score: alignmentMatch ? parseFloat(alignmentMatch[1]) : null,
        trust_level: trustMatch ? parseFloat(trustMatch[1]) : null,
        tension_profile: tensionMatch ? tensionMatch[1].replace(/"/g,'').split(',').map(t => t.trim()).filter(Boolean) : [], // Added quote removal
      }
    };

    log.parse(`Parsed metrics: Alignment=${structuredAnalysis.metrics.alignment_score ?? 'N/A'}, Trust=${structuredAnalysis.metrics.trust_level ?? 'N/A'}`);
    return structuredAnalysis;
  } catch (error) {
    log.error(`Exception during final analysis parsing:`, error);
    return null;
  }
}// Main parser function called by the service
function parseStructuredOutput(completion, expectedIteration) {
  log.parse(`Starting structured parsing for expected iteration ${expectedIteration}...`);
  let result = {};
  let parseError = null;

  try {
      const thinkMatch = completion.match(/<think>([\s\S]*?)<\/think>/is);
      if (thinkMatch?.[1]) {
        log.llm(`LLM Reasoning:\n${thinkMatch[1].trim()}`);
      }
      const contentToParse = thinkMatch ? completion.substring(thinkMatch[0].length) : completion;
      log.parse(`Content for parsing (first 200 chars):\n${contentToParse.substring(0, 200)}...`);

      const questionData = parseQuestionContent(contentToParse, expectedIteration); // Calls corrected parseQuestionContent
      if (questionData) {
          Object.assign(result, questionData);
          log.parse(`Successfully parsed question content for iteration ${questionData.iteration}.`);
      } else {
           // Don't set parseError here yet, just log. Let validation below handle it.
          log.warn(`Could not parse standard question structure for expected iteration ${expectedIteration}.`);
      }

      const finalAnalysisData = parseFinalAnalysis(contentToParse);
      if (finalAnalysisData) {
          result.final_analysis = finalAnalysisData;
          log.parse("Successfully parsed final analysis content.");
      }

      // Validation (remains the same)
      if (!result.question && !result.final_analysis) {
          parseError = new Error("Parsing failed: No valid question or final analysis found in LLM output.");
          log.error(parseError.message);
      } else if (result.question && (!result.options || result.options.length !== 7)) {
          parseError = new Error(`Parsing failed: Question found, but expected 7 options, got ${result.options?.length || 0}.`);
          log.error(parseError.message);
      } else if (!result.question && expectedIteration < 10 && result.final_analysis) {
          log.warn(`Unexpected final analysis found before iteration 10 (expected ${expectedIteration}).`);
      } else if (result.question && expectedIteration === 10 && !result.final_analysis) {
           log.warn(`Expected final analysis for iteration 10, but it was not found in the response.`);
      }

  } catch (error) { // Catch errors from the overall parsing attempt
      log.error("Exception during main structured parsing execution:", error);
      parseError = error; // Assign the caught exception
  }

  // Handle Parsing Failure (remains the same)
  if (parseError) {
      if (!parseError.code) parseError.code = ERROR_CODES.PARSING_FAILURE; // Ensure code exists
      if (!parseError.statusCode) parseError.statusCode = 502;
      throw parseError;
  }

  // Post-processing (remains the same)
  if (result.options && !result.images) {
      log.warn("Generating fallback images as they were missing after parsing.");
      result.images = generateImages(result.options);
  }

  log.parse("Structured parsing completed successfully.");
  return result;
}


// --- Legacy Parser (Optional Fallback) ---
// Kept minimal, as structured parsing should be the primary path
function parseCompletionToQuestionFormat(completion, session_state) {
    log.warn("Using legacy parser as fallback.");
    try {
      const questionMatch = completion.match(/<question iteration="(\d+)">(.*?)<\/question>/is);
      const iteration = questionMatch ? parseInt(questionMatch[1]) : (session_state?.iteration || 0) + 1;
      const question = questionMatch ? questionMatch[2].trim() : "Fallback: Describe your financial state metaphorically?";

      const optionsSection = completion.match(/## Metaphorical Options:(.*?)(?:🔸|<!--|$)/is);
      let options = [];
      if (optionsSection?.[1]) {
        options = optionsSection[1].trim().split('\n')
          .map(line => line.replace(/^\s*\d+\.\s*/, '').trim())
          .filter(Boolean);
      }

      if (options.length !== 7) {
         log.error(`Legacy Parser: Option count mismatch (${options.length}). Padding/truncating.`);
         while(options.length < 7) options.push(`Placeholder ${options.length + 1}`);
         options = options.slice(0, 7);
      }

      const debugMatch = completion.match(/🔸\s*\*\*Debug Reasoning\*\*:\s*([\s\S]*?)(?:<final_analysis>|$)/i);
      const debugContent = debugMatch ? debugMatch[1].trim() : "Debug info unavailable.";

      const images = generateImages(options);
      const psycheParams = extractPsycheParameters(debugContent);

      return { iteration, question, options, images, debugContent, psyche_parameters: psycheParams };
    } catch (error) {
      log.error("Error in legacy parser:", error);
      const legacyParseError = new Error("Failed to parse completion using legacy method.");
      legacyParseError.code = ERROR_CODES.PARSING_FAILURE;
      throw legacyParseError; // Throw error if legacy parsing fails
    }
}


module.exports = {
    parseStructuredOutput,
    parseQuestionContent, // Export if needed for testing
    parseFinalAnalysis,   // Export if needed for testing
    extractPsycheParameters, // Export if needed for testing
    generateImages,         // Export if needed for testing
    // parseCompletionToQuestionFormat // Optionally export legacy parser
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/routes/apiRoutes.js

```python
// server/routes/apiRoutes.js
const express = require('express');
const crypto = require('crypto');
const { PROCESSING_TIMEOUT_MS } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');
const log = require('../utils/logger');
const { generateQuestion, generateFinalAnalysis } = require('../services/openaiService');

const router = express.Router();

// In-memory store for processing state - could be replaced with Redis or similar
const processingQueue = new Map();

// Function to clean up timed-out entries
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of processingQueue.entries()) {
    if (session.processing && now - session.startTime > PROCESSING_TIMEOUT_MS) {
      log.warn(`Session ${sessionId} timed out and marked as error.`);
      // Update session to indicate timeout error instead of deleting immediately
      processingQueue.set(sessionId, {
        ...session,
        processing: false,
        error: true,
        errorCode: ERROR_CODES.TIMEOUT_ERROR,
        errorMessage: `Processing timed out after ${PROCESSING_TIMEOUT_MS / 1000} seconds.`
      });
    }
    // Clean up very old non-processing entries (e.g., > 2*timeout)
    else if (!session.processing && now - session.startTime > PROCESSING_TIMEOUT_MS * 2) {
        log.info(`Cleaning up old session entry: ${sessionId}`);
        processingQueue.delete(sessionId);
    }
  }
}, 60 * 1000); // Check every minute


// --- Route Handlers ---

// Initiate question generation
router.post('/get_question', async (req, res, next) => {
    const { session_state } = req.body;

    // --- Input Validation ---
    if (!session_state) {
      return res.status(400).json({
        error: ERROR_CODES.SESSION_STATE_REQUIRED,
        message: "Missing session_state in request body"
      });
    }
    if (typeof session_state?.iteration !== 'number' || session_state.iteration < 0) {
      return res.status(400).json({
        error: ERROR_CODES.INVALID_ITERATION,
        message: "session_state.iteration must be a non-negative number"
      });
    }
     if (!Array.isArray(session_state?.history)) {
        return res.status(400).json({
         error: ERROR_CODES.INVALID_SESSION_STATE,
         message: "session_state.history must be an array"
       });
     }
     // Add more detailed validation of history items if needed

    const sessionId = crypto.randomBytes(8).toString('hex');

    try {
        // Store initial processing state
        processingQueue.set(sessionId, {
          processing: true,
          startTime: Date.now(),
          session_state: JSON.parse(JSON.stringify(session_state)), // Deep copy state
        });

        // Respond immediately that processing has started
        res.status(202).json({ // 202 Accepted
          status: "processing",
          sessionId
        });

        // --- Start Background Processing ---
        // Do not await this call
        processRequest(sessionId, session_state)
          .catch(error => {
             // Catch errors during the async background process
             log.error(`Background processing failed for session ${sessionId}:`, error);
             processingQueue.set(sessionId, {
               ...processingQueue.get(sessionId), // Keep original info like startTime
               processing: false,
               error: true,
               errorCode: error.code || ERROR_CODES.PROCESSING_ERROR,
               errorMessage: error.message || "An unknown error occurred during processing."
             });
          });

    } catch (error) {
        log.error("Error initiating /api/get_question:", error);
        next(error); // Pass to central error handler
    }
});

// Consolidated processing logic called in the background
async function processRequest(sessionId, session_state) {
    const iteration = session_state?.iteration || 0;
    let result;

    log.info(`Starting background processing for session ${sessionId}, iteration ${iteration + 1}`);

    try {
        if (iteration >= 10) {
            result = await generateFinalAnalysis(session_state);
        } else {
            result = await generateQuestion(session_state);
        }

        // Update queue with successful result
        processingQueue.set(sessionId, {
            ...processingQueue.get(sessionId), // Keep startTime, etc.
            processing: false,
            result // Store the successful result
        });
        log.info(`Processing finished successfully for session ${sessionId}`);

    } catch (error) {
        log.error(`Error during background task for session ${sessionId}:`, error);
        // Let the catch block in the calling route handle updating the queue with error state
        throw error; // Re-throw the error so the .catch() in the route handler picks it up
    }
}

// Get the result of processing
router.post('/get_result', (req, res, next) => {
    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({
            error: ERROR_CODES.MISSING_SESSION_ID,
            message: "sessionId query parameter is required"
        });
    }

    if (!processingQueue.has(sessionId)) {
        // Session might be invalid, expired, or already retrieved
        return res.status(404).json({
            error: ERROR_CODES.SESSION_NOT_FOUND,
            message: "Session not found. It may have expired, timed out, or is invalid."
        });
    }

    const session = processingQueue.get(sessionId);

    if (session.processing) {
        // Still processing
        return res.status(200).json({ // 200 OK, status indicates processing
            status: "processing",
            elapsedMs: Date.now() - session.startTime
        });
    }

    // --- Processing is finished ---

    // Important: Remove the session from the queue *after* retrieving its final state
    processingQueue.delete(sessionId);
    log.info(`Session ${sessionId} result retrieved and removed from queue.`);

    if (session.error) {
        // Processing finished with an error
        log.error(`Returning error for session ${sessionId}: ${session.errorMessage}`);
        // Use a status code appropriate for the error type if possible
        const statusCode = (session.errorCode === ERROR_CODES.LLM_API_ERROR || session.errorCode === ERROR_CODES.PARSING_FAILURE) ? 502 : 500;
        return res.status(statusCode).json({
            error: session.errorCode || ERROR_CODES.PROCESSING_ERROR,
            message: session.errorMessage || "An error occurred while processing your request."
        });
    }

    // Processing finished successfully - return the result
    return res.json(session.result);
});

// Optional: Status check endpoint (alternative to polling /get_result)
router.get('/status', (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({
        error: ERROR_CODES.MISSING_SESSION_ID,
        message: "sessionId query parameter is required",
        processing: false // Indicate not processing if no ID
      });
    }

    if (!processingQueue.has(sessionId)) {
      // Consistent response: if not found, it's not processing
      return res.json({ processing: false });
    }

    const session = processingQueue.get(sessionId);
    res.json({
        processing: session.processing,
        elapsedMs: Date.now() - session.startTime
        // Don't return error/result here, keep this endpoint simple
    });
});


module.exports = router;
```

## File: /Users/limi/Documents/GitHub/fincrystal/server/services/openaiService.js

```python
// server/services/openaiService.js
const fetch = require('node-fetch'); // Use v2 if using CommonJS: npm install node-fetch@2
const fs = require('fs');
const path = require('path');
const { AZURE_API_KEY, AZURE_API_BASE, DEPLOYMENT_NAME, MODEL_NAME, AZURE_API_VERSION, MAX_RETRIES, RETRY_DELAY_MS } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');
const log = require('../utils/logger');
const { parseStructuredOutput, parseFinalAnalysis: parseFinalAnalysisUtil } = require('../utils/parser');

// --- Azure API Call ---
async function callAzureOpenAI(messages, options = {}, retries = MAX_RETRIES) {
    if (!AZURE_API_KEY || !AZURE_API_BASE || !DEPLOYMENT_NAME) {
      const error = new Error("Azure OpenAI credentials not configured in .env file.");
      error.code = ERROR_CODES.MISSING_CREDENTIALS;
      error.statusCode = 500; // Internal server configuration error
      throw error;
    }

    // Construct the correct URL format for Azure OpenAI
    const url = `${AZURE_API_BASE}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_API_VERSION}`;

    // ******** CORE CHANGE HERE ********
    // Use max_completion_tokens instead of max_tokens
    const payload = {
      messages,
      //temperature: options.temperature ?? 0.3,
      // Use the correct parameter name from the options object or default
      max_completion_tokens: options.max_completion_tokens ?? 4000,
      model: options.model || MODEL_NAME, // Pass model if needed by Azure (often determined by deployment)
      // stream: false, // Ensure streaming is off if not handling it
      // Add other parameters supported by your specific model/API version if needed
    };
    // Remove the old parameter if it somehow exists in options, just in case
    // Although we control the options passed in, this adds robustness
    if ('max_tokens' in options) {
        log.warn("Deprecated 'max_tokens' found in options, ignoring.");
        // delete payload.max_tokens; // Not needed as we build payload fresh
    }

    const body = JSON.stringify(payload);

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_API_KEY
        },
        body: body,
        // timeout: 30000 // Optional: Add a request timeout (e.g., 30 seconds)
    };

    log.llm(`Calling Azure OpenAI: ${url} (Model via Deployment: ${DEPLOYMENT_NAME})`);
    // log.debug(`Payload: ${body}`); // Be cautious logging full payloads

    try {
      const response = await fetch(url, requestOptions);
      const responseBody = await response.text(); // Read body as text first for better error diagnosis

      if (!response.ok) {
            log.error(`Azure OpenAI API Error (${response.status}): ${response.statusText}`);
            log.error(`Response Body: ${responseBody}`);
            let errorData = {};
            try { errorData = JSON.parse(responseBody); } catch (e) { /* Ignore JSON parse error */ }

            // Check if the specific error indicates the parameter issue again
            if (errorData.error?.code === 'unsupported_parameter' && errorData.error?.param === 'max_tokens') {
                 // This indicates the fix might not have been applied correctly or cached?
                 log.error("FATAL: Still getting 'max_tokens' error despite code change. Check deployment/cache.");
                 // Don't retry for this specific fatal error if the code *should* be fixed.
                 const error = new Error(errorData.error?.message || `Azure API parameter error with status ${response.status}`);
                 error.code = ERROR_CODES.LLM_API_ERROR;
                 error.details = errorData;
                 error.statusCode = response.status;
                 throw error; // Throw immediately
            }

            // Handle rate limits (429) or general server errors (5xx) for retries
            if ((response.status === 429 || response.status >= 500) && retries > 0) {
              log.warn(`Retrying Azure API call due to status ${response.status} (${retries} retries left)...`);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
              return callAzureOpenAI(messages, options, retries - 1); // Ensure options are passed correctly
            }

            // Throw a structured error for non-retried failures
            const error = new Error(errorData.error?.message || `Azure API request failed with status ${response.status}: ${response.statusText}`);
            error.code = ERROR_CODES.LLM_API_ERROR;
            error.details = errorData;
            error.statusCode = response.status; // Propagate HTTP status code
            throw error;
      }

      // Parse the successful JSON response
      const data = JSON.parse(responseBody);

      // Validate response structure
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
         log.error("Invalid response structure from Azure OpenAI:", data);
         const error = new Error("Received invalid or empty response from LLM.");
         error.code = ERROR_CODES.LLM_API_ERROR;
         error.statusCode = 502; // Bad Gateway - upstream error
         throw error;
      }

      const completion = data.choices[0].message.content;
      log.llm(`Received raw response snippet: ${completion.substring(0, 150)}...`);
      log.divider();
      return completion; // Return only the content string

    } catch (error) {
      // Catch fetch errors (network issues) or errors thrown above
      if (error.code !== ERROR_CODES.LLM_API_ERROR && error.code !== ERROR_CODES.MISSING_CREDENTIALS && retries > 0) {
         log.warn(`Network or fetch error during API call. Retrying (${retries} retries left)...`, error.message);
         await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
         return callAzureOpenAI(messages, options, retries - 1);
      }

      log.error('Failed to call Azure OpenAI after retries:', error);
      // Ensure the error has a code and potentially a statusCode if not already set
      if (!error.code) error.code = ERROR_CODES.LLM_API_ERROR;
      if (!error.statusCode) error.statusCode = 502; // Default to 502 for upstream failures
      throw error; // Re-throw the error after handling retries
    }
}

// --- Prompt Generation --- (Keep existing functions getSystemPrompt, createQuestionPrompt, createFinalAnalysisPrompt)
function getSystemPrompt() {
    const promptPath = path.join(__dirname, '../prompts', 'sns_msm_prompt.txt');
    try {
      if (!fs.existsSync(promptPath)) {
        log.warn(`Prompt file not found at ${promptPath}. Using fallback.`);
        throw new Error("Prompt file missing");
      }
      const promptTemplate = fs.readFileSync(promptPath, 'utf8');
      return promptTemplate.trim();
    } catch (error) {
      log.error("Error reading system prompt template:", error);
      // Fallback system prompt (keep concise)
      return "You are a 1984-era financial therapist using metaphors. Conduct a 10-question adaptive ritual. Respond ONLY in the specified XML-like format: <think>...</think> <question iteration=\"N\">...</question> ## Metaphorical Options:\n1. ...\n7. ...\n🔸 **Debug Reasoning**: ...";
    }
}

function createQuestionPrompt(session_state) {
    const iteration = session_state?.iteration || 0;
    const history = session_state?.history || [];

    let historyPrompt = "";
    if (history.length > 0) {
      historyPrompt = "User's session history so far:\n\n";
      history.forEach(item => {
        // Ensure essential items are present before adding to prompt
        if (item.iteration && item.question && item.metaphor) {
           historyPrompt += `Q${item.iteration}: ${item.question}\n`;
           historyPrompt += `User chose: "${item.metaphor}"\n`;
           // Include parameters if they were stored and seem useful
           if (item.parameters && Object.keys(item.parameters).length > 0) {
              historyPrompt += `Implied Parameters: ${JSON.stringify(item.parameters)}\n`;
           }
           if (item.avoided_metaphors && item.avoided_metaphors.length > 0) {
              historyPrompt += `Avoided: ${item.avoided_metaphors.join(', ')}\n`;
           }
           historyPrompt += "\n";
        }
      });
    }

    const finalAnalysisInstruction = iteration === 9
    ? "\n\nFINAL STEP: Generate the standard response block for Question 10 first (think, question, options, debug). IMMEDIATELY FOLLOWING that block, generate the final analysis, wrapping it ONLY in <final_analysis> tags and including the DEBUG LEDGER inside."
    : "";

    // Construct the user prompt for the LLM
    return `Continue the financial psyche analysis ritual. This is question #${iteration + 1} of 10.
Base your response STRICTLY on the user's history and your internal reasoning.

${historyPrompt}
Required Output Format:
1.  A <think> block explaining your reasoning for the question and options.
2.  A <question iteration="${iteration + 1}"> tag containing the question text.
3.  A "## Metaphorical Options:" section with exactly 7 numbered options.
4.  A "🔸 **Debug Reasoning**:" section detailing the psyche parameters mapped to each option (e.g., "volcano" → {"risk_tolerance": 0.8, "urgency": 0.7}). Include any identified 'blockages'.
${finalAnalysisInstruction}

Generate the response now.`;
}

function createFinalAnalysisPrompt(session_state) {
  const history = session_state?.history || [];
  let historySummary = "User's choices summary:\n";
  history.forEach(item => {
      if (item.iteration && item.metaphor) {
          historySummary += `Q${item.iteration}: Chose "${item.metaphor}"`;
          // Optionally add parameters for this choice if insightful
           if (item.parameters && Object.keys(item.parameters).length > 0) {
               // Keep concise for prompt
               const paramsSummary = Object.entries(item.parameters)
                   .map(([k, v]) => `${k}:${typeof v === 'number' ? v.toFixed(2) : v}`)
                   .join(', ');
               historySummary += ` (${paramsSummary})\n`;
           } else {
               historySummary += `\n`;
           }
      }
  });

  let aggregatedParamsSummary = "Aggregated Psyche Parameters (Estimate):\n";
  if (session_state.parameters && Object.keys(session_state.parameters).length > 0) {
      for (const [key, value] of Object.entries(session_state.parameters)) {
          // Format numbers, handle blockages separately if needed
          const formattedValue = typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value);
          aggregatedParamsSummary += `- ${key}: ${formattedValue}\n`;
      }
  } else {
      aggregatedParamsSummary += "- Parameters could not be aggregated.\n";
  }

  // --- NEW PROMPT STRUCTURE ---
  return `The 10-question SNS-MSM ritual is complete. Analyze the user's financial psyche based on the history and aggregated parameters below.

Session History:
${historySummary}
Aggregated Parameters:
${aggregatedParamsSummary}

Required Output Format:
Your response MUST be wrapped ONLY in <final_analysis> tags. Inside these tags, create an HTML structure suitable for display and potential sharing. Use the provided CSS classes.

<final_analysis>
<div class="profile-box">
  <div class="profile-header">
    <span class="profile-title">Financial Psyche Scan: SNS-MSM Profile</span>
    <span class="profile-session-id">Session ID: [Generate a short, thematic ID like '84-CRYSTAL-XYZ']</span>
  </div>

  <div class="profile-archetype">
    <h3>Dominant Archetype:</h3>
    <p>[Identify and name a core archetype based on the overall pattern, e.g., "The Calculated Risk Navigator", "The Cautious Legacy Builder", "The Impulsive Innovator". Use evocative 1984-therapist language.]</p>
  </div>

  <div class="profile-parameters">
    <h3>Key Psyche Parameters:</h3>
    <div class="param-grid">
      <div class="param-item">
        <span class="param-label">Risk Tolerance:</span>
        <span class="param-value">[Map aggregated risk_tolerance (0-1) to a label: e.g., Very Low, Low, Measured, Calculated, High, Volatile]</span>
        <!-- Optional: Add a simple visual bar/gauge representation if feasible -->
      </div>
      <div class="param-item">
        <span class="param-label">Planning Horizon:</span>
        <span class="param-value">[Map aggregated planning_horizon (0-1) to label: Immediate, Short-Term, Mid-Term, Long-Term, Generational]</span>
      </div>
      <div class="param-item">
        <span class="param-label">Security Focus:</span>
        <span class="param-value">[Map aggregated security_focus (0-1) to label: Low, Seeking, Balanced, High, Absolute]</span>
      </div>
       <div class="param-item">
        <span class="param-label">Innovation / Growth:</span>
        <span class="param-value">[Map aggregated innovation/growth_potential (0-1) to label: Resistant, Cautious, Adaptive, Eager, Disruptive]</span>
      </div>
       <div class="param-item">
        <span class="param-label">Resilience / Recovery:</span>
        <span class="param-value">[If data available, map resilience/transformation: Low, Moderate, High, Transformative]</span>
      </div>
       <div class="param-item">
        <span class="param-label">Trust Level (Est.):</span>
        <span class="param-value">[Estimate % based on choices related to systems/collaboration]</span>
      </div>
      <!-- Add more parameters as relevant based on your prompt/parsing -->
    </div>
  </div>

  <div class="profile-duality">
    <h3>Core Tension / Duality:</h3>
    <p class="duality-text">"[Quote or paraphrase the primary conflict, e.g., Security vs. Opportunity, Impulse vs. Control, Legacy vs. Innovation]"</p>
  </div>

  <div class="profile-shadow">
    <h3>Potential Shadow Aspect:</h3>
    <p class="shadow-text">[Identify a potential blind spot, fear, or hidden tendency suggested by consistent avoidances or contradictions. Frame it gently using therapist persona. e.g., "A potential reluctance to fully embrace stability, possibly stemming from a fear of stagnation." or "An aversion to external collaboration might mask a deeper distrust..."]</p>
  </div>

  <div class="profile-summary">
     <h3>Analyst's Observation:</h3>
     <p>[Provide a VERY concise (2-3 sentences max) narrative summary in the 1984 therapist voice, synthesizing the key findings.]</p>
  </div>

</div>
</final_analysis>`;
}


// --- Service Functions ---
async function generateQuestion(session_state) {
    const currentIteration = session_state?.iteration || 0;
    log.info(`Generating question for iteration ${currentIteration + 1}`);
    const prompt = createQuestionPrompt(session_state);
    log.debug(`User Prompt:\n${prompt}`); // Log the prompt being sent

    try {
      // ******** CHANGE HERE ********
      // Pass max_completion_tokens in the options object
      const completion = await callAzureOpenAI(
        [{ role: "system", content: getSystemPrompt() }, { role: "user", content: prompt }],
        { max_completion_tokens: 4000 } // Use the correct parameter name
      );

      log.debug(`Raw Completion for Q${currentIteration + 1}:\n${completion}`);
      const parsedResult = parseStructuredOutput(completion, currentIteration + 1);

      // Basic validation of parsed result
      if (!parsedResult || (!parsedResult.question && !parsedResult.final_analysis)) {
          log.error("Parsing failed to extract question or final analysis.", parsedResult);
          throw new Error("LLM response could not be parsed into the expected question format.");
      }
      if (parsedResult.question && (!parsedResult.options || parsedResult.options.length !== 7)) {
          log.error(`Parsing error: Expected 7 options, found ${parsedResult.options?.length || 0}.`);
          throw new Error("LLM response did not contain exactly 7 options.");
      }

      log.info(`Successfully generated and parsed question ${parsedResult.iteration || (currentIteration + 1)}.`);
      // If Q10 response includes final analysis, return both parts
      return parsedResult;

    } catch (error) {
      log.error(`Error in generateQuestion service for iteration ${currentIteration + 1}:`, error);
      // Ensure error is propagated correctly
      error.code = error.code || ERROR_CODES.LLM_API_ERROR;
      error.statusCode = error.statusCode || 502;
      throw error;
    }
}

// Make sure generateFinalAnalysis passes the *full* session_state
async function generateFinalAnalysis(session_state) { // Expect full state
  log.info("Generating final analysis.");
  // Pass the full state, including aggregated params, to the prompt function
  const prompt = createFinalAnalysisPrompt(session_state);
  log.debug(`Final Analysis Prompt:\n${prompt}`);

  try {
    const completion = await callAzureOpenAI(
      [{ role: "system", content: getSystemPrompt() }, { role: "user", content: prompt }],
      { temperature: 0.6, max_completion_tokens: 2000 } // Slightly more creative temp
    );

    log.debug(`Raw Final Analysis Completion:\n${completion}`);
    // Use the existing parser which expects <final_analysis> and extracts html/metrics
    const parsedAnalysis = parseFinalAnalysisUtil(completion);

    if (parsedAnalysis?.html) {
      log.info("Successfully parsed final analysis block.");
       // We only need the HTML part for the frontend now, metrics are implicit in the HTML
      return { final_analysis: { html: parsedAnalysis.html, metrics: {} } }; // Return structure frontend expects
    } else {
      log.warn("Could not parse <final_analysis> tag. Returning raw completion wrapped.");
      // Fallback: return the raw completion within the expected structure
      return { final_analysis: { html: `<div class="profile-box"><p>Analysis structure error. Raw output:</p><pre>${completion.replace(/</g, '<')}</pre></div>`, metrics: {} } };
    }

  } catch (error) {
    log.error("Error in generateFinalAnalysis service:", error);
    error.code = error.code || ERROR_CODES.FINAL_ANALYSIS_FAILURE;
    error.statusCode = error.statusCode || 502;
    throw error; // Re-throw
  }
}


module.exports = {
  generateQuestion,
  generateFinalAnalysis,
  // getSystemPrompt // Keep internal unless needed
};
```

## File: /Users/limi/Documents/GitHub/fincrystal/public/js/script.js

```python
// public/js/script.js - Frontend Logic

// Wrap in IIFE to avoid global scope pollution
(function() {
    'use strict'; // Enable strict mode
  
    // --- State ---
    let currentSessionState = { iteration: 0, history: [], parameters: {} };
    let currentSessionId = null;
    let isProcessing = false; // Tracks if a request is currently in flight
    let pollingTimeoutId = null; // ID for the polling timeout
  
    // --- DOM Elements Cache ---
    const introScreen = document.getElementById('introScreen');
    const mainScreen = document.getElementById('mainScreen');
    const finalAnalysisScreen = document.getElementById('finalAnalysis');
    const progressBar = document.getElementById('progressBar');
    const progressPercentLabel = document.getElementById('progressPercent'); // Label for percentage
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const questionContainer = document.getElementById('questionContainer');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const analysisContentEl = document.getElementById('analysisContent');
    const sessionStateDebugEl = document.getElementById('session-state-debug');
    const debugInfoEl = document.getElementById('debug');
  
    // --- Constants ---
    const POLLING_INTERVAL_MS = 1500; // Check status every 1.5 seconds
    const MAX_POLLING_ATTEMPTS = 60; // Approx 1.5 minutes timeout for polling
    const API_BASE_URL = '/api'; // Prefix for all API calls
  
    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM Loaded. Initializing Crystal Gazer.");
      setupEventListeners();
      showScreen('intro');
      updateSessionStateDebug();
      // CSS should handle grid/animations now
    });
  
    function setupEventListeners() {
      startBtn?.addEventListener('click', startConsultation);
      restartBtn?.addEventListener('click', resetConsultation);
      // Listener for dynamically created retry buttons
      document.body.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('retry-btn')) {
          console.log("Retry button clicked.");
          clearLoadingAndError(); // Clear error message
          fetchNextQuestion(); // Retry fetching the question
        }
      });
    }
  
    // --- Screen Management ---
    function showScreen(screenName) {
      // Ensure elements exist before manipulating classes
      introScreen?.classList.add('hidden', 'fade-out');
      mainScreen?.classList.add('hidden', 'fade-out');
      finalAnalysisScreen?.classList.add('hidden', 'fade-out');
  
      let screenToShow = null;
      switch (screenName) {
        case 'intro': screenToShow = introScreen; break;
        case 'main': screenToShow = mainScreen; break;
        case 'final': screenToShow = finalAnalysisScreen; break;
        default: console.error(`Unknown screen name: ${screenName}`); return;
      }
  
      if (screenToShow) {
        screenToShow.classList.remove('hidden');
        void screenToShow.offsetWidth; // Trigger reflow for transition
        screenToShow.classList.remove('fade-out');
        screenToShow.classList.add('fade-in');
      } else {
         console.error(`Screen element not found for: ${screenName}`);
      }
    }
  
  
    // --- Core Logic ---
  
    function startConsultation() {
      console.log("Starting consultation...");
      resetSession(); // Ensure state is clean before starting
      showScreen('main');
      fetchNextQuestion();
    }
  
    function resetConsultation() {
      console.log("Resetting consultation...");
      showScreen('intro');
      resetSession();
      clearLoadingAndError();
    }
  
    function resetSession() {
      currentSessionState = { iteration: 0, history: [], parameters: {} };
      currentSessionId = null;
      isProcessing = false;
      stopPolling();
      updateProgressBar();
      updateSessionStateDebug();
      console.log("Session state reset.");
    }
  
    async function fetchNextQuestion() {
      if (isProcessing) {
        console.warn("Already processing, ignoring request to fetch next question.");
        return;
      }
      isProcessing = true;
      showLoading("Consulting the financial crystal...");
  
      try {
        // Make API call using the new structure /api prefix
        const response = await fetchFromServer(`${API_BASE_URL}/get_question`, 'POST', { session_state: currentSessionState });
  
        if (response.status === "processing" && response.sessionId) {
          currentSessionId = response.sessionId;
          console.log(`Request accepted (Session ID: ${currentSessionId}). Starting polling.`);
          startPolling(currentSessionId);
        } else {
          console.error("Received unexpected non-processing status from /get_question:", response);
          throw new Error("Invalid initial response from server. Expected 'processing' status.");
        }
      } catch (error) {
        console.error("Failed to initiate question request:", error);
        showErrorUI("Could not connect to the crystal ball.", error.message || "Please check your connection and retry.");
        // isProcessing = false; // Reset happens in showErrorUI
      }
    }
  
    function startPolling(sessionId) {
      stopPolling(); // Clear any previous polling timeouts
  
      let attempts = 0;
  
      async function poll() {
        if (!currentSessionId || sessionId !== currentSessionId) {
             console.log("Polling stopped: Session ID changed or cleared.");
             return; // Stop if session ID changed (e.g., reset)
         }
        if (attempts >= MAX_POLLING_ATTEMPTS) {
          console.error("Polling timed out after maximum attempts.");
          showErrorUI("The crystal ball seems unresponsive.", "The request took too long. Please try again later.");
          // isProcessing = false; // Reset in showErrorUI
          // currentSessionId = null; // Reset in showErrorUI
          return;
        }
  
        attempts++;
        console.log(`Polling attempt ${attempts}/${MAX_POLLING_ATTEMPTS} for session ${sessionId}...`);
  
        try {
          // Directly attempt to get the result
          const resultResponse = await fetchFromServer(`${API_BASE_URL}/get_result?sessionId=${sessionId}`, 'POST', {}); // No body needed for polling result
  
          // Check again if session context is still valid *after* the await
          if (sessionId !== currentSessionId) {
              console.log("Polling stopped: Session context changed during fetch.");
              return;
          }
  
          if (resultResponse.status === "processing") {
            // Still processing, schedule next poll with slight backoff
            pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL_MS + attempts * 50); // Small linear backoff
          } else {
            // Result is ready (or an error occurred during backend processing)
            console.log("Polling complete. Received result:", resultResponse);
            stopPolling(); // Stop polling now that we have a final response
  
            // The backend might return a structured error *within* the result endpoint
            if (resultResponse.error) {
               console.error("Backend processing resulted in an error:", resultResponse);
               // Throw an error to be caught by the outer catch block for UI display
               const backendError = new Error(resultResponse.message || "An error occurred on the server.");
               backendError.code = resultResponse.error;
               throw backendError;
            }
  
            // Successfully got data, render it
            processResult(resultResponse);
            // isProcessing = false; // Reset in processResult
            // currentSessionId = null; // Reset in processResult
          }
        } catch (error) {
           // Handle errors during the polling request itself (network, server 5xx, 404)
           console.error(`Polling attempt ${attempts} failed:`, error);
  
            // Check if session context is still valid *after* the await error
            if (sessionId !== currentSessionId) {
                console.log("Polling stopped: Session context changed during fetch error.");
                return;
            }
  
           // Decide whether to retry or fail based on error type
           if (error.code === 'SESSION_NOT_FOUND' || attempts >= MAX_POLLING_ATTEMPTS) {
               // Fatal error or max attempts reached
               stopPolling();
               showErrorUI("Session Expired or Invalid.", error.message || "Could not retrieve the result. Please try starting over.");
           } else {
               // Retry after a longer delay on error
               pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL_MS * 2 + attempts * 100);
           }
        }
      }
  
      // Start the first poll immediately
      pollingTimeoutId = setTimeout(poll, 100); // Start quickly
    }
  
    function stopPolling() {
      if (pollingTimeoutId) {
        clearTimeout(pollingTimeoutId);
        pollingTimeoutId = null;
        console.log("Polling stopped.");
      }
    }
  
    function processResult(data) {
       console.log("Processing final result from server:", data);
       clearLoadingAndError(); // Make sure loading/errors are hidden
  
       if (data.final_analysis) {
          renderFinalAnalysis(data.final_analysis);
       } else if (data.question && data.options) {
          // Check iteration consistency (optional, backend is source of truth)
          if(typeof data.iteration === 'number' && data.iteration !== currentSessionState.iteration + 1) {
              console.warn(`Iteration mismatch: Client expected ${currentSessionState.iteration + 1}, Server sent ${data.iteration}.`);
              // It's generally safer to trust the server's iteration number included with the question data
              // currentSessionState.iteration = data.iteration - 1; // Adjust client state? Risky if history relies on old numbers.
          }
          renderQuestionScreen(data);
       } else {
          console.error("Received invalid data structure from server:", data);
          showErrorUI("Received incomplete data from the crystal.", "The response from the server was malformed.");
       }
       isProcessing = false; // Mark processing as finished after rendering/handling result
       currentSessionId = null; // Clear session ID after successfully getting result
    }
  
  
    function selectOption(selectedMetaphor, questionData) {
      if (isProcessing) {
        console.warn("Currently processing, selection ignored.");
        return;
      }
      // Use the iteration number provided WITH the question data
      const questionIteration = questionData.iteration;
      console.log(`Selected: "${selectedMetaphor}" for Q${questionIteration}`);
      playSelectionSound();
  
      // --- Update UI ---
      const optionElements = optionsEl?.querySelectorAll('li');
      if (!optionElements) return;
  
      let selectedElement = null;
      optionElements.forEach(li => {
        li.classList.remove('selected');
        li.style.pointerEvents = 'none'; // Disable further clicks
        const span = li.querySelector('span');
        if (span && span.textContent === selectedMetaphor) {
          selectedElement = li;
        }
      });
      selectedElement?.classList.add('selected');
  
  
      // --- Update State ---
      const avoidedMetaphors = questionData.options.filter(opt => opt !== selectedMetaphor);
      // Use parameters associated with the *lowercase* version of the metaphor if keys are normalized
      const choiceParameters = questionData.psyche_parameters?.[selectedMetaphor.toLowerCase()] || {};
  
      // !! Important: Update iteration based on the question's iteration number !!
      currentSessionState.iteration = questionIteration; // Align client iteration with the question just answered
      currentSessionState.history.push({
        iteration: questionIteration, // Store the iteration number of the question answered
        question: questionData.question,
        metaphor: selectedMetaphor,
        avoided_metaphors: avoidedMetaphors,
        parameters: choiceParameters // Store parameters derived *from this choice*
      });
      // Aggregate parameters into the main state
      currentSessionState.parameters = aggregateParameters(currentSessionState.parameters, choiceParameters);
  
  
      updateProgressBar();
      updateSessionStateDebug();
  
      // --- Fetch Next ---
      setTimeout(() => {
        fetchNextQuestion();
      }, 700); // Delay for visual feedback
    }
  
    // Helper to aggregate psyche parameters (example implementation)
    function aggregateParameters(existingParams, newParams) {
        const aggregated = { ...existingParams };
        for (const key in newParams) {
            if (key === '_blockages') continue; // Handle blockages separately
  
            if (typeof newParams[key] === 'number') {
                // Average numerical parameters (adjust weight if needed)
                const existingValue = existingParams[key];
                const count = currentSessionState.history.filter(h => h.parameters && h.parameters[key] !== undefined).length; // How many times seen before?
                // Weighted average: give more weight to newer values? Or simple average?
                // Simple average example:
                aggregated[key] = ((existingValue || 0) * (count -1) + newParams[key]) / count;
                // Make sure value stays within expected bounds (e.g., 0-1)
                aggregated[key] = Math.max(0, Math.min(1, aggregated[key] || 0));
  
            } else {
                // Overwrite non-numerical params for simplicity, or implement specific logic (e.g., merge lists)
                aggregated[key] = newParams[key];
            }
        }
        // Aggregate blockages (unique list)
        if (newParams['_blockages']) {
            aggregated['_blockages'] = [...new Set([...(existingParams['_blockages'] || []), ...newParams['_blockages']])];
        }
        return aggregated;
    }
  
    // --- UI Update Functions ---
  
    function renderQuestionScreen(data) {
       if (!questionEl || !optionsEl) {
            console.error("Cannot render question: Core UI elements not found.");
            showErrorUI("Display Error", "Could not render the next question.");
            return;
        }
       console.log("Rendering question:", data.question);
       hideLoading();
       questionContainer?.classList.remove('error-state');
  
       // Fade out old content
       questionEl.style.opacity = '0';
       optionsEl.style.opacity = '0';
  
       setTimeout(() => {
          // Update content
          questionEl.textContent = data.question;
          optionsEl.innerHTML = ""; // Clear previous options
  
          (data.options || []).forEach((opt, i) => { // Add safety check for options array
              const li = document.createElement('li');
              const imgUrl = data.images?.[i] || `https://source.unsplash.com/300x200/?abstract`; // Default image
              // Added error handler for images
              li.innerHTML = `<img src="${imgUrl}" alt="${opt}" loading="lazy" onerror="this.onerror=null; this.src='https://source.unsplash.com/300x200/?texture';"/><span>${opt}</span>`;
              li.onclick = () => selectOption(opt, data);
              li.style.animationDelay = `${i * 0.08}s`;
              optionsEl.appendChild(li);
          });
  
          // Update debug info display if element exists
          if (debugInfoEl) {
              if (data.debugContent) {
                  debugInfoEl.innerHTML = `<strong>LLM Reasoning Snippet:</strong><br>${data.debugContent.substring(0, 250)}...`;
                  debugInfoEl.style.display = 'block'; // Show if content exists
              } else {
                  debugInfoEl.style.display = 'none'; // Hide if no content
              }
          }
  
          // Fade in new content
          questionEl.style.opacity = '1';
          optionsEl.style.opacity = '1';
          // Trigger option animation
          optionsEl.classList.remove('animate-options');
          void optionsEl.offsetWidth; // Force reflow
          optionsEl.classList.add('animate-options');
  
          questionContainer?.classList.remove('processing');
          // isProcessing = false; // Reset happens in processResult or showErrorUI
  
       }, 300); // Delay matches CSS transition
    }
  
     function renderFinalAnalysis(analysisData) {
          console.log("Rendering final analysis.");
          hideLoading();
          questionContainer?.classList.remove('error-state', 'processing');
  
          if (analysisContentEl && analysisData?.html) {
              // Basic sanitization: Remove <script> tags (More robust needed for production)
              const sanitizedHtml = analysisData.html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
              analysisContentEl.innerHTML = sanitizedHtml;
          } else if (analysisContentEl) {
               analysisContentEl.innerHTML = `<p>Analysis could not be displayed.</p><p>${analysisData?.html || 'No analysis content received.'}</p>`;
               console.error("Final analysis data is missing or invalid:", analysisData);
          }
  
          showScreen('final');
          // isProcessing = false; // Reset happens in processResult or showErrorUI
          // currentSessionId = null; // Reset happens in processResult or showErrorUI
      }
  
    function showLoading(message = "Consulting the crystal...") {
      console.log("Showing loading:", message);
      if (!questionContainer || !questionEl || !optionsEl) return;
  
      questionContainer.classList.add('processing');
      questionContainer.classList.remove('error-state');
      // Use textContent for security unless HTML is intended
      questionEl.innerHTML = `<div class="loading-indicator">${message}<span class="dots">.</span></div>`; // Add dots span
      optionsEl.innerHTML = ""; // Clear options
  
      // Animate dots (simple example)
      const dotsSpan = questionEl.querySelector('.dots');
      if (dotsSpan) {
          let dotCount = 1;
          dotsSpan.intervalId = setInterval(() => {
              dotsSpan.textContent = '.'.repeat(dotCount);
              dotCount = (dotCount % 3) + 1;
          }, 400);
      }
    }
  
    function hideLoading() {
       console.log("Hiding loading.");
       questionContainer?.classList.remove('processing');
       const loadingIndicator = questionEl?.querySelector('.loading-indicator');
       if (loadingIndicator) {
          const dotsSpan = loadingIndicator.querySelector('.dots');
          if (dotsSpan && dotsSpan.intervalId) {
              clearInterval(dotsSpan.intervalId); // Clear the dots interval
          }
         // Clear the loading message OR let renderQuestionScreen overwrite it
         // questionEl.innerHTML = '';
       }
    }
  
     function clearLoadingAndError() {
         hideLoading();
         questionContainer?.classList.remove('error-state');
         const errorMsg = questionEl?.querySelector('.error-message');
         if (errorMsg) {
             questionEl.innerHTML = ''; // Clear error message
         }
     }
  
  
    function showErrorUI(title, message = "An unknown error occurred.") {
      console.error("Showing Error UI:", title, message);
      hideLoading(); // Ensure loading indicator is hidden
      stopPolling(); // Stop any polling attempts
  
      if (!questionContainer || !questionEl || !optionsEl) return;
  
      questionContainer.classList.add('error-state');
      questionContainer.classList.remove('processing');
      // Use textContent for messages unless HTML is needed and sanitized
      const safeTitle = title || "Error";
      const safeMessage = message || "An unknown error occurred.";
      questionEl.innerHTML = `
        <div class="error-message">
          <strong>${safeTitle.replace(/</g, "&lt;")}</strong><br>
          <span>${safeMessage.replace(/</g, "&lt;")}</span><br><br>
          <button class="retry-btn glow-btn">Retry</button>
          <button class="restart-btn-error glow-btn" onclick="location.reload()">Restart</button> <!-- Add restart -->
        </div>
      `;
      optionsEl.innerHTML = ""; // Clear options
  
      isProcessing = false; // Ensure processing flag is reset
      currentSessionId = null; // Clear session ID on error
    }
  
    function updateProgressBar() {
        const progress = Math.min(100, Math.max(0, (currentSessionState.iteration / 10) * 100));
        const roundedProgress = Math.round(progress);
        if (progressBar) {
            progressBar.style.width = `${roundedProgress}%`;
            progressBar.setAttribute('aria-valuenow', roundedProgress);
        }
        if (progressPercentLabel) {
             progressPercentLabel.textContent = `${roundedProgress}%`; // Update label
        }
    }
  
    function updateSessionStateDebug() {
      if (sessionStateDebugEl) {
        try {
          // Use CSS to control visibility of the debug panel instead of display: none
          sessionStateDebugEl.textContent = JSON.stringify(currentSessionState, null, 2);
        } catch (e) {
          sessionStateDebugEl.textContent = "Error displaying session state.";
        }
      }
    }
  
    // --- Utilities ---
  
    async function fetchFromServer(endpoint, method = 'GET', body = null) {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
      if (body && method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(body);
      }
  
      console.log(`Fetching from ${endpoint} with method ${method}`);
  
      try {
        const response = await fetch(endpoint, options);
  
        // Try to parse JSON regardless of status code for error details
        let responseData;
        try {
            const text = await response.text();
            responseData = text ? JSON.parse(text) : {}; // Handle empty response
        } catch (e) {
            // If JSON parsing fails, create a basic error object
            responseData = {
                error: 'PARSE_ERROR',
                message: `Failed to parse response as JSON (Status: ${response.status})`,
                rawResponse: response.text // Include raw text if parse failed (careful with large responses)
            };
            // If status was OK but parse failed, it's still an error
            if (response.ok) {
                 const error = new Error(responseData.message);
                 error.code = responseData.error;
                 error.statusCode = 502; // Bad Gateway - invalid upstream response
                 error.details = responseData;
                 throw error;
            }
        }
  
        if (!response.ok) {
          console.error(`Server returned error ${response.status}:`, responseData);
          const error = new Error(responseData.message || `Request failed with status ${response.status}`);
          error.statusCode = response.status;
          error.code = responseData.error || 'FETCH_ERROR'; // Use error code from server if available
          error.details = responseData;
          throw error;
        }
  
        return responseData; // Return parsed JSON response
  
      } catch (error) {
         console.error(`Fetch failed for ${endpoint}:`, error);
         // Ensure the re-thrown error has consistent properties if possible
         if (!error.code) { error.code = 'NETWORK_ERROR'; }
         if (!error.statusCode) { error.statusCode = 0; } // 0 indicates network error?
         throw error; // Re-throw the error to be handled by the calling function
      }
    }
  
    function playSelectionSound() {
      try {
        const audio = new Audio('/assets/select.mp3'); // Ensure path is correct
        audio.volume = 0.25; // Adjust volume
        // Don't wait for play() to finish, just fire and forget
        audio.play().catch(e => console.warn('Audio playback failed:', e.message));
      } catch (e) {
        console.warn('Audio playback not supported or failed:', e.message);
      }
    }
  
  })(); // End of IIFE
```

