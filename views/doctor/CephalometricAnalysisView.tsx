import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import CephalometricControls from '../../components/CephalometricControls';
import CephalometricCanvas from '../../components/CephalometricCanvas';
import { CephalometricLandmark, CephalometricAnalysis } from '../../types';
import { analyzeCephalometricData } from '../../utils/cephalometricCalculations';

const CephalometricAnalysisView: React.FC = () => {
  const [image, setImage] = useState<{ url: string | null; mimeType: string | null }>({ url: null, mimeType: null });
  const [landmarks, setLandmarks] = useState<CephalometricLandmark[]>([]);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const analysisReport = useMemo(() => {
    if (landmarks.length > 0) {
      return analyzeCephalometricData(landmarks);
    }
    return null;
  }, [landmarks]);

  const handleImageUpload = (url: string, mimeType: string, width: number, height: number) => {
    setImage({ url, mimeType });
    setLandmarks([]); // Reset on new image
    setImageSize({ width, height });
  };

  const handleAiDetection = (detectedLandmarks: CephalometricLandmark[]) => {
    setLandmarks(detectedLandmarks);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 112px)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {image.url ? (
              <CephalometricCanvas
                imageUrl={image.url}
                landmarks={landmarks}
                imageSize={imageSize}
              />
            ) : (
              <Typography color="text.secondary">Upload a Cephalometric X-ray to begin.</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <CephalometricControls
            onImageUpload={handleImageUpload}
            onAiDetection={handleAiDetection}
            analysisReport={analysisReport}
            image={image}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CephalometricAnalysisView;