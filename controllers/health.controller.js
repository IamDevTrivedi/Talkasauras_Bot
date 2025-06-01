// ./controller/health.controller.js


import logger from '../utils/logger.utils.js';
import os from 'os';
import mongoose from 'mongoose';

const healthController = {

    basicHealthCheck: async (req, res) => {

        logger.get({ message: "health > basicHealthCheck", req });

        try {
            return res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Health check failed:', error);
            return res.status(500).json({ status: 'error' });
        }
    },

    detailedHealthCheck: async (req, res) => {

        logger.get({ req, message: "health > detailedHealthCheck" });

        try {
            const uptime = process.uptime();
            const systemInfo = {
                status: 'healthy',
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                timestamp: new Date().toISOString(),
                memory: {
                    total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
                    free: `${Math.round(os.freemem() / 1024 / 1024)} MB`
                },
                cpu: os.cpus().length
            };
            return res.status(200).json(systemInfo);
        } catch (error) {
            logger.error('Detailed health check failed:', error);
            return res.status(500).json({ status: 'error' });
        }
    },

    memoryCheck: async (req, res) => {

        logger.get({ req, message: "health > memoryCheck" });

        try {
            const used = process.memoryUsage();
            return res.status(200).json({
                status: 'healthy',
                memory: {
                    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
                    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
                    rss: `${Math.round(used.rss / 1024 / 1024)} MB`
                }
            });
        } catch (error) {
            logger.error('Memory check failed:', error);
            return res.status(500).json({ status: 'error' });
        }
    },

    databaseCheck: async (req, res) => {

        logger.get({ message: "health > databaseCheck", req });

        try {
            const dbState = mongoose.connection.readyState;
            const states = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };
            return res.status(200).json({
                status: 'healthy',
                database: {
                    state: states[dbState],
                    name: mongoose.connection.name,
                    host: mongoose.connection.host
                }
            });
        } catch (error) {
            logger.error('Database check failed:', error);
            return res.status(500).json({ status: 'error' });
        }
    }

};

export default healthController;