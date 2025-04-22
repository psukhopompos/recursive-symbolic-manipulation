// server/routes/apiRoutes.js
const express = require('express');
const crypto = require('crypto');
const { PROCESSING_TIMEOUT_MS } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');
const log = require('../utils/logger');
const { generateQuestion, generateFinalAnalysis } = require('../services/openaiService');
const { getSupabaseClient } = require('../utils/supabaseClient'); // Import Supabase client helper

const router = express.Router();

// In-memory store for processing state - could be replaced with Redis or similar
const processingQueue = new Map();

// Function to clean up timed-out entries (remains the same)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of processingQueue.entries()) {
    if (session.processing && now - session.startTime > PROCESSING_TIMEOUT_MS) {
      log.warn(`Session ${sessionId} timed out and marked as error.`);
      processingQueue.set(sessionId, {
        ...session,
        processing: false,
        error: true,
        errorCode: ERROR_CODES.TIMEOUT_ERROR,
        errorMessage: `Processing timed out after ${PROCESSING_TIMEOUT_MS / 1000} seconds.`
      });
    }
    else if (!session.processing && now - session.startTime > PROCESSING_TIMEOUT_MS * 2) {
        log.info(`Cleaning up old session entry: ${sessionId}`);
        processingQueue.delete(sessionId);
    }
  }
}, 60 * 1000);

// --- Helper Function for Async Logging ---
async function logInteraction(sessionId, state, resultData) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return; // Logging disabled if client not initialized
    }

    try {
        const isFinal = !!resultData.final_analysis;
        let logPayload = {
            session_id: sessionId,
            iteration: resultData.iteration || (state?.iteration || 0) + 1, // Best guess for iteration
            is_final_analysis: isFinal,
            llm_debug_info: resultData.debugContent?.substring(0, 2000), // Limit debug info size
            derived_parameters: null, // Default
            question_text: null,
            user_choice: null,
            avoided_metaphors: null,
        };

        // Add details from the last history item if it exists and not final analysis
        const lastHistoryItem = state?.history?.[state.history.length - 1];
        if (!isFinal && lastHistoryItem) {
             logPayload.question_text = lastHistoryItem.question?.substring(0, 500);
             logPayload.user_choice = lastHistoryItem.metaphor;
             logPayload.avoided_metaphors = lastHistoryItem.avoided_metaphors;
             // Parameters might be directly in resultData or aggregated in state
             logPayload.derived_parameters = resultData.psyche_parameters || lastHistoryItem.parameters;
        } else if (isFinal) {
             // For final analysis, log aggregated parameters if available in state
             logPayload.derived_parameters = state?.parameters;
        }

        // Remove null values before inserting if desired (optional)
        // Object.keys(logPayload).forEach(key => logPayload[key] === undefined && delete logPayload[key]);

        log.info(`[DB Log] Attempting to log interaction for session ${sessionId}, iteration ${logPayload.iteration}`);
        const { error } = await supabase
            .from('user_interactions') // Ensure this matches your table name
            .insert([logPayload]);

        if (error) {
            log.error(`[DB Log] Supabase insert failed for session ${sessionId}:`, error.message);
        } else {
            log.info(`[DB Log] Interaction logged successfully for session ${sessionId}`);
        }

    } catch (err) {
        log.error(`[DB Log] Exception during async logging for session ${sessionId}:`, err);
        // Don't let logging errors affect the main response flow
    }
}


// --- Route Handlers ---

// Initiate question generation (validation remains the same)
router.post('/get_question', async (req, res, next) => {
    const { session_state } = req.body;

    // --- Input Validation --- (remains the same)
    if (!session_state) {
      return res.status(400).json({ /* ... */ });
    }
    if (typeof session_state?.iteration !== 'number' || session_state.iteration < 0) {
       return res.status(400).json({ /* ... */ });
    }
     if (!Array.isArray(session_state?.history)) {
        return res.status(400).json({ /* ... */ });
     }

    const sessionId = crypto.randomBytes(8).toString('hex');
    const initialSessionData = JSON.parse(JSON.stringify(session_state)); // Deep copy

    try {
        processingQueue.set(sessionId, {
          processing: true,
          startTime: Date.now(),
          session_state: initialSessionData,
        });

        res.status(202).json({ status: "processing", sessionId });

        // --- Start Background Processing (No await) ---
        processRequest(sessionId, initialSessionData) // Pass the copied state
          .catch(error => {
             log.error(`Background processing failed for session ${sessionId}:`, error);
             // Ensure the session exists before trying to update it
             if (processingQueue.has(sessionId)) {
                 processingQueue.set(sessionId, {
                   ...processingQueue.get(sessionId),
                   processing: false,
                   error: true,
                   errorCode: error.code || ERROR_CODES.PROCESSING_ERROR,
                   errorMessage: error.message || "An unknown error occurred during processing."
                 });
             }
          });

    } catch (error) {
        log.error("Error initiating /api/get_question:", error);
        next(error);
    }
});

// Consolidated processing logic called in the background
async function processRequest(sessionId, session_state) { // Receive the state
    const iteration = session_state?.iteration || 0;
    let result;

    log.info(`Starting background processing for session ${sessionId}, iteration ${iteration + 1}`);

    try {
        if (iteration >= 10) {
            result = await generateFinalAnalysis(session_state);
        } else {
            result = await generateQuestion(session_state);
        }

        // *** Asynchronously log the interaction AFTER getting the result ***
        logInteraction(sessionId, session_state, result); // FIRE AND FORGET

        // Update queue with successful result
         // Ensure session still exists (might have timed out / been cleaned up)
        if (processingQueue.has(sessionId)) {
            processingQueue.set(sessionId, {
                ...processingQueue.get(sessionId), // Keep original startTime
                processing: false,
                result // Store the successful result
            });
            log.info(`Processing finished successfully for session ${sessionId}`);
        } else {
            log.warn(`Session ${sessionId} no longer in queue after processing finished. Result not stored.`);
        }

    } catch (error) {
        log.error(`Error during background task for session ${sessionId}:`, error);
        // Re-throw the error so the .catch() in the route handler updates the queue
        throw error;
    }
}

// Get the result of processing (remains the same)
router.post('/get_result', (req, res, next) => {
    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ /* ... */ });
    }
    if (!processingQueue.has(sessionId)) {
        return res.status(404).json({ /* ... */ });
    }

    const session = processingQueue.get(sessionId);

    if (session.processing) {
        return res.status(200).json({ status: "processing", elapsedMs: Date.now() - session.startTime });
    }

    processingQueue.delete(sessionId); // Remove session *after* getting data
    log.info(`Session ${sessionId} result retrieved and removed from queue.`);

    if (session.error) {
        log.error(`Returning error for session ${sessionId}: ${session.errorMessage}`);
        const statusCode = (session.errorCode === ERROR_CODES.LLM_API_ERROR || session.errorCode === ERROR_CODES.PARSING_FAILURE) ? 502 : 500;
        return res.status(statusCode).json({
            error: session.errorCode || ERROR_CODES.PROCESSING_ERROR,
            message: session.errorMessage || "An error occurred while processing your request."
        });
    }

    return res.json(session.result); // Return successful result
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