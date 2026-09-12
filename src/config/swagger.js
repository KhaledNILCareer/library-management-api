import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Library Management API',
      version: '1.0.0',
      description: 'REST API for managing a library system',
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
        Author: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '68c2a3f1b9e7d81234567890',
            },
            name: {
              type: 'string',
              example: 'George Orwell',
            },
            biography: {
              type: 'string',
              example: 'English novelist and essayist.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-09-11T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-09-11T12:00:00.000Z',
            },
          },
        },

        AuthorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Author retrieved successfully',
            },
            data: {
              $ref: '#/components/schemas/Author',
            },
          },
        },

        AuthorsResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Authors retrieved successfully',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Author',
              },
            },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Resource not found',
            },
          },
        },
      },
    },
  },

  apis: ['./docs/openapi/*.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);