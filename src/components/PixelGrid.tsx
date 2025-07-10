import React, { useRef, useEffect, useCallback } from 'react';
import { PixelCanvas } from '../types/websocket';

interface PixelGridProps {
  canvas: PixelCanvas;
  selectedColor: string;
  onPixelClick: (x: number, y: number) => void;
  disabled?: boolean;
}

const PIXEL_SIZE = 12;

export const PixelGrid: React.FC<PixelGridProps> = ({
  canvas,
  selectedColor,
  onPixelClick,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // Draw grid background
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvas.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * PIXEL_SIZE, 0);
      ctx.lineTo(x * PIXEL_SIZE, canvas.height * PIXEL_SIZE);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * PIXEL_SIZE);
      ctx.lineTo(canvas.width * PIXEL_SIZE, y * PIXEL_SIZE);
      ctx.stroke();
    }

    // Draw pixels
    for (const [key, color] of Object.entries(canvas.pixels)) {
      const [x, y] = key.split(',').map(Number);
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        ctx.fillStyle = color;
        ctx.fillRect(
          x * PIXEL_SIZE + 1,
          y * PIXEL_SIZE + 1,
          PIXEL_SIZE - 2,
          PIXEL_SIZE - 2
        );
      }
    }
  }, [canvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      onPixelClick(x, y);
    }
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <canvas
        ref={canvasRef}
        width={canvas.width * PIXEL_SIZE}
        height={canvas.height * PIXEL_SIZE}
        onClick={handleCanvasClick}
        style={{
          border: '2px solid #30363d',
          borderRadius: '6px',
          cursor: disabled ? 'not-allowed' : 'crosshair',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: '#0d1117'
        }}
      />
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
        Selected color: 
        <span 
          style={{ 
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: selectedColor,
            border: '1px solid #30363d',
            borderRadius: '2px',
            marginLeft: '8px',
            verticalAlign: 'middle'
          }}
        />
        <span style={{ marginLeft: '8px', color: '#e6edf3' }}>{selectedColor}</span>
      </div>
    </div>
  );
};