import type { Metadata } from 'next';
import WebSocketProvider from '@/components/WebSocketProvider';
import Navigation from '@/components/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Device Monitor',
  description: 'Real-time system and app monitoring'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WebSocketProvider>
          <Navigation />
          <main className="p-4 md:p-8">
            {children}
          </main>
        </WebSocketProvider>
      </body>
    </html>
  );
}
