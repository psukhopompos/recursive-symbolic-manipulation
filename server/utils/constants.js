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