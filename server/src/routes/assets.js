// server/src/routes/assets.js
import express from 'express';
import { autoDiscovery, getAssets, deleteAssets, updateAsset, addOrUpdateAssets } from '../controllers/assetsController.js';

const router = express.Router();

router.post('/auto-discovery', autoDiscovery);
router.get('/', getAssets);
router.post('/delete', deleteAssets);
router.post('/update', updateAsset);
router.post('/add-or-update', addOrUpdateAssets);

export default router;
