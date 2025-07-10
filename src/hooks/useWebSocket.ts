import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessage, ConnectionStatus, WebSocketState } from '../types/websocket';

interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = ({ 
  url, 
  reconnectInterval = 3000, 
  maxReconnectAttempts = 5 
}: UseWebSocketOptions) => {
  const [state, setState] = useState<WebSocketState>({
    status: ConnectionStatus.DISCONNECTED,
    messages: [],
    connectedUsers: new Set(),
    error: null,
    canvas: {
      width: 32,
      height: 32,
      pixels: {}
    }
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutId = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, status: ConnectionStatus.CONNECTING, error: null }));

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({ ...prev, status: ConnectionStatus.CONNECTED }));
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('msg : ', message)
          
          setState(prev => {
            const newState = { ...prev };
            newState.messages = [...prev.messages, message];

            switch (message.type) {
              case 'user_joined':
                if (message.client_id) {
                  newState.connectedUsers = new Set([...prev.connectedUsers, message.client_id]);
                }
                break;
              case 'user_left':
                if (message.client_id) {
                  const updatedUsers = new Set(prev.connectedUsers);
                  updatedUsers.delete(message.client_id);
                  newState.connectedUsers = updatedUsers;
                }
                break;
              case 'user_list':
                if (message.user_list) {
                  newState.connectedUsers = new Set(message.user_list);
                }
                break;
              case 'pixel_update':
                if (message.x !== undefined && message.y !== undefined && message.color) {
                  const key = `${message.x},${message.y}`;
                  newState.canvas = {
                    ...prev.canvas,
                    pixels: {
                      ...prev.canvas.pixels,
                      [key]: message.color
                    }
                  };
                }
                break;
              case 'canvas_state':
                if (message.pixels) {
                  newState.canvas = {
                    ...prev.canvas,
                    pixels: message.pixels
                  };
                }
                break;
              case 'canvas_clear':
                newState.canvas = {
                  ...prev.canvas,
                  pixels: {}
                };
                break;
            }

            return newState;
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
        setState(prev => ({ ...prev, status: ConnectionStatus.DISCONNECTED }));
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setState(prev => ({ ...prev, status: ConnectionStatus.RECONNECTING }));
          
          reconnectTimeoutId.current = window.setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setState(prev => ({ 
            ...prev, 
            status: ConnectionStatus.ERROR, 
            error: 'Max reconnection attempts reached' 
          }));
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          status: ConnectionStatus.ERROR, 
          error: 'WebSocket connection error' 
        }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({ 
        ...prev, 
        status: ConnectionStatus.ERROR, 
        error: 'Failed to create WebSocket connection' 
      }));
    }
  }, [url, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutId.current) {
      window.clearTimeout(reconnectTimeoutId.current);
      reconnectTimeoutId.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      status: ConnectionStatus.DISCONNECTED,
      connectedUsers: new Set(),
      error: null
    }));
  }, []);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const messageWithTimestamp: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      ws.current.send(JSON.stringify(messageWithTimestamp));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  const sendTextUpdate = useCallback((content: string) => {
    sendMessage({ type: 'text_update', content });
  }, [sendMessage]);

  const sendPixelUpdate = useCallback((x: number, y: number, color: string) => {
    sendMessage({ type: 'pixel_update', x, y, color });
  }, [sendMessage]);

  const clearCanvas = useCallback(() => {
    sendMessage({ type: 'canvas_clear' });
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    sendTextUpdate,
    sendPixelUpdate,
    clearCanvas,
    clearMessages,
    isConnected: state.status === ConnectionStatus.CONNECTED
  };
};