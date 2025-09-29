import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, List, ListItem, ListItemText, Divider, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { analyzeNutrition, NutritionInfo } from '../../services/geminiService';
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


const NutritionModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<NutritionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);
      const url = await fileToDataUrl(selectedFile);
      setImageDataUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUrl || !file) {
      setError("Please select an image file.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        const analysisResult = await analyzeNutrition(imageDataUrl, file.type);
        setResult(analysisResult);
    } catch(err) {
        console.error(err);
        setError("Analysis failed. Please try again with a clearer image.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>AI Nutrition Analyzer</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Upload a photo of your meal for an estimated nutritional breakdown. This tool is for informational purposes only.
      </Typography>

        <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
                 <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
                    {imageDataUrl ? (
                         <img src={imageDataUrl} alt="Meal preview" style={{maxHeight: '150px', maxWidth: '100%', borderRadius: '8px'}} />
                    ) : (
                        <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    )}
                    <Typography color="text.secondary" sx={{ my: 2 }}>
                       {file ? `Selected: ${file.name}` : 'Select an image to analyze.'}
                    </Typography>
                    <label htmlFor="nutrition-file-upload">
                        <Input accept="image/*" id="nutrition-file-upload" type="file" onChange={handleFileChange} />
                        <Button variant="outlined" component="span">
                         {file ? 'Change File' : 'Select File' }
                        </Button>
                    </label>
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                 <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleAnalyze}
                    disabled={!file || isLoading}
                    fullWidth
                >
                    {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Analyze Meal Photo'}
                </Button>
            </Grid>
        </Grid>
      
      {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
      
      {result && (
        <Paper variant="outlined" sx={{mt: 3, p: 2}}>
            <Typography variant="h6" gutterBottom>Nutritional Estimate</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h4" color="primary">{result.estimated_calories}</Typography>
                    <Typography color="text.secondary">Estimated Calories</Typography>
                </Grid>
                 <Grid item xs={12} sm={8}>
                     <List dense>
                        <ListItem><ListItemText primary="Protein" secondary={`${result.macronutrients.protein_g}g`} /></ListItem>
                        <ListItem><ListItemText primary="Carbohydrates" secondary={`${result.macronutrients.carbohydrates_g}g`} /></ListItem>
                        <ListItem><ListItemText primary="Fat" secondary={`${result.macronutrients.fat_g}g`} /></ListItem>
                     </List>
                </Grid>
            </Grid>
            <Divider sx={{my: 2}} />
             <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>Suggestions</Typography>
             <List>
                {result.suggestions.map((tip, i) => (
                    <ListItem key={i}><ListItemText primary={`• ${tip}`} /></ListItem>
                ))}
             </List>
        </Paper>
      )}

    </Paper>
  );
};

export default NutritionModule;