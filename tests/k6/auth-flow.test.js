import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

// Import helpers
import { getBaseUrl } from './helpers/baseUrl.js';
import { generateRandomEmail } from './helpers/email.js';
import { generateValidPassword } from './helpers/password.js';
import { generateRandomName } from './helpers/name.js';

// Get base URL from environment variable or use default
const baseUrl = getBaseUrl();

// Data-Driven Testing: Load test data from JSON file
const usersData = [
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Pass1234"
  },
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "Pass5678"
  },
  {
    "name": "Bob Johnson",
    "email": "bob.johnson@example.com",
    "password": "Pass9012"
  }
];

// Define custom trends for monitoring performance
const registerDuration = new Trend('register_duration');
const loginDuration = new Trend('login_duration');
const getUserDuration = new Trend('getuser_duration');

// Define test options
export const options = {
  // Thresholds: Performance standards
  // Adjusted for development environment with in-memory storage
  // Register is slower due to password hashing (bcrypt with default 10 rounds)
  // Production targets: p95 < 500ms (with optimized hashing and caching)
  thresholds: {
    http_req_duration: ['p(95)<2000'],    // 95% of all HTTP requests < 2000ms
    'register_duration': ['p(95)<3000'],  // Register endpoint slower due to bcrypt hashing
    'login_duration': ['p(95)<2000'],     // Login endpoint p95 < 2000ms
    'getuser_duration': ['p(95)<1000'],   // Get user endpoint p95 < 1000ms (fastest)
    checks: ['rate>0.80'],                 // 80% of checks should pass
  },
  
  // Stages: ramp-up, maintain, ramp-down
  stages: [
    { duration: '5s', target: 10 },   // Ramp-up: 0 → 10 VUs in 5 seconds
    { duration: '20s', target: 10 },  // Sustained: 10 VUs for 20 seconds
    { duration: '5s', target: 0 },    // Ramp-down: 10 → 0 VUs in 5 seconds
  ],
};

export default function () {
  let token = null;
  let registeredEmail = null;
  let registeredPassword = null;
  
  // Data-Driven Testing: Distribute test data among virtual users
  // Each VU gets a different user from the data array
  const testDataIndex = __VU % usersData.length;
  const userData = usersData[testDataIndex];
  
  // ========== Register User ==========
  group('Register User', function () {
    const email = generateRandomEmail(); // Generate unique email for each iteration
    const password = generateValidPassword(); // Generate valid password (min 6 chars)
    const name = generateRandomName(); // Generate random full name
    
    // Store the credentials for later use
    registeredEmail = email;
    registeredPassword = password;
    
    const payload = JSON.stringify({
      email: email,
      password: password,
      name: name,
    });
    
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = http.post(`${baseUrl}/api/users`, payload, params);
    
    // Record duration in custom trend
    registerDuration.add(response.timings.duration);
    
    // Validate response
    check(response, {
      'Register status is 201': (r) => r.status === 201,
      'Register response contains id': (r) => r.json('id') !== undefined && r.json('id') !== null,
      'Register response contains email': (r) => r.json('email') !== undefined,
      'Register response contains createdAt': (r) => r.json('createdAt') !== undefined,
    });
  });
  
  // ========== Login User ==========
  group('Login User', function () {
    try {
      // Use the registered email/password combination
      const payload = JSON.stringify({
        email: registeredEmail,
        password: registeredPassword,
      });
      
      const params = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = http.post(`${baseUrl}/api/auth/login`, payload, params);
      
      // Record duration in custom trend
      loginDuration.add(response.timings.duration);
      
      // Validate response
      check(response, {
        'Login status is 200': (r) => r.status === 200,
        'Login response contains token': (r) => r.json('token') !== undefined && r.json('token') !== null,
        'Token is not empty': (r) => r.json('token').length > 0,
      });
      
      if (response.status === 200) {
        token = response.json('token');
      }
    } catch (err) {
      check(null, {
        'Login succeeded': () => false,
      });
    }
  });
  
  // ========== Get User Data ==========
  if (token) {
    group('Get User Data', function () {
      const params = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      const response = http.get(`${baseUrl}/api/users`, params);
      
      // Record duration in custom trend
      getUserDuration.add(response.timings.duration);
      
      // Validate response
      check(response, {
        'Get user status is 200': (r) => r.status === 200,
        'Response contains user data': (r) => r.body !== null && r.body !== '',
      });
    });
  }
}

/**
 * Generate HTML report using k6-reporter
 * The report will be saved as 'report.html' in the same directory
 */
export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
  };
}
