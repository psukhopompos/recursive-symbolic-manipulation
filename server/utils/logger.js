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