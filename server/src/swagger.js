import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Cybersecurity Asset Management API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default app;
