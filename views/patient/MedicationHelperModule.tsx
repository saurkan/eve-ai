import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, TextField, Tabs, Tab, List, ListItem, ListItemText, Divider, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { analyzePrescription } from '../../services/geminiService';
import { MedicationInfo } from '../../types';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const MedicationHelperModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState(0);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedicationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const url = await fileToDataUrl(selectedFile);
      setImageDataUrl(url);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    const isTextMode = tab === 1;
    if (isTextMode && !inputText.trim()) {
      setError("Please enter the prescription text.");
      return;
    }
    if (!isTextMode && !file) {
      setError("Please upload a photo of the prescription.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const analysisResult = await analyzePrescription(
        isTextMode ? inputText : null,
        !isTextMode && file ? { dataUrl: imageDataUrl!, mimeType: file.type } : undefined
      );
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please ensure the image is clear or the text is accurate and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>AI Medication Helper</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Get a simple explanation of your prescription. This is for informational purposes only and is not a substitute for advice from your doctor or pharmacist.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Upload Photo" />
          <Tab label="Enter Text" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
            {imageDataUrl ? (
                <img src={imageDataUrl} alt="Prescription" style={{maxHeight: '150px', maxWidth: '100%', borderRadius: '8px'}} />
            ) : (
                <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            )}
            <Typography color="text.secondary" sx={{ my: 2 }}>
                {file ? `Selected: ${file.name}` : 'Upload a clear photo of your prescription.'}
            </Typography>
            <label htmlFor="prescription-upload">
                <Input accept="image/*" id="prescription-upload" type="file" onChange={handleFileChange} />
                <Button variant="outlined" component="span">
                    {file ? 'Change Photo' : 'Select Photo'}
                </Button>
            </label>
        </Box>
      )}
      
      {tab === 1 && (
         <TextField
            fullWidth
            multiline
            rows={5}
            label="Prescription Details"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'Metformin 500mg, take one tablet twice a day with meals'"
        />
      )}

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Button 
            variant="contained" 
            size="large"
            onClick={handleAnalyze}
            disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Explain My Prescription'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {result && (
          <Paper variant="outlined" sx={{mt: 2, p: 2}}>
            <Alert severity="warning" sx={{mb: 2}}>
                <strong>Disclaimer:</strong> Always follow the instructions from your healthcare provider. This AI-generated information is for educational purposes only.
            </Alert>
            <Typography variant="h4" color="primary">{result.medication_name}</Typography>
            <Divider sx={{my: 2}} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                     <Typography variant="h6" gutterBottom>Purpose</Typography>
                     <Typography variant="body1">{result.purpose}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                     <Typography variant="h6" gutterBottom>How to Take</Typography>
                     <Typography variant="body1">{result.dosage_instructions}</Typography>
                </Grid>
                 <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Common Side Effects</Typography>
                    <List dense>
                        {result.common_side_effects.map((item, i) => <ListItem key={i}><ListItemText primary={`• ${item}`} /></ListItem>)}
                    </List>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Important Notes</Typography>
                    <List dense>
                        {result.important_notes.map((item, i) => <ListItem key={i}><ListItemText primary={`• ${item}`} /></ListItem>)}
                    </List>
                </Grid>
            </Grid>
          </Paper>
      )}
    </Paper>
  );
};

export default MedicationHelperModule;