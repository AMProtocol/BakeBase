import { Router } from 'express';
import { IngredientController } from '../controllers/ingredient.controller';
import { CategoryController } from '../controllers/category.controller';
import { DocsController } from '../controllers/docs.controller';
import { openApiSpec } from '../middleware/openapi';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// AgentManifest endpoint - MUST be served at /.well-known/agent-manifest.json
router.get('/.well-known/agent-manifest.json', (_req, res) => {
  const manifestPath = path.join(__dirname, '../../agent-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  res.json(manifest);
});

// Health check
router.get('/health', DocsController.healthCheck);

// Agent guide
router.get('/agents', DocsController.getAgentGuide);

// OpenAPI spec
router.get('/docs/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

// Ingredients endpoints
router.get('/ingredients/search', IngredientController.search);
router.get('/ingredients/:id', IngredientController.getById);
router.get('/ingredients', IngredientController.getAll);
router.post('/ingredients/combine', IngredientController.combine);

// Categories
router.get('/categories', CategoryController.getAll);

export default router;
