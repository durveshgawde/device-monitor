'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { WebSocketContext } from './WebSocketProvider';

export default function Navigation() {
  const { connected } = useContext(WebSocketContext);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">📊 Device Monitor</h1>

        <div className="flex gap-6">
          <Link href="/" className="hover:text-blue-400">Dashboard</Link>
          <Link href="/processes" className="hover:text-blue-400">Processes</Link>
          <Link href="/anomalies" className="hover:text-blue-400">Anomalies</Link>
          <Link href="/rules" className="hover:text-blue-400">Rules</Link>
          <Link href="/chat" className="hover:text-blue-400">💬 Chat</Link>
          <Link href="/export" className="hover:text-blue-400">Export</Link>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </nav>
  );
}
