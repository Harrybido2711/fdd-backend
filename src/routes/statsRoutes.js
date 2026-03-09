import express from 'express';
import { getCategoryDollars, getCategoryCount, getTotalDollars, getStateDollars, getStateCount } from '../controllers/statsController.js';

const router = express.Router();

router.get('/categories/amount', getCategoryDollars);
router.get('/categories/count', getCategoryCount);

router.get('/donations/total', getTotalDollars);

router.get('/states/amount', getStateDollars);
router.get('/states/count', getStateCount);

export default router;