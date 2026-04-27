import express from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { getDonations, uploadFile, insertEntry, updateEntry, deleteEntry} from '../controllers/donationsController.js'

const router = express.Router();

router.post('/  ', upload.single('file'), uploadFile);
router.post('/donations/insert', insertEntry);
router.put('/donations/update/:id', updateEntry);
router.delete('/donations/delete/:id', deleteEntry);
router.get('/donations', getDonations);



export default router