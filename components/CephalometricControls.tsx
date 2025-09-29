import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Divider, CircularProgress, Alert, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
// FIX: Import CephalometricMeasurement to use for type casting.
import { CephalometricAnalysis, CephalometricLandmark, CephalometricMeasurement } from '../types';
import { detectCephalometricLandmarks } from '../services/geminiService';

interface CephalometricControlsProps {
  onImageUpload: (url: string, mimeType: string, width: number, height: number) => void;
  onAiDetection: (landmarks: CephalometricLandmark[]) => void;
  analysisReport: CephalometricAnalysis | null;
  image: { url: string | null; mimeType: string | null; };
}

const requiredLandmarks = ['Sella (S)', 'Nasion (N)', 'A-point (A)', 'B-point (B)', 'Pogonion (Pog)', 'Menton (Me)', 'Gonion (Go)', 'Gnathion (Gn)', 'Porion (Po)', 'Orbitale (Or)'];

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const CephalometricControls: React.FC<CephalometricControlsProps> = ({
  onImageUpload,
  onAiDetection,
  analysisReport,
  image,
}) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError('');
      const url = await fileToDataUrl(file);
      const img = new Image();
      img.onload = () => {
        onImageUpload(url, file.type, img.width, img.height);
      };
      img.src = url;
    }
  };

  const handleAutoDetect = async () => {
    if (!image.url || !image.mimeType) return;
    setIsLoadingAI(true);
    setError('');
    try {
      const img = await new Promise<HTMLImageElement>(res => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = image.url!;
      });
      const detectedLandmarks = await detectCephalometricLandmarks(image.url, image.mimeType, requiredLandmarks);
      const updatedLandmarks = detectedLandmarks.map(lm => ({
          ...lm,
          point: {
              x: lm.point.x * img.width,
              y: lm.point.y * img.height,
          }
      }));
      onAiDetection(updatedLandmarks);
    } catch (err) {
      console.error(err);
      setError('AI landmark detection failed. Please try again with a clear image.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <Paper sx={{ p: 2, height: 'calc(100vh - 112px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Controls & Analysis</Typography>
      <Divider />
      
      <Typography variant="subtitle1" gutterBottom>1. Upload Image</Typography>
      <Button component="label" variant="contained" startIcon={<UploadFileIcon />} fullWidth>
        Upload X-ray
        <input type="file" hidden accept="image/png, image/jpeg" onChange={handleFileChange} />
      </Button>

      {image.url && (
        <>
            <Typography variant="subtitle1" gutterBottom>2. Run AI Detection</Typography>
            <Button 
                onClick={handleAutoDetect} 
                variant="outlined" 
                fullWidth 
                startIcon={isLoadingAI ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                disabled={isLoadingAI}
            >
                Detect Landmarks
            </Button>
        </>
      )}

      {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}

      {analysisReport && (
        <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>Analysis Report</Typography>
            {Object.entries(analysisReport).map(([analysisName, measurements]) => (
              <Box key={analysisName} sx={{mb: 2}}>
                <Typography variant="body1" sx={{fontWeight: 'bold'}}>{analysisName}</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Measurement</TableCell>
                                <TableCell align="right">Value</TableCell>
                                <TableCell align="right">Interpretation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* FIX: Cast `measurements` to the correct type to allow mapping. */}
                            {(measurements as CephalometricMeasurement[]).map(m => (
                                <TableRow key={m.name}>
                                    <TableCell component="th" scope="row">{m.name}</TableCell>
                                    <TableCell align="right">{`${m.value.toFixed(1)} ${m.unit}`}</TableCell>
                                    <TableCell align="right">
                                       {m.interpretation && <Chip label={m.interpretation} size="small" color={m.interpretation === 'Normal' ? 'success' : 'warning'}/>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
              </Box>
            ))}
        </>
      )}
    </Paper>
  );
};

export default CephalometricControls;