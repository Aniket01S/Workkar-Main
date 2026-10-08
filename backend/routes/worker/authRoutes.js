import express from 'express';
import { registerWorker, loginWorker, getWorkerMe } from '../../controllers/worker/authController.js';
import { protectWorker } from '../../middleware/workerAuth.js';

const router = express.Router();

router.post('/register', registerWorker);
router.post('/login', loginWorker);
router.get('/me', protectWorker, getWorkerMe);

export default router;
