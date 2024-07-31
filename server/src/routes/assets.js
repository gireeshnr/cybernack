import express from 'express';
import { getAssets, deleteAssets, getAssetDetail } from '../controllers/assetsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAssets);
router.delete('/', authMiddleware, deleteAssets);
router.get('/:assetId', authMiddleware, getAssetDetail);

export default router;
