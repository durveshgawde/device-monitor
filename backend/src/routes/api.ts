import { Router } from 'express';
import { collectProcessMetrics } from '../metrics/processes';
import { getLatestMetrics, getMetricsHistory, getAnomalies, getRules } from '../metrics/database';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { env } from '../utils/env';
import { generateHealthCheckMessage } from '../ai/openrouter';
import { getStatusLog } from '../metrics/collector';
import chatRoutes from './chat';

const router = Router();

// GET latest metrics
router.get('/metrics/latest', async (req, res) => {
    try {
        const metrics = await getLatestMetrics();
        res.json(metrics || {});
    } catch (error) {
        logger.error('Failed to fetch latest metrics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET metrics history
router.get('/metrics/history', async (req, res) => {
    try {
        const hours = parseInt(req.query.hours as string) || 1;
        const history = await getMetricsHistory(hours);
        res.json(history);
    } catch (error) {
        logger.error('Failed to fetch metrics history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET processes
router.get('/processes', async (req, res) => {
    try {
        const processes = await collectProcessMetrics();
        res.json(processes);
    } catch (error) {
        logger.error('Failed to fetch processes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET anomalies
router.get('/anomalies', async (req, res) => {
    try {
        const anomalies = await getAnomalies();
        res.json(anomalies);
    } catch (error) {
        logger.error('Failed to fetch anomalies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET status log (minute-by-minute checks)
router.get('/status-log', async (req, res) => {
    try {
        const log = getStatusLog();
        res.json(log);
    } catch (error) {
        logger.error('Failed to fetch status log:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET rules
router.get('/rules', async (req, res) => {
    try {
        const rules = await getRules();
        res.json(rules);
    } catch (error) {
        logger.error('Failed to fetch rules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST rule
router.post('/rules', async (req, res) => {
    try {
        const { name, condition, threshold, severity } = req.body;

        const { data, error } = await supabase
            .from('rules')
            .insert([{
                name,
                condition,
                threshold,
                severity,
                device_id: env.DEVICE_ID
            }])
            .select('id')
            .single();

        if (error) throw error;
        res.json({ id: data?.id });
    } catch (error) {
        logger.error('Failed to create rule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET AI health check message
router.get('/health-check', async (req, res) => {
    try {
        const metrics = await getLatestMetrics();
        const healthMessage = await generateHealthCheckMessage(metrics || {});
        res.json(healthMessage);
    } catch (error) {
        logger.error('Failed to generate health check:', error);
        res.json({
            message: '✅ System operational',
            timestamp: new Date().toISOString()
        });
    }
});

// GET export CSV
router.get('/export/csv', async (req, res) => {
    try {
        const history = await getMetricsHistory(24);

        const csv = 'timestamp,cpu_percent,memory_percent,p50_latency,p95_latency,p99_latency,error_rate\n' +
            history.map((row: any) =>
                `${row.created_at},${row.cpu_percent},${row.memory_percent},${row.p50_latency},${row.p95_latency},${row.p99_latency},${row.error_rate}`
            ).join('\n');

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="metrics.csv"');
        res.send(csv);
    } catch (error) {
        logger.error('Failed to export CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Chat routes
router.use('/', chatRoutes);

export default router;
