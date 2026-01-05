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
                model: 'mistralai/devstral-2512:free',
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

        // Validate response structure before accessing nested properties
        const choices = response.data?.choices;
        if (!choices || !Array.isArray(choices) || choices.length === 0) {
            logger.warn('OpenRouter returned empty or invalid choices array');
            return {
                rootCause: 'AI analysis unavailable (empty response)',
                recommendations: 'Try again later or check API status',
                status: 'INFO'
            };
        }

        const content = choices[0]?.message?.content;
        if (!content) {
            logger.warn('OpenRouter response missing content');
            return {
                rootCause: 'AI analysis unavailable (no content)',
                recommendations: 'Try again later or check API status',
                status: 'INFO'
            };
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    rootCause: parsed.rootCause || 'Unknown',
                    recommendations: parsed.recommendations || 'No recommendations',
                    status: parsed.status || 'INFO'
                };
            } catch (parseError) {
                logger.warn('Failed to parse AI response as JSON');
            }
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

// Generate AI health check message when system is healthy
export async function generateHealthCheckMessage(
    metrics: any
): Promise<{ message: string; timestamp: string } | null> {
    if (!env.OPENROUTER_API_KEY) {
        return {
            message: '✅ All systems operating normally. No anomalies detected.',
            timestamp: new Date().toISOString()
        };
    }

    try {
        const prompt = `
You are a friendly system health assistant. The system is running perfectly with no anomalies.

Current metrics:
- CPU: ${metrics.cpu_percent?.toFixed(1) || 0}%
- Memory: ${metrics.memory_percent?.toFixed(1) || 0}%
- Uptime: ${metrics.uptime_hours?.toFixed(1) || 0} hours

Generate a SHORT, positive 1-2 sentence health status message. Be encouraging and professional.
Format: Just the message text, no JSON.
        `;

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'mistralai/devstral-2512:free',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3001',
                    'X-Title': 'Device Monitor'
                }
            }
        );

        const content = response.data?.choices?.[0]?.message?.content;

        return {
            message: content?.trim() || '✅ System healthy - no issues detected.',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error('Health check AI call failed:', error);
        return {
            message: '✅ All systems operating normally.',
            timestamp: new Date().toISOString()
        };
    }
}
