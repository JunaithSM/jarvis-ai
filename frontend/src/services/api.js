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

/**
 * Get a Socratic hint from the AI
 * @param {string} question - Student's question
 * @param {string} code - Student's current code
 * @returns {Promise<Object>} - The AI's response { type, hint }
 */
export const getSocraticHint = async (question, code) => {
  try {
    const response = await api.post('/ai/socratic-hint', {
      question,
      code,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
       throw new Error(error.response.data?.detail || 'Server error occurred');
    } else if (error.request) {
       throw new Error('Unable to connect to backend server. Make sure it is running.');
    } else {
       throw new Error(error.message);
    }
  }
};

/**
 * Start an interactive Python run (spawns process on backend).
 * @param {string} sessionId
 * @param {string} code
 * @returns {Promise<{runId: string}>}
 */
export const startInteractiveRun = async (sessionId, code) => {
  const response = await api.post(`/interactive/start/${sessionId}`, { code });
  return response.data; // { runId }
};

/**
 * Stop / kill a running interactive process.
 * @param {string} runId
 */
export const stopInteractiveRun = async (runId) => {
  await api.post(`/interactive/stop/${runId}`);
};

/**
 * Build the WebSocket URL for an interactive run.
 * @param {string} runId
 * @returns {string}
 */
export const getWsUrl = (runId) => {
  const base = (process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000')
    .replace(/^http/, 'ws');
  return `${base}/ws/interactive/${runId}`;
};

export default api;
