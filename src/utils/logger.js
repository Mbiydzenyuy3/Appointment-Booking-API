// Function to log info messages
export function logInfo(...args) {
  console.log(new Date().toISOString(), "[INFO]", ...args);
}

// Function to log error messages
export function logError(...args) {
  console.error(new Date().toISOString(), "[ERROR]", ...args);
}

// Function to log debug messages
export function logDebug(...args) {
  console.debug(new Date().toISOString(), "[DEBUG]", ...args);
}
