import express from 'express';
import { discoveryView, getAssets, deleteAssets, updateAsset, addOrUpdateAssets } from '../controllers/assetsController.js';
import { threatIntelView } from '../controllers/threatIntelController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/auto-discovery', rateLimiter, discoveryView);
router.get('/', getAssets);
router.post('/delete', deleteAssets);
router.post('/update', updateAsset);
router.post('/add-or-update', addOrUpdateAssets);

// Discovery view endpoint
router.post('/discovery-view', discoveryView);

// Threat intel view endpoint
router.post('/threat-intel-view', threatIntelView);

export default router;
