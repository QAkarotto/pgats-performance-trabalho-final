/**
 * Helper function to get the base URL from environment variable
 * Usage: k6 run --env BASE_URL=http://localhost:3000 auth-flow.test.js
 * Default: http://localhost:3000
 */
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3000';
}
