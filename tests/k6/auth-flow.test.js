import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { getBaseUrl } from './helpers/baseUrl.js';
import { SharedArray } from 'k6/data';
import faker from 'k6/x/faker';

const baseUrl = getBaseUrl();

const registerDuration = new Trend('register_duration');
const loginDuration = new Trend('login_duration');
const getUserDuration = new Trend('getuser_duration');
const fakerRegisterDuration = new Trend('faker_register_duration');
const fakerLoginDuration = new Trend('faker_login_duration');
const fakerGetUserDuration = new Trend('faker_getuser_duration');
const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json'));
})

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    'register_duration': ['p(95)<3000'],
    'login_duration': ['p(95)<2000'],
    'getuser_duration': ['p(95)<1000'],
    'faker_register_duration': ['p(95)<3000'],
    'faker_login_duration': ['p(95)<2000'],
    'faker_getuser_duration': ['p(95)<1000'],
    checks: ['rate>0.80'],
  },

  stages: [
    { duration: '5s', target: 10 },
    { duration: '20s', target: 10 },
    { duration: '5s', target: 0 },
  ],
};

export default function () {
  group('01 - Data-Driven Testing (JSON File)', function () {
    let token = null;
    let registeredEmail = null;
    let registeredPassword = null;

    const user = users[(__VU - 1) % users.length];

    group('Register User with JSON Data', function () {
      const uniqueId = `${__VU}_${__ITER}_${Date.now()}`;
      const emailParts = user.email.split('@');
      const email = `${emailParts[0]}_${uniqueId}@${emailParts[1]}`;
      const password = user.password;
      const name = `${user.name} (${uniqueId})`;

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

      registerDuration.add(response.timings.duration);

      check(response, {
        'Register status is 201': (r) => r.status === 201,
        'Register response contains id': (r) => r.json('id') !== undefined && r.json('id') !== null,
        'Register response contains email': (r) => r.json('email') !== undefined,
        'Register response contains createdAt': (r) => r.json('createdAt') !== undefined,
      });
    });

    group('Login User with JSON Data', function () {
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

      loginDuration.add(response.timings.duration);

      check(response, {
        'Login status is 200': (r) => r.status === 200,
        'Login response contains token': (r) => r.json('token') !== undefined && r.json('token') !== null,
        'Token is not empty': (r) => r.json('token').length > 0,
      });

      if (response.status === 200) {
        token = response.json('token');
      }
    });

    if (token) {
      group('Get User Data with JSON Data', function () {
        const params = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const response = http.get(`${baseUrl}/api/users`, params);

        getUserDuration.add(response.timings.duration);

        check(response, {
          'Get user status is 200': (r) => r.status === 200,
          'Response contains user data': (r) => r.body !== null && r.body !== '',
        });
      });
    }
  });

  group('02 - Faker.js Generated Data', function () {
    let token = null;
    let registeredEmail = null;
    let registeredPassword = null;

    group('Register User with Faker Data', function () {
      const email = faker.person.email()
      const password = faker.internet.password();
      const name = faker.person.name()

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

      fakerRegisterDuration.add(response.timings.duration);

      check(response, {
        'Register status is 201': (r) => r.status === 201,
        'Register response contains id': (r) => r.json('id') !== undefined && r.json('id') !== null,
        'Register response contains email': (r) => r.json('email') !== undefined,
        'Register response contains createdAt': (r) => r.json('createdAt') !== undefined,
      });
    });

    group('Login User with Faker Data', function () {
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

      fakerLoginDuration.add(response.timings.duration);

      check(response, {
        'Login status is 200': (r) => r.status === 200,
        'Login response contains token': (r) => r.json('token') !== undefined && r.json('token') !== null,
        'Token is not empty': (r) => r.json('token').length > 0,
      });

      if (response.status === 200) {
        token = response.json('token');
      }
    });

    if (token) {
      group('Get User Data with Faker Data', function () {
        const params = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const response = http.get(`${baseUrl}/api/users`, params);

        fakerGetUserDuration.add(response.timings.duration);

        check(response, {
          'Get user status is 200': (r) => r.status === 200,
          'Response contains user data': (r) => r.body !== null && r.body !== '',
        });
      });
    }
  });
}

export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
    'results.json': JSON.stringify(data),
  };
}
