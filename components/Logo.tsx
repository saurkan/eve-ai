import React from 'react';
import { SvgIcon, useTheme } from '@mui/material';

export const Logo: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const theme = useTheme();
  return (
    <SvgIcon
      viewBox="0 0 100 100"
      sx={{ width: size, height: size }}
      titleAccess="EVE AI Logo"
    >
      <defs>
        <linearGradient id="lotusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.palette.primary.light} />
          <stop offset="100%" stopColor={theme.palette.primary.main} />
        </linearGradient>
      </defs>
      {/* Central Petal */}
      <path d="M50 30 C 50 10, 50 10, 50 30 Q 50 50, 60 60 L 50 70 L 40 60 Q 50 50, 50 30 Z" fill="url(#lotusGradient)" />
      {/* Side Petals */}
      <path d="M50 40 C 30 30, 20 50, 40 60 L 50 70 Z" fill={theme.palette.primary.dark} />
      <path d="M50 40 C 70 30, 80 50, 60 60 L 50 70 Z" fill={theme.palette.primary.dark} />
      {/* Outer Petals */}
      <path d="M50 50 C 20 50, 10 80, 40 80 L 50 70 Z" fill={theme.palette.primary.main} />
      <path d="M50 50 C 80 50, 90 80, 60 80 L 50 70 Z" fill={theme.palette.primary.main} />
    </SvgIcon>
  );
};