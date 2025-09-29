import React from 'react';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import type { Finding } from '../types';
import { CasePriority } from '../types';
import { PRIORITY_COLORS } from '../constants';

interface ImageViewerProps {
  imageUrl: string;
  findings: Finding[];
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, findings }) => {
  const theme = useTheme();
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', backgroundColor: theme.palette.grey[200], borderRadius: 2, overflow: 'hidden' }}>
      <img src={imageUrl} alt="Medical scan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      {findings.map((finding) => {
        const { x_min, y_min, x_max, y_max } = finding.bounding_box;
        
        // Determine color based on confidence/risk - simple logic for now
        // FIX: Access colors using theme.palette.mode and CasePriority enum
        const borderColor = finding.confidence > 0.75 ? PRIORITY_COLORS[CasePriority.HIGH][theme.palette.mode].main : PRIORITY_COLORS[CasePriority.MEDIUM][theme.palette.mode].main;

        return (
          <Tooltip 
            key={finding.id}
            title={
                <React.Fragment>
                    <Typography color="inherit" sx={{fontWeight: 'bold'}}>{finding.label}</Typography>
                    <em>{finding.description}</em>
                    <br/>
                    <b>Confidence: {`${(finding.confidence * 100).toFixed(1)}%`}</b>
                </React.Fragment>
            }
            arrow
          >
            <Box
              sx={{
                position: 'absolute',
                left: `${x_min * 100}%`,
                top: `${y_min * 100}%`,
                width: `${(x_max - x_min) * 100}%`,
                height: `${(y_max - y_min) * 100}%`,
                border: `3px solid ${borderColor}`,
                boxSizing: 'border-box',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};