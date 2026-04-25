import express from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { getDonations, uploadFile, insertEntry, updateEntry, deleteEntry} from '../controllers/donationsController.js'

const router = express.Router();
// router.use(requireAuth);

// router.post('/upload-csv', authMiddleware, upload.single('file'), uploadCSV)
router.post('/  ', upload.single('file'), uploadFile);
router.post('/donations/insert', insertEntry);
router.put('/donations/update/:id', updateEntry);
router.delete('/donations/delete/:id', deleteEntry);
router.get('/donations', getDonations);



export default router