import { getLatestMetrics, storeAnomalies, storeInsight, getRules } from '../metrics/database';
import { analyzeWithAI } from '../ai/openrouter';
import { addStatusCheck } from '../metrics/collector';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

// Hardcoded fallback rules - used when database has no rules
const defaultRules = [
    {
        name: 'cpu_overload',
        condition: 'cpu_percent',
        threshold: 80,
        severity: 'HIGH'
    },
    {
        name: 'memory_critical',
        condition: 'memory_percent',
        threshold: 90,
        severity: 'CRITICAL'
    },
    {
        name: 'high_disk_usage',
        condition: 'disk_percent',
        threshold: 90,
        severity: 'WARNING'
    }
];

export async function checkAnomalies(): Promise<void> {
    try {
        const latestMetric = await getLatestMetrics();
        if (!latestMetric) return;

        // Try database rules first, fallback to hardcoded
        const dbRules = await getRules();
        const rules = dbRules.length > 0 ? dbRules : defaultRules;

        if (rules.length === 0) {
            addStatusCheck(latestMetric, false);
            return;
        }

        let anomalyFound = false;
        let anomalyMessage = '';

        for (const rule of rules) {
            const metricValue = latestMetric[rule.condition as keyof typeof latestMetric] as number;
            const shouldTrigger = metricValue > rule.threshold;

            if (shouldTrigger) {
                anomalyFound = true;
                anomalyMessage = `${rule.name} - ${rule.condition} (${metricValue?.toFixed(1)}%) > ${rule.threshold}%`;
                logger.warn(`🚨 Anomaly detected: ${rule.name}`);

                // Store anomaly
                const anomalyId = await storeAnomalies({
                    id: 0,
                    created_at: new Date().toISOString(),
                    rule_id: rule.name,
                    severity: rule.severity,
                    description: `${rule.name}: ${rule.condition} at ${metricValue?.toFixed(1)}% exceeds threshold ${rule.threshold}%`,
                    metric_value: metricValue || 0,
                    device_id: env.DEVICE_ID
                });

                if (anomalyId) {
                    const analysis = await analyzeWithAI(rule.name, latestMetric);
                    if (analysis) {
                        await storeInsight(anomalyId, analysis);
                        logger.info(`🤖 AI insight generated: ${analysis.status} - ${analysis.rootCause.slice(0, 50)}...`);
                    }
                }

                addStatusCheck(latestMetric, true, anomalyMessage);
                break;
            }
        }

        if (!anomalyFound) {
            addStatusCheck(latestMetric, false);
        }
    } catch (error) {
        logger.error('Anomaly detection failed:', error);
    }
}

export function startAnomalyDetection(): void {
    setInterval(checkAnomalies, 60000);
    logger.info('✅ Anomaly detection started');
}
