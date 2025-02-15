// server/src/routes/bulkUploadRoutes.js
import express from 'express';
import multer from 'multer';
import bulkUploadController from '../controllers/bulkUploadController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET CSV template
router.get('/template', bulkUploadController.downloadTemplate);

// POST CSV file
router.post('/', upload.single('csvFile'), bulkUploadController.handleBulkUpload);

export default router;