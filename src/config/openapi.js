const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Learning Node.js API',
      version: '1.0.0',
      description: 'API de estudio con Express, Prisma, MySQL y Scalar.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const openapiSpec = swaggerJsdoc(options);

module.exports = openapiSpec;
