'use client';

import { createContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Metrics } from '@/types';

interface WebSocketContextType {
    metrics: Metrics | null;
    connected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType>({
    metrics: null,
    connected: false
});

interface WebSocketProviderProps {
    children: ReactNode;
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const { metrics, connected } = useWebSocket(wsUrl);

    return (
        <WebSocketContext.Provider value={{ metrics, connected }}>
            {children}
        </WebSocketContext.Provider>
    );
}
