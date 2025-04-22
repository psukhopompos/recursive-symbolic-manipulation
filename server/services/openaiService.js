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