import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper, Alert } from '@mui/material';
import { generateEducationalImage } from '../../services/geminiService';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const EducationStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
        setError("Please enter a description for the image you want to create.");
        return;
    };
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const result = await generateEducationalImage(prompt);
      setImageUrl(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate the image at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>AI Education Studio</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Describe a medical concept or illustration, and the AI will generate a high-quality visual for teaching or patient education.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <TextField
          fullWidth
          label="Image Description"
          variant="outlined"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Diagram of cancerous vs normal cells, minimalist style'"
          disabled={isLoading}
        />
        <Button 
            variant="contained" 
            size="large"
            onClick={handleGenerate}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
            sx={{ height: '56px', whiteSpace: 'nowrap' }}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        {isLoading && <CircularProgress />}
        {imageUrl && (
            <>
                <Typography variant="h6" sx={{ mb: 2 }}>Generated Image</Typography>
                <img 
                    src={imageUrl} 
                    alt="AI-generated educational content" 
                    style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #ddd', maxHeight: '512px' }} 
                />
            </>
        )}
      </Box>
    </Paper>
  );
};

export default EducationStudio;