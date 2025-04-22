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
  log.parse("Extracting psyche parameters (line-by-line)...");
  log.debug(`--- Full Debug Text ---\n${debugText}\n------------------------`);

  const paramMappings = {};
  let blockages = [];
  let linesParsedCount = 0;

  const lines = debugText.split(/\r?\n/); // Split into lines

  for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines

      // Attempt to match the Metaphor -> JSON pattern on this line
      // Regex: Start, optional space/number/dot, capture Metaphor (non-greedy), arrow, capture {JSON block}, optional space, end-of-line
      const mappingMatch = line.match(/^\s*(?:\d+\.\s*)?(['"]?)(.*?)\1\s*→\s*(\{.*\})\s*$/);
      if (mappingMatch) {
          linesParsedCount++;
          const metaphorNameRaw = mappingMatch[2]?.trim() || `__UNKNOWN_METAPHOR_${linesParsedCount}__`;
          // Remove potential leading/trailing quotes specifically
          const metaphor = metaphorNameRaw.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
          const paramsJsonText = mappingMatch[3]?.trim() || '{}';

          log.debug(`[Line Parse ${linesParsedCount}] Matched Metaphor: "${metaphor}" | Raw JSON: "${paramsJsonText}"`);

          try {
              // Keep the JSON cleaning steps - applied to the captured block
              let correctedJson = paramsJsonText
                 .replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":') // Quote keys
                 .replace(/:\s*'((?:\\.|[^'\\])*)'/g, ': "$1"') // Fix single-quoted values
                 .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
                 .replace(/\s*\/\/.*$/gm, '') // Remove // comments (within the JSON string itself unlikely but safe)
                 .trim();

              log.debug(`[Line Parse ${linesParsedCount}] Corrected JSON Attempt: [${correctedJson}]`);

              if (correctedJson === '{}') {
                  log.warn(`[Line Parse ${linesParsedCount}] JSON empty/comment for metaphor "${metaphor}". Skipping.`);
                  continue;
              }

              // Basic JSON validity check
              if (correctedJson.startsWith('{') && correctedJson.endsWith('}')) {
                  const params = JSON.parse(correctedJson);
                  if (paramMappings[metaphor]) {
                      log.warn(`[Line Parse ${linesParsedCount}] Overwriting params for duplicate metaphor key "${metaphor}"`);
                  }
                  paramMappings[metaphor] = params;
                  log.parse(`[Line Parse ${linesParsedCount}] Parsed Params for "${metaphor}": ${JSON.stringify(params)}`);
              } else {
                  log.warn(`[Line Parse ${linesParsedCount}] Malformed JSON structure for "${metaphor}" after cleaning. Raw: ${paramsJsonText}`);
              }
          } catch (e) {
               log.warn(`[Line Parse ${linesParsedCount}] JSON Parse FAILED for metaphor "${metaphor}". Error: ${e.message}. Corrected Text: ${correctedJson}`);
          }
          continue; // Move to next line once mapping is processed (or fails)
      }

      // --- Blockage Parsing (Check lines that didn't match the mapping pattern) ---
      // More flexible blockage detection (case-insensitive)
      const blockageMatch = line.match(/blockage[s]?\s*:?\s*(.*)/i);
      if (blockageMatch && blockageMatch[1]) {
          const foundBlockagesText = blockageMatch[1].trim();
           // Try to handle simple comma-separated lists or single phrases
          const foundItems = foundBlockagesText.split(',')
                              .map(item => item.trim().replace(/^['"]|['"]$/g, '')) // Trim and remove quotes
                              .filter(Boolean); // Remove empty strings

          if (foundItems.length > 0) {
              blockages = blockages.concat(foundItems);
               log.parse(`Identified blockage phrase(s) on line: ${foundItems.join(', ')}`);
          }
      }
  } // End loop through lines

  // Deduplicate blockages
  blockages = [...new Set(blockages.filter(b => b.length > 0))];
  if (blockages.length > 0) {
      log.parse(`Final unique blockages identified: ${blockages.join('; ')}`);
      paramMappings['_blockages'] = blockages; // Add blockages to the final object
  }

  const successfulParses = Object.keys(paramMappings).filter(k => k !== '_blockages').length;
  log.parse(`Finished parameter extraction. Total Metaphor Mappings Parsed Successfully: ${successfulParses} (out of ${linesParsedCount} lines matched)`);
  if (successfulParses < 7 && linesParsedCount >= 7) {
     log.warn(`Expected 7 parameter mappings, matched ${linesParsedCount} lines but only parsed ${successfulParses}. Check logs for parse errors.`);
  } else if (linesParsedCount < 7 && linesParsedCount > 0) {
      log.warn(`Only found ${linesParsedCount} lines matching the 'Metaphor -> {JSON}' pattern.`);
  } else if (linesParsedCount === 0) {
       log.warn(`Found 0 lines matching the 'Metaphor -> {JSON}' pattern in the debug text.`);
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

      const questionData = parseQuestionContent(contentToParse, expectedIteration); // Calls modified parser
      if (questionData) {
          Object.assign(result, questionData);
          log.parse(`Successfully parsed question content for iteration ${questionData.iteration}.`);
      } else {
          log.warn(`Could not parse standard question structure for expected iteration ${expectedIteration}.`);
      }

      const finalAnalysisData = parseFinalAnalysis(contentToParse);
      if (finalAnalysisData) {
          result.final_analysis = finalAnalysisData;
          log.parse("Successfully parsed final analysis content.");
      }

      // Validation: Check if we got what we expected
      if (!result.question && !result.final_analysis) {
          parseError = new Error("Parsing failed: No valid question or final analysis found in LLM output.");
          log.error(parseError.message);
      } else if (result.question && (!result.options || result.options.length !== 7)) {
          parseError = new Error(`Parsing failed: Question found, but expected 7 options, got ${result.options?.length || 0}.`);
          log.error(parseError.message);
      } else if (!result.question && expectedIteration < 10 && result.final_analysis) {
          log.warn(`Unexpected final analysis found before iteration 10 (expected ${expectedIteration}).`);
          // It's possible the LLM only returned final analysis - allow this if iteration >= 10
           if (expectedIteration < 10) {
               parseError = new Error(`Parsing failed: Only final analysis found before iteration 10.`);
               log.error(parseError.message);
           }
      } else if (result.question && expectedIteration === 10 && !result.final_analysis) {
           // Allow Q10 without final analysis if parsing failed, but log warning
           log.warn(`Expected final analysis bundled with iteration 10, but it was not parsed successfully.`);
      }

  } catch (error) {
      log.error("Exception during main structured parsing execution:", error);
      parseError = error;
  }

  if (parseError) {
      parseError.code = parseError.code || ERROR_CODES.PARSING_FAILURE;
      parseError.statusCode = parseError.statusCode || 502;
      throw parseError;
  }

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