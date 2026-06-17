import express from 'express';
import { updatePermissions } from '../../controllers/worker/permissionController.js';
import { protectWorker } from '../../middleware/workerAuth.js';

const router = express.Router();

router.put('/permissions', protectWorker, updatePermissions);

export default router;
