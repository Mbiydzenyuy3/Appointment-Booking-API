//utils/logger.js

const timestamp = () => new Date().toISOString();

// Function to log info messages
export function logInfo(...args) {
  console.log(`${timestamp()} [INFO]`, ...args);
}

// Function to log error messages
export function logError(...args) {
  console.error(`${timestamp()} [ERROR]`, ...args);
}

// Function to log debug messages
export function logDebug(...args) {
  console.debug(`${timestamp()} [DEBUG]`, ...args);
}
