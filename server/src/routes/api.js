import express from 'express';
import { 
  runNmapDiscovery, 
  runZoomEyeDiscovery,
  runShodanDiscovery,
  runCensysDiscovery 
} from '../controllers/discoveryController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/discovery/nmap', authMiddleware, runNmapDiscovery);
router.post('/discovery/zoomeye', authMiddleware, runZoomEyeDiscovery);
router.post('/discovery/shodan', authMiddleware, runShodanDiscovery);
router.post('/discovery/censys', authMiddleware, runCensysDiscovery);

// Add more routes as needed

export default router;
