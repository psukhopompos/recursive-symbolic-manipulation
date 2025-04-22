// server/config/env.js - Load and manage environment variables
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Azure OpenAI Config
    AZURE_API_KEY: process.env.AZURE_API_KEY,
    AZURE_API_BASE: process.env.AZURE_API_BASE,
    DEPLOYMENT_NAME: process.env.DEPLOYMENT_NAME,
    MODEL_NAME: process.env.MODEL_NAME || 'gpt-35-turbo', // Your preferred default
    AZURE_API_VERSION: process.env.AZURE_API_VERSION || '2024-05-01-preview',

    // Backend Processing Config
    PROCESSING_TIMEOUT_MS: parseInt(process.env.PROCESSING_TIMEOUT_MS || '300000', 10), // 5 minutes
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
    RETRY_DELAY_MS: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),

    // Supabase Logging Config (Added)
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY, // Use Service Role Key for backend operations
};