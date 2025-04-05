import express from 'express';
import multer from 'multer';
import bulkUploadController from '../controllers/bulkUploadController.js';
import { authMiddleware } from '../auth/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/template', authMiddleware, bulkUploadController.downloadTemplate);
router.post('/', authMiddleware, upload.single('csvFile'), bulkUploadController.handleBulkUpload);

export default router;