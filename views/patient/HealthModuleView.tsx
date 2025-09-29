import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { HealthDomain, ScanType, AnalysisResult, Case } from '../../types';
import { useCaseProcessor } from '../../hooks/useCaseProcessor';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

interface HealthModuleViewProps {
  domain: HealthDomain;
  onBack: () => void;
}

const domainToScanTypeMap: Partial<Record<HealthDomain, ScanType>> = {
    [HealthDomain.SKIN_HEALTH]: ScanType.SKIN_PHOTO,
    [HealthDomain.CARDIOVASCULAR]: ScanType.ECG,
};

const HealthModuleView: React.FC<HealthModuleViewProps> = ({ domain, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isProcessing, processNewCase } = useCaseProcessor();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    const scanType = domainToScanTypeMap[domain];
    if (!file || !scanType) {
        setError("Please select a valid image file.");
        return;
    };
    
    // The hook handles the async processing in the background.
    // For a patient view, we might want a more direct feedback loop.
    // This is a simplified version. A real app would poll DB for the result.
    setError(null);
    try {
        // This is a simplified approach for demonstration
        // In a real app, you would not call the processor directly here but monitor the DB.
        // For now, we'll just show an "in progress" message.
        await processNewCase(file, domain, scanType);
        setResult(null); // Clear previous result
    } catch(err) {
        setError("Analysis could not be initiated.");
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>{domain} Analysis</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Upload a relevant image (e.g., a photo of a skin lesion) for a preliminary AI analysis. This is not a substitute for professional medical advice.
      </Typography>

        <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
                 <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
                    <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Select an image to analyze.
                    </Typography>
                    <label htmlFor="patient-file-upload">
                        <Input accept="image/*" id="patient-file-upload" type="file" onChange={handleFileChange} />
                        <Button variant="outlined" component="span">
                        Select File
                        </Button>
                    </label>
                    {file && <Typography sx={{ mt: 2, fontWeight: 'medium' }}>Selected: {file.name}</Typography>}
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                 <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleAnalyze}
                    disabled={!file || isProcessing}
                    fullWidth
                >
                    {isProcessing ? <CircularProgress size={24} color="inherit"/> : `Analyze ${domain}`}
                </Button>
            </Grid>
        </Grid>
      
      {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
      
      {isProcessing && <Alert severity="info" sx={{mt: 2}}>Analysis is in progress. Please check "My Reports" for the result shortly.</Alert>}

    </Paper>
  );
};

export default HealthModuleView;