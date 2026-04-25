import express from 'express';

import authController from '../controllers/authController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// public
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// private
router.get('/me', requireAuth, authController.getMe);

export default router;
