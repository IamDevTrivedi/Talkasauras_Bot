// ./routes/health.router.js

import express from 'express';
import healthController from '../controllers/health.controller.js';

const router = express.Router();


// Basic health check
router.get('/', healthController.basicHealthCheck);

// Advanced health checks
router.get('/detailed', healthController.detailedHealthCheck);
router.get('/memory', healthController.memoryCheck);
router.get('/database', healthController.databaseCheck);


export default router;