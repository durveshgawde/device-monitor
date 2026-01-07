import axios from 'axios';
import { logger } from '../utils/logger';
import { env } from '../utils/env';
import { supabase } from '../utils/supabase';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function chatWithAI(
    userMessage: string,
    currentMetrics: any
): Promise<string> {
    if (!env.OPENROUTER_API_KEY) {
        const errorMsg = 'OpenRouter API key not configured';
        logger.warn('⚠️ ' + errorMsg);
        throw new Error(errorMsg);
    }

    try {
        // Build context from metrics
        const metricsContext = `
Current System Metrics:
- CPU Usage: ${currentMetrics.cpu_percent?.toFixed(1)}%
- Memory: ${currentMetrics.memory_percent?.toFixed(1)}% (${currentMetrics.free_memory_mb?.toFixed(0)} MB free)
- Disk: ${currentMetrics.disk_percent?.toFixed(1)}%
- Network In: ${currentMetrics.network_in_mbps?.toFixed(2)} Mbps
- Network Out: ${currentMetrics.network_out_mbps?.toFixed(2)} Mbps
- Load Average (1m): ${currentMetrics.load_avg_1min?.toFixed(2)}
- P95 Latency: ${currentMetrics.p95_latency?.toFixed(0)}ms
- Error Rate: ${currentMetrics.error_rate?.toFixed(2)}%
- Uptime: ${currentMetrics.uptime_hours?.toFixed(1)} hours
    `;

        const systemPrompt = `You are a concise system monitoring assistant. Give SHORT, direct answers. 

RULES:
- Keep responses under 3 sentences unless asked for details
- Get straight to the point
- Only explain in depth if explicitly asked
- Reference actual metric values when relevant

${metricsContext}`;

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'mistralai/devstral-2512:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3001',
                    'X-Title': 'Device Monitor Chatbot'
                }
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        return aiResponse;
    } catch (error: any) {
        logger.error('Chatbot API call failed:', error);

        // Provide specific error messages
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            if (status === 401) {
                throw new Error('Invalid OpenRouter API key');
            } else if (status === 429) {
                throw new Error('OpenRouter rate limit exceeded. Please try again later.');
            } else if (status === 402) {
                throw new Error('OpenRouter credits exhausted. Please add credits to your account.');
            } else {
                throw new Error(`OpenRouter API error (${status}): ${errorData?.error?.message || 'Unknown error'}`);
            }
        } else if (error.request) {
            throw new Error('Network error: Could not reach OpenRouter API');
        } else {
            throw new Error(`Chat error: ${error.message}`);
        }
    }
}

// Store chat in database
export async function storeChatMessage(
    deviceId: string,
    userMessage: string,
    aiResponse: string,
    metrics: any
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('chat_history')
            .insert([{
                device_id: deviceId,
                user_message: userMessage,
                ai_response: aiResponse,
                metrics_context: metrics
            }]);

        if (error) throw error;
        return true;
    } catch (error) {
        logger.error('Failed to store chat:', error);
        return false;
    }
}

// Get chat history
export async function getChatHistory(deviceId: string, limit: number = 50) {
    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('device_id', deviceId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        logger.error('Failed to fetch chat history:', error);
        return [];
    }
}
