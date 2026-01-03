import { getLatestMetrics, storeAnomalies, storeInsight, getRules } from '../metrics/database';
import { analyzeWithAI } from '../ai/openrouter';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

interface AnomalyRule {
    name: string;
    check: (metrics: any) => boolean;
    severity: 'CRITICAL' | 'WARNING' | 'HIGH';
}

const defaultRules: AnomalyRule[] = [
    {
        name: 'cpu_overload',
        check: (m) => m.cpu_percent > 80,
        severity: 'HIGH'
    },
    {
        name: 'memory_critical',
        check: (m) => m.memory_percent > 90,
        severity: 'CRITICAL'
    },
    {
        name: 'latency_spike',
        check: (m) => m.p95_latency > 500,
        severity: 'WARNING'
    },
    {
        name: 'error_spike',
        check: (m) => m.error_rate > 5,
        severity: 'CRITICAL'
    }
];

export async function checkAnomalies(): Promise<void> {
    try {
        const latestMetric = await getLatestMetrics();
        if (!latestMetric) return;

        const dbRules = await getRules();
        const rules = dbRules.length > 0 ? dbRules : defaultRules;

        for (const rule of rules) {
            const shouldTrigger = typeof rule.check === 'function'
                ? rule.check(latestMetric)
                : latestMetric[rule.condition as keyof typeof latestMetric] > rule.threshold;

            if (shouldTrigger) {
                logger.warn(`🚨 Anomaly detected: ${rule.name}`);

                // Store anomaly
                const anomalyId = await storeAnomalies({
                    id: 0, // Will be ignored by database, auto-generated
                    created_at: new Date().toISOString(),
                    rule_id: rule.name,
                    severity: rule.severity,
                    description: `${rule.name} detected`,
                    metric_value: latestMetric[rule.name as keyof typeof latestMetric] || 0,
                    device_id: env.DEVICE_ID
                });

                if (anomalyId) {
                    // Get AI analysis
                    const analysis = await analyzeWithAI(rule.name, latestMetric);
                    if (analysis) {
                        await storeInsight(anomalyId, analysis);
                    }
                }
            }
        }
    } catch (error) {
        logger.error('Anomaly detection failed:', error);
    }
}

export function startAnomalyDetection(): void {
    setInterval(checkAnomalies, 60000);
    logger.info('✅ Anomaly detection started');
}
