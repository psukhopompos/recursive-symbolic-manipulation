// public/js/script.js - Frontend Logic

(function() {
  'use strict';

  // --- State ---
  // Encapsulate state slightly more robustly
  const appState = {
      currentSessionState: { iteration: 0, history: [], parameters: {} },
      currentSessionId: null,
      isProcessing: false,
      pollingTimeoutId: null,
      lastReceivedData: null // Store data for Q10 selection here
  };

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
      resetSession();
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
      // Reset state within appState object
      appState.currentSessionState = { iteration: 0, history: [], parameters: {} };
      appState.currentSessionId = null;
      appState.isProcessing = false;
      appState.lastReceivedData = null; // Clear stored data on reset
      stopPolling(); // Use appState.pollingTimeoutId
      updateProgressBar(); // Use appState.currentSessionState
      updateSessionStateDebug(); // Use appState.currentSessionState
      console.log("Session state reset.");
    }

    async function fetchNextQuestion() {
      if (appState.isProcessing) { // Use appState
        console.warn("Already processing, ignoring request to fetch next question.");
        return;
      }
      appState.isProcessing = true; // Use appState
      showLoading("Consulting the financial crystal...");

      try {
        const response = await fetchFromServer(`${API_BASE_URL}/get_question`, 'POST', { session_state: appState.currentSessionState }); // Use appState

        if (response.status === "processing" && response.sessionId) {
          appState.currentSessionId = response.sessionId; // Use appState
          console.log(`Request accepted (Session ID: ${appState.currentSessionId}). Starting polling.`);
          startPolling(appState.currentSessionId); // Pass ID
        } else {
          console.error("Received unexpected non-processing status from /get_question:", response);
          throw new Error("Invalid initial response from server. Expected 'processing' status.");
        }
      } catch (error) {
        console.error("Failed to initiate question request:", error);
        showErrorUI("Could not connect to the crystal ball.", error.message || "Please check your connection and retry.");
      }
    }

    function startPolling(sessionId) {
      stopPolling(); // Uses appState internally

      let attempts = 0;

      async function poll() {
        // Use appState.currentSessionId for checks
        if (!appState.currentSessionId || sessionId !== appState.currentSessionId) {
             console.log("Polling stopped: Session ID changed or cleared.");
             return;
         }
        if (attempts >= MAX_POLLING_ATTEMPTS) {
          console.error("Polling timed out after maximum attempts.");
          showErrorUI("The crystal ball seems unresponsive.", "The request took too long. Please try again later.");
          return;
        }

        attempts++;
        console.log(`Polling attempt ${attempts}/${MAX_POLLING_ATTEMPTS} for session ${sessionId}...`);

        try {
          const resultResponse = await fetchFromServer(`${API_BASE_URL}/get_result?sessionId=${sessionId}`, 'POST', {});

          // Check context again after await
          if (sessionId !== appState.currentSessionId) {
              console.log("Polling stopped: Session context changed during fetch.");
              return;
          }

          if (resultResponse.status === "processing") {
            // Still processing... schedule next poll
             appState.pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL_MS + attempts * 50); // Use appState
          } else {
            // Result is ready
            console.log("Polling complete. Received result:", resultResponse);
            stopPolling(); // Uses appState

            if (resultResponse.error) {
               // Handle backend error
               const backendError = new Error(resultResponse.message || "An error occurred on the server.");
               backendError.code = resultResponse.error;
               throw backendError; // Let catch block handle UI
            }

            // Process successful result
            processResult(resultResponse); // Call processResult
          }
        } catch (error) {
           // Handle polling errors
           console.error(`Polling attempt ${attempts} failed:`, error);

            if (sessionId !== appState.currentSessionId) {
                console.log("Polling stopped: Session context changed during fetch error.");
                return;
            }

           if (error.code === 'SESSION_NOT_FOUND' || attempts >= MAX_POLLING_ATTEMPTS) {
               stopPolling(); // Uses appState
               showErrorUI("Session Expired or Invalid.", error.message || "Could not retrieve the result. Please try starting over.");
           } else {
               // Retry after delay
               appState.pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL_MS * 2 + attempts * 100); // Use appState
           }
        }
      }

      // Start the first poll
      appState.pollingTimeoutId = setTimeout(poll, 100); // Use appState
    }

    function stopPolling() {
      if (appState.pollingTimeoutId) { // Use appState
        clearTimeout(appState.pollingTimeoutId); // Use appState
        appState.pollingTimeoutId = null; // Use appState
        console.log("Polling stopped.");
      }
    }

    // --- Main change is accessing lastReceivedData via appState ---
    function processResult(data) {
       console.log("Processing final result from server:", data);
       clearLoadingAndError();

       // *** FIX HERE: Use appState object ***
       console.log('Assigning data to appState.lastReceivedData');
       appState.lastReceivedData = data; // Assign to the state object property

       if (data.question && data.options) {
          if(typeof data.iteration === 'number' && data.iteration !== appState.currentSessionState.iteration + 1) { // Use appState
              console.warn(`Iteration mismatch: Client expected ${appState.currentSessionState.iteration + 1}, Server sent ${data.iteration}. Trusting server.`);
          }
          renderQuestionScreen(data);
       }
       else if (data.final_analysis && !data.question) {
          console.log("Received final analysis without question data, rendering analysis.");
          renderFinalAnalysis(data.final_analysis);
       }
       else {
          console.error("Received invalid data structure from server:", data);
          showErrorUI("Received incomplete data from the crystal.", "The response from the server was malformed.");
       }

       // Reset processing flags AFTER handling the result
       appState.isProcessing = false; // Use appState
       appState.currentSessionId = null; // Use appState
    }


    // --- Main change is accessing lastReceivedData via appState ---
    function selectOption(selectedMetaphor, questionData) {
      if (appState.isProcessing) { // Use appState
        console.warn("Currently processing, selection ignored.");
        return;
      }
      const questionIteration = questionData.iteration;
      console.log(`Selected: "${selectedMetaphor}" for Q${questionIteration}`);
      playSelectionSound();

      // --- Update UI --- (no change needed here)
      const optionElements = optionsEl?.querySelectorAll('li');
      if (!optionElements) return;
      let selectedElement = null;
      optionElements.forEach(li => {
          li.classList.remove('selected');
          li.style.pointerEvents = 'none';
          const span = li.querySelector('span');
          if (span && span.textContent === selectedMetaphor) {
              selectedElement = li;
          }
       });
      selectedElement?.classList.add('selected');

      // --- Update State ---
      const avoidedMetaphors = questionData.options.filter(opt => opt !== selectedMetaphor);
      const choiceParameters = questionData.psyche_parameters?.[selectedMetaphor.toLowerCase()] || {};
      // Use appState object
      appState.currentSessionState.iteration = questionIteration;
      appState.currentSessionState.history.push({
        iteration: questionIteration,
        question: questionData.question,
        metaphor: selectedMetaphor,
        avoided_metaphors: avoidedMetaphors,
        parameters: choiceParameters
      });
      appState.currentSessionState.parameters = aggregateParameters(appState.currentSessionState.parameters, choiceParameters); // Pass parameters from appState
      updateProgressBar(); // Uses appState implicitly now
      updateSessionStateDebug(); // Uses appState implicitly now

      // --- Fetch Next OR Render Final Analysis ---
      // *** FIX HERE: Use appState object ***
      if (questionIteration === 10 && appState.lastReceivedData?.final_analysis) { // Check appState
        console.log("Final question answered. Rendering analysis received with Q10.");
        setTimeout(() => {
            renderFinalAnalysis(appState.lastReceivedData.final_analysis); // Use appState
            appState.lastReceivedData = null; // Clear stored data in appState
        }, 700);
      } else if (questionIteration >= 10) {
          console.warn(`Answered question ${questionIteration}, but no final analysis data was found with it. Attempting to fetch analysis separately.`);
          setTimeout(() => {
            fetchFinalAnalysisDirectly(); // Uses appState implicitly now
          }, 700);
      }
      else {
          setTimeout(() => {
            fetchNextQuestion(); // Uses appState implicitly now
          }, 700);
      }
    }

    // Needs to use appState
    async function fetchFinalAnalysisDirectly() {
        console.log("Attempting to fetch final analysis directly...");
         if (appState.isProcessing) return; // Use appState
         appState.isProcessing = true; // Use appState
         showLoading("Compiling final analysis...");
         try {
             // Use appState
             const response = await fetchFromServer(`${API_BASE_URL}/get_question`, 'POST', { session_state: appState.currentSessionState });
             if (response.status === "processing" && response.sessionId) {
                 appState.currentSessionId = response.sessionId; // Use appState
                 startPolling(appState.currentSessionId);
             } else {
                 throw new Error("Invalid response when requesting final analysis.");
             }
         } catch (error) {
             console.error("Failed to initiate final analysis request:", error);
             showErrorUI("Could not generate final analysis.", error.message || "Please try restarting.");
         }
    }


    // Needs to use appState.currentSessionState
    function aggregateParameters(existingParams, newParams) {
        const aggregated = { ...existingParams };
        for (const key in newParams) {
            if (key === '_blockages') continue;

            if (typeof newParams[key] === 'number') {
                // *** FIX HERE: Use appState object ***
                const count = appState.currentSessionState.history.filter(h => h.parameters && h.parameters[key] !== undefined).length;
                aggregated[key] = ((existingParams[key] || 0) * (count -1) + newParams[key]) / count;
                aggregated[key] = Math.max(0, Math.min(1, aggregated[key] || 0));
            } else {
                aggregated[key] = newParams[key];
            }
        }
        if (newParams['_blockages']) {
             // *** FIX HERE: Use appState object *** (though only reads existingParams)
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
  
        // Needs to use appState
    // Needs to use appState
    function updateProgressBar() {
      // *** FIX HERE: Use appState object ***
      const progress = Math.min(100, Math.max(0, (appState.currentSessionState.iteration / 10) * 100));
      const roundedProgress = Math.round(progress);
      if (progressBar) {
          progressBar.style.width = `${roundedProgress}%`;
          progressBar.setAttribute('aria-valuenow', roundedProgress);
      }
      if (progressPercentLabel) {
           progressPercentLabel.textContent = `${roundedProgress}%`;
      }
  }

  // Needs to use appState
  function updateSessionStateDebug() {
    if (sessionStateDebugEl) {
      try {
        // *** FIX HERE: Use appState object ***
        sessionStateDebugEl.textContent = JSON.stringify(appState.currentSessionState, null, 2);
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