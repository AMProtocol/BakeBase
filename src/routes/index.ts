import { Router } from 'express';
import { IngredientController } from '../controllers/ingredient.controller';
import { CategoryController } from '../controllers/category.controller';
import { DocsController } from '../controllers/docs.controller';
import { openApiSpec } from '../middleware/openapi';

const router = Router();

// Health check
router.get('/health', DocsController.healthCheck);

// Agent guide
router.get('/agents', DocsController.getAgentGuide);

// OpenAPI spec
router.get('/docs/openapi.json', (req, res) => {
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
