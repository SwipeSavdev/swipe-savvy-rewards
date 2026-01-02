import React from 'react';
import { G, Rect, Svg, Text as SvgText } from 'react-native-svg';

interface SavvyAIIconProps {
  size?: number;
  color?: string;
}

export const SavvyAIIcon: React.FC<SavvyAIIconProps> = ({ 
  size = 64, 
  color = '#6B5BFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Gradient definition for border */}
      <G>
        {/* Main rounded square background */}
        <Rect
          x="4"
          y="8"
          width="52"
          height="52"
          rx="12"
          ry="12"
          fill="white"
          stroke={color}
          strokeWidth="3"
        />
        
        {/* AI Text */}
        <SvgText
          x="32"
          y="42"
          fontSize="28"
          fontWeight="bold"
          textAnchor="middle"
          fill="#000000"
          fontFamily="Arial, sans-serif"
        >
          AI
        </SvgText>
        
        {/* Sparkle - Four pointed star */}
        <G transform="translate(48, 16)">
          {/* Center dot */}
          <Rect
            x="-1"
            y="-1"
            width="2"
            height="2"
            fill={color}
          />
          
          {/* Top point */}
          <Rect
            x="-1.5"
            y="-8"
            width="3"
            height="5"
            fill={color}
          />
          
          {/* Bottom point */}
          <Rect
            x="-1.5"
            y="3"
            width="3"
            height="5"
            fill={color}
          />
          
          {/* Left point */}
          <Rect
            x="-8"
            y="-1.5"
            width="5"
            height="3"
            fill={color}
          />
          
          {/* Right point */}
          <Rect
            x="3"
            y="-1.5"
            width="5"
            height="3"
            fill={color}
          />
        </G>
      </G>
    </Svg>
  );
};
