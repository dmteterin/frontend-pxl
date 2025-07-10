import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { WebSocketMessage, ConnectionStatus, PixelCanvas } from '../types/websocket';

interface WebSocketContextType {
  status: ConnectionStatus;
  messages: WebSocketMessage[];
  connectedUsers: Set<string>;
  error: string | null;
  isConnected: boolean;
  canvas: PixelCanvas;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp'>) => void;
  sendTextUpdate: (content: string) => void;
  sendPixelUpdate: (x: number, y: number, color: string) => void;
  clearCanvas: () => void;
  clearMessages: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url, 
  reconnectInterval = 3000, 
  maxReconnectAttempts = 5 
}) => {
  const webSocket = useWebSocket({ url, reconnectInterval, maxReconnectAttempts });

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};