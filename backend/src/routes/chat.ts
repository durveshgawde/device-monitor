import { Router, Request, Response } from 'express';
import { chatWithAI, storeChatMessage, getChatHistory } from '../ai/chatbot';
import { getLatestMetrics } from '../metrics/database';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

const router = Router();

// POST /api/chat - Send message and get response
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Get current metrics for context
        const metrics = await getLatestMetrics();
        if (!metrics) {
            return res.status(400).json({ error: 'No metrics available' });
        }

        // Get AI response
        const aiResponse = await chatWithAI(message, metrics);

        // Store conversation
        await storeChatMessage(env.DEVICE_ID, message, aiResponse, metrics);

        res.json({
            message: message,
            response: aiResponse,
            metrics_used: {
                cpu_percent: metrics.cpu_percent,
                memory_percent: metrics.memory_percent,
                error_rate: metrics.error_rate
            }
        });
    } catch (error: any) {
        logger.error('Chat endpoint failed:', error);

        // Return specific error message to frontend
        const errorMessage = error.message || 'Internal server error';
        res.status(500).json({ error: errorMessage });
    }
});

// GET /api/chat/history - Get chat history
router.get('/chat/history', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const history = await getChatHistory(env.DEVICE_ID, limit);
        res.json(history);
    } catch (error) {
        logger.error('Failed to fetch chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
