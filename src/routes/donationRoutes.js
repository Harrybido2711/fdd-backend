import express from 'express';

import donationController from '../controllers/donationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, donationController.getAll);
router.get('/:id', authMiddleware, donationController.getById);
router.post('/', authMiddleware, donationController.create);
router.put('/:id', authMiddleware, donationController.update);
router.delete('/:id', authMiddleware, donationController.remove);

export default router;
