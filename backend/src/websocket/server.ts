import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { getLatestMetrics, getAnomalies } from '../metrics/database';
import { logger } from '../utils/logger';
import { WebSocketMessage } from '../types/metrics';

let clients: WebSocket[] = [];

export function setupWebSocket(server: Server): void {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        logger.info(`🔗 WebSocket client connected (Total: ${clients.length + 1})`);
        clients.push(ws);

        ws.on('close', () => {
            clients = clients.filter(c => c !== ws);
            logger.info(`❌ Client disconnected (Active: ${clients.length})`);
        });

        ws.on('error', (error) => {
            logger.error('WebSocket error:', error);
        });
    });

    // Broadcast every 2 seconds
    setInterval(async () => {
        if (clients.length === 0) return;

        try {
            const metrics = await getLatestMetrics();

            if (metrics) {
                const message: WebSocketMessage = {
                    type: 'metrics_update',
                    data: metrics,
                    timestamp: Date.now()
                };

                broadcast(message);
            }
        } catch (error) {
            logger.error('WebSocket broadcast failed:', error);
        }
    }, 2000);
}

export function broadcast(message: WebSocketMessage): void {
    const data = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}
