const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'OK',
        api: 'OK'
      },
      stats: {}
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.services.database = 'OK';
      
      // Get basic stats
      try {
        const [userCount, storeCount, productCount] = await Promise.all([
          User.countDocuments(),
          Store.countDocuments(),
          Product.countDocuments()
        ]);
        
        healthCheck.stats = {
          totalUsers: userCount,
          totalStores: storeCount,
          totalProducts: productCount
        };
      } catch (statsError) {
        console.error('Stats error:', statsError);
        healthCheck.services.database = 'DEGRADED';
      }
    } else {
      healthCheck.services.database = 'DOWN';
      healthCheck.status = 'DEGRADED';
    }

    // Set appropriate status code
    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'UNKNOWN',
        api: 'ERROR'
      }
    });
  }
});

// @desc    Detailed system info (for debugging)
// @route   GET /api/health/detailed
// @access  Public
router.get('/detailed', async (req, res) => {
  try {
    const detailed = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        host: mongoose.connection.host || 'Unknown',
        name: mongoose.connection.name || 'Unknown',
        readyState: mongoose.connection.readyState
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000
      }
    };

    res.json(detailed);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

module.exports = router;