import axios from 'axios';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Run code on the backend compiler
 * @param {string} sessionId - Unique session identifier
 * @param {string} language - Programming language (python, c, cpp, java, javascript)
 * @param {string} code - Source code to execute
 * @param {string} stdin - Optional standard input for the program
 * @returns {Promise<Object>} - Execution result { status, stdout, stderr, exit_code, time_ms }
 */
export const runCode = async (sessionId, language, code, stdin = '') => {
  try {
    const response = await api.post(`/run/${sessionId}`, {
      language,
      code,
      stdin,
    });
    return response.data;
  } catch (error) {
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      return {
        status: 'error',
        stdout: '',
        stderr: error.response.data?.detail || 'Server error occurred',
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 'error',
        stdout: '',
        stderr: 'Unable to connect to backend server. Make sure it is running.',
      };
    } else {
      // Something else went wrong
      return {
        status: 'error',
        stdout: '',
        stderr: error.message,
      };
    }
  }
};

export default api;
