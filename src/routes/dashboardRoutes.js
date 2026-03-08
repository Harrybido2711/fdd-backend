import express from 'express';

import dashboardController from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, dashboardController.getOverview);

export default router;
