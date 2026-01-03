import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';
import apiRoutes from './routes/api';
import { setupWebSocket } from './websocket/server';
import { startMetricsCollection } from './metrics/collector';
import { startAnomalyDetection } from './anomaly/detector';
import { checkConnection } from './utils/supabase';
import { logger } from './utils/logger';
import { env } from './utils/env';

const app: Express = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
app.use('/api', apiRoutes);

// Setup WebSocket
setupWebSocket(server);

// Start processes
async function start() {
  try {
    // Check Supabase connection
    const connected = await checkConnection();
    if (!connected) {
      throw new Error('Failed to connect to Supabase');
    }

    logger.info('✅ Connected to Supabase');

    // Start metrics collection
    startMetricsCollection();

    // Start anomaly detection
    startAnomalyDetection();

    // Start server
    const PORT = env.PORT;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Backend running on port ${PORT}`);
      logger.info(`📊 WebSocket server ready`);
      logger.info(`🗄️ Device ID: ${env.DEVICE_ID}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
