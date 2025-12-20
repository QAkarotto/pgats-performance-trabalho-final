# Car Rental API

[![CI](https://github.com/QAkarotto/pgats-automacao-api-trabalho-final/workflows/CI/badge.svg)](https://github.com/QAkarotto/pgats-automacao-api-trabalho-final/actions)
[![codecov](https://codecov.io/gh/QAkarotto/pgats-automacao-api-trabalho-final/branch/main/graph/badge.svg)](https://codecov.io/gh/QAkarotto/pgats-automacao-api-trabalho-final)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

REST + GraphQL API for car rental system with JWT authentication.

## Features

- 🚗 **Car Rental Management**: Complete rental workflow with authentication
- 🔐 **JWT Authentication**: Secure authentication for all rental operations
- 📚 **Dual API**: Both REST and GraphQL endpoints
- 📖 **Swagger Documentation**: Interactive API documentation
- 🧪 **Comprehensive Testing**: Unit, integration, and external tests
- 🛡️ **Security**: Helmet, CORS, and input validation
- 📊 **Code Coverage**: Detailed test coverage reports

## Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Endpoints

- **REST API**: `http://localhost:3000/api`
- **GraphQL Playground**: `http://localhost:3000/graphql`
- **Swagger Documentation**: `http://localhost:3000/api-docs`

## API Usage

### Create User

First, create a user account:

```bash
# REST
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

### Authentication

Then, get a JWT token:

```bash
# REST
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"user@example.com\", password: \"password123\") { token } }"}'
```

### Manage Rentals

```bash
# Create rental (REST)
curl -X POST http://localhost:3000/api/rentals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"carId": "CAR123", "startDate": "2023-12-25T10:00:00Z"}'

# List user's rentals (REST)
curl -X GET http://localhost:3000/api/rentals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Cancel rental (REST)
curl -X DELETE http://localhost:3000/api/rentals/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create rental (GraphQL)
curl -X POST http://localhost:3000/graphql \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { rentCar(carId: \"CAR123\") { id userId carId status } }"}'
```

## Development

### Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Testing
npm test            # Run all tests
npm run test:unit   # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:external     # Run external tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage

# Coverage & CI
npm run test:ci     # Run tests for CI with reports
npm run audit       # Security audit
npm run audit:fix   # Fix security issues
```

### Project Structure

```
src/
├── app.js                 # Application entry point
├── config/
│   └── swagger.js         # Swagger configuration
├── controllers/
│   └── rentalController.js # Rental business logic
├── graphql/
│   ├── context.js         # GraphQL context (auth)
│   ├── resolvers/         # GraphQL resolvers
│   └── schemas/           # GraphQL schemas
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   └── Rental.js          # Rental data model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   └── rentalRoutes.js    # Rental routes
└── services/
    └── rentalService.js   # Rental business logic

tests/
├── unit/                  # Unit tests
│   ├── controllers/
│   ├── models/
│   └── services/
├── integration/           # Integration tests
│   ├── rest/
│   └── graphql/
└── external/              # End-to-end tests
```

## Testing

This project maintains high test coverage with multiple testing levels:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints (REST & GraphQL)
- **External Tests**: End-to-end user workflows
- **Coverage**: Minimum 80% code coverage required

### Running Tests

```bash
# All tests with coverage report
npm run test:coverage

# Specific test types
npm run test:unit
npm run test:integration
npm run test:external

# Watch mode for development
npm run test:watch
```

## CI/CD & Reports

This project uses GitHub Actions for continuous integration and generates comprehensive reports:

### Automated Testing
- ✅ **Multi-Node Testing**: Tests on Node.js 16.x, 18.x, 20.x
- ✅ **Security Audits**: Automated dependency scanning
- ✅ **Code Coverage**: Coverage reports with Codecov
- ✅ **Build Verification**: Application startup tests
- ✅ **Artifact Storage**: Test results and coverage reports

### GitHub Pages Reports
The CI automatically generates and deploys test reports to GitHub Pages:

- **📊 Coverage Reports**: Interactive HTML coverage analysis
- **🧪 Test Results**: Detailed Mochawesome test reports
- **📈 Trends**: Historical test and coverage data

**Access Reports**: `https://your-username.github.io/car-rental-api/reports/`

To enable GitHub Pages:
1. Go to repository Settings → Pages
2. Set source to "GitHub Actions" 
3. Reports will be available after the first successful CI run

## Security

- JWT token-based authentication
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Regular security audits

## API Documentation

Interactive Swagger documentation is available at `/api-docs` when the server is running.

The API supports both REST and GraphQL patterns:

### REST Endpoints

**Users:**
- `POST /api/users` - Create new user account

**Authentication:**
- `POST /api/auth/login` - User authentication (email + password)

**Rentals:** (all require authentication)
- `POST /api/rentals` - Create rental
- `GET /api/rentals` - List user's rentals
- `DELETE /api/rentals/:id` - Cancel rental

### GraphQL Operations

**Authentication:**
- `mutation login(email: String!, password: String!)` - User authentication

**Rentals:** (requires authentication)
- `mutation rentCar(carId: ID!)` - Create rental

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Maintain test coverage above 80%
- Add tests for new features
- Update documentation as needed
- Follow existing code style
- Ensure CI passes before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.
