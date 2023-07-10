import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'secureChat',
      version: '1.0.0',
      description: 'A secure chat application',
    },
    servers: [
      {
        url: `http://localhost:8000`,
      },
    ],
  },
  apis: ['src/routes/auth.ts'],
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);

export default swaggerSpecs;
