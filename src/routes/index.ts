import { Router } from 'express';
import { IngredientController } from '../controllers/ingredient.controller';
import { CategoryController } from '../controllers/category.controller';
import { DocsController } from '../controllers/docs.controller';
import { KeysController } from '../controllers/keys.controller';
import { BakingController } from '../controllers/baking.controller';
import { openApiSpec } from '../middleware/openapi';
import { requireApiKey } from '../middleware/auth';
import { keyProvisioningLimiter } from '../middleware/rateLimit';
import { API_VERSION } from '../config/version';

const router = Router();

// Root route
router.get('/', (_req, res) => {
  res.json({
    service: 'BakeBase',
    description: 'AI-first food science reference API for baking ingredients',
    version: API_VERSION,
    status: 'healthy',
    agent_first_step:
      'Fetch /.well-known/agent-manifest.json before querying. It contains auth and usage.',
    links: {
      manifest: '/.well-known/agent-manifest.json',
      agents: '/agents',
      ingredients: '/ingredients',
      categories: '/categories',
      combine: '/ingredients/combine',
      validate_mix: '/baking/validate-mix',
      convert: '/baking/convert',
      pan_scale: '/baking/pan-scale',
      docs: '/docs/openapi.json',
      health: '/health',
      api_keys: '/dashboard/keys',
    },
    meta: {
      description:
        'BakeBase root. AI agents: see /.well-known/agent-manifest.json for auth and usage.',
    },
  });
});

// Health check
router.get('/health', DocsController.healthCheck);

// Agent guide
router.get('/agents', DocsController.getAgentGuide);

// OpenAPI spec
router.get('/docs/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

// Key provisioning (public - validator expects 200 from key_provisioning_url)
router.get('/dashboard/keys', KeysController.getDashboard);
router.post('/dashboard/keys', keyProvisioningLimiter, KeysController.createKey);
router.post('/api/keys', keyProvisioningLimiter, KeysController.createKeyJson);

// Protected endpoints (require API key)
router.get('/ingredients/search', requireApiKey, IngredientController.search);
router.get('/ingredients/:id', requireApiKey, IngredientController.getById);
router.get('/ingredients', requireApiKey, IngredientController.getAll);
router.post('/ingredients/combine', requireApiKey, IngredientController.combine);
router.get('/categories', requireApiKey, CategoryController.getAll);
router.post('/baking/validate-mix', requireApiKey, BakingController.validateMix);
router.get('/baking/convert', requireApiKey, BakingController.convertUnits);
router.get('/baking/units', requireApiKey, BakingController.listUnits);
router.get('/baking/pan-scale', requireApiKey, BakingController.panScale);

export default router;
