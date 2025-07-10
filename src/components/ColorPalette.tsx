import React from 'react';
import { Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  selectedColor,
  onColorSelect
}) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '8px', 
      maxWidth: '200px',
      marginTop: '8px'
    }}>
      {colors.map((color) => (
        <Button
          key={color}
          type={selectedColor === color ? 'primary' : 'default'}
          style={{
            backgroundColor: color,
            borderColor: selectedColor === color ? '#1f6feb' : '#30363d',
            borderWidth: selectedColor === color ? '3px' : '2px',
            width: '44px',
            height: '44px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            boxShadow: selectedColor === color ? '0 0 0 2px #1f6feb33' : 'none'
          }}
          onClick={() => onColorSelect(color)}
          icon={selectedColor === color ? <CheckOutlined style={{ 
            color: color === '#000000' || color === '#800000' || color === '#008000' || color === '#000080' || color === '#800080' || color === '#008080' ? '#ffffff' : '#000000',
            fontSize: '16px',
            fontWeight: 'bold'
          }} /> : undefined}
        />
      ))}
    </div>
  );
};