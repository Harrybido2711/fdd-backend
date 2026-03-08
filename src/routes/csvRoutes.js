import express from 'express';

import csvController from '../controllers/csvController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', authMiddleware, csvController.upload, csvController.handleUpload);

export default router;
