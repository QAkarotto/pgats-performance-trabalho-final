const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Rental API',
      version: '1.0.0',
      description: 'REST + GraphQL API for car rental system with JWT authentication',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
          },
        },
        Rental: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Rental ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID who made the rental',
            },
            carId: {
              type: 'string',
              description: 'Car ID being rented',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Rental start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Rental end date',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
              description: 'Rental status',
            },
          },
        },
        AuthPayload: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
};
