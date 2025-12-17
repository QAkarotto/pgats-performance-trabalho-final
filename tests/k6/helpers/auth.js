import http from 'k6/http';

/**
 * Helper function to perform login and return JWT token
 * @param {string} baseUrl - The base URL of the API
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {string} JWT token from the API response
 */
export function login(baseUrl, email, password) {
  const url = `${baseUrl}/api/auth/login`;
  const payload = JSON.stringify({
    email,
    password,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(url, payload, params);
  
  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}: ${response.body}`);
  }
  
  const token = response.json('token');
  return token;
}
