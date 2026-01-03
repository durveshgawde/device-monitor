import axios from 'axios';
import { AIInsight } from '../types/metrics';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

export async function analyzeWithAI(
    anomalyType: string,
    metrics: any
): Promise<AIInsight | null> {
    if (!env.OPENROUTER_API_KEY) {
        logger.warn('⚠️ OpenRouter API key not set');
        return null;
    }

    try {
        const prompt = `
Analyze this system anomaly:

Type: ${anomalyType}
CPU: ${metrics.cpu_percent?.toFixed(1)}%
Memory: ${metrics.memory_percent?.toFixed(1)}%
P95 Latency: ${metrics.p95_latency}ms
Error Rate: ${metrics.error_rate}%

Provide:
1. Root cause (1-2 sentences)
2. Recommendations (3 bullet points)
3. Status (CRITICAL, WARNING, or INFO)

Format as JSON: { "rootCause": "...", "recommendations": "...", "status": "..." }
    `;

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openrouter/auto',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3001',
                    'X-Title': 'Device Monitor'
                }
            }
        );

        const content = response.data.choices.message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch);
            return {
                rootCause: parsed.rootCause,
                recommendations: parsed.recommendations,
                status: parsed.status
            };
        }

        return {
            rootCause: content.slice(0, 100),
            recommendations: 'See analysis above',
            status: 'INFO'
        };
    } catch (error) {
        logger.error('OpenRouter API call failed:', error);
        return null;
    }
}
