import React, { useState } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { ClearOutlined, UserOutlined } from '@ant-design/icons';
import { useWebSocketContext } from '../context/WebSocketContext';
import { ColorPalette } from './ColorPalette';
import { PixelGrid } from './PixelGrid';

const { Title, Text } = Typography;

const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080', '#C0C0C0'
];

export const PixelArtCanvas: React.FC = () => {
  const { canvas, connectedUsers, isConnected, sendPixelUpdate, clearCanvas } = useWebSocketContext();
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handlePixelClick = (x: number, y: number) => {
    if (isConnected) {
      sendPixelUpdate(x, y, selectedColor);
    }
  };

  const handleClearCanvas = () => {
    if (isConnected) {
      clearCanvas();
    }
  };

  return (
    <Card 
      className="pixel-art-canvas"
      style={{ 
        background: '#161b22',
        borderColor: '#30363d',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Title level={3} style={{ margin: 0, color: '#e6edf3' }}>
            Pixel Canvas
          </Title>
          <Space>
            <Text style={{ color: '#8b949e' }}>
              <UserOutlined /> {connectedUsers.size}
            </Text>
            <Button
              type="primary"
              danger
              icon={<ClearOutlined />}
              onClick={handleClearCanvas}
              disabled={!isConnected}
              style={{ 
                background: '#da3633',
                borderColor: '#da3633'
              }}
            >
            </Button>
          </Space>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div>
            <Text strong style={{ color: '#e6edf3', display: 'block', marginBottom: '12px' }}>
              Canvas (32x32)
            </Text>
            <PixelGrid
              canvas={canvas}
              selectedColor={selectedColor}
              onPixelClick={handlePixelClick}
              disabled={!isConnected}
            />
          </div>
          
          <div>
            <Text strong style={{ color: '#e6edf3', display: 'block', marginBottom: '12px' }}>
              Color Palette
            </Text>
            <ColorPalette
              colors={DEFAULT_COLORS}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          </div>
        </div>

        {!isConnected && (
          <Text type="warning" style={{ textAlign: 'center', color: '#f85149' }}>
            Not connected to server. Please wait for connection to be established.
          </Text>
        )}
      </Space>
    </Card>
  );
};