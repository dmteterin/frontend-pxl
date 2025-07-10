import React, { useState, useEffect, useRef } from 'react';
import { Input, Badge, Typography } from 'antd';
import { useWebSocketContext } from '../context/WebSocketContext';
import { ConnectionStatus } from '../types/websocket';

const { TextArea } = Input;
const { Text } = Typography;

const RealtimeTextEditor: React.FC = () => {
  const [text, setText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    status,
    messages,
    connectedUsers,
    connect,
    sendMessage,
    isConnected
  } = useWebSocketContext();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-connect on mount
    connect();
  }, [connect]);

  useEffect(() => {
    // Handle incoming messages
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'text_update' && !isUpdating) {
      setText(lastMessage.content || '');
    }
  }, [messages, isUpdating]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Check 512 byte limit
    if (new Blob([value]).size > 512) {
      return;
    }

    setText(value);
    setIsUpdating(true);

    if (isConnected) {
      sendMessage({
        type: 'text_update',
        content: value
      });
    }

    // Prevent update loops
    setTimeout(() => {
      setIsUpdating(false);
    }, 50);
  };

  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'success';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'processing';
      case ConnectionStatus.ERROR:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.CONNECTING:
        return 'Connecting...';
      case ConnectionStatus.RECONNECTING:
        return 'Reconnecting...';
      case ConnectionStatus.ERROR:
        return 'Error';
      case ConnectionStatus.DISCONNECTED:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#141414', 
      color: '#fff',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          Real-time Text Editor
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Badge 
            status={getStatusColor()} 
            text={<Text style={{ color: '#fff' }}>{getStatusText()}</Text>}
          />
          <Text style={{ color: '#fff' }}>
            Users: {connectedUsers.size}
          </Text>
        </div>
      </div>

      {/* Text Editor */}
      <div style={{ flex: 1 }}>
        <TextArea
          ref={textAreaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Start typing... Text will sync in real-time with other users"
          style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#1f1f1f',
            border: '1px solid #434343',
            color: '#fff',
            fontSize: '16px',
            resize: 'none'
          }}
          disabled={!isConnected}
          showCount
          maxLength={512}
        />
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '20px', 
        padding: '10px 0',
        borderTop: '1px solid #434343',
        textAlign: 'center'
      }}>
        <Text style={{ color: '#666', fontSize: '12px' }}>
          WebSocket: ws://localhost:8080/ws | Max 512 bytes
        </Text>
      </div>
    </div>
  );
};

export default RealtimeTextEditor;