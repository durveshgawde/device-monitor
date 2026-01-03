import { useEffect, useState, useRef } from 'react';
import { Metrics } from '@/types';

export function useWebSocket(url: string) {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [connected, setConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connectWebSocket = () => {
            try {
                ws.current = new WebSocket(url);

                ws.current.onopen = () => {
                    console.log('WebSocket connected');
                    setConnected(true);
                };

                ws.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        setMetrics(data);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setConnected(false);
                };

                ws.current.onclose = () => {
                    console.log('WebSocket disconnected');
                    setConnected(false);

                    // Reconnect after 5 seconds
                    setTimeout(connectWebSocket, 5000);
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                setConnected(false);
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url]);

    return { metrics, connected };
}
