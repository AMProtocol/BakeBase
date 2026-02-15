import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    meta: {
      endpoint_description: 'The requested endpoint does not exist',
      field_glossary: {}
    }
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    meta: {
      endpoint_description: 'An error occurred',
      field_glossary: {}
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍞 BakeBase API running on port ${PORT}`);
  console.log(`📚 Documentation available at /api/docs`);
  console.log(`📋 OpenAPI spec available at /api/docs/openapi.json`);
  console.log(`💚 Health check available at /api/health`);
});
