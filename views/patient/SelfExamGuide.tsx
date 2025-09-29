import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { generateEducationalImage } from '../../services/geminiService';

interface SelfExamGuideProps {
  onBack: () => void;
}

const SelfExamGuide: React.FC<SelfExamGuideProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateGuide = async () => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const prompt = "A step-by-step visual guide for a breast self-exam, using minimalist line art and highlighted areas for clarity and inclusivity.";
      const result = await generateEducationalImage(prompt);
      setImageUrl(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate the guide at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>AI-Powered Breast Self-Exam Guide</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Regular self-exams are an important part of breast health awareness. Click the button below to generate a personalized, step-by-step visual guide.
      </Typography>

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Button 
            variant="contained" 
            size="large"
            onClick={handleGenerateGuide}
            disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Generate My Visual Guide'}
        </Button>
      </Box>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {imageUrl && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Your Step-by-Step Guide</Typography>
            <img 
                src={imageUrl} 
                alt="AI-generated breast self-exam guide" 
                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #ddd', maxHeight: '512px' }} 
            />
        </Box>
      )}
    </Paper>
  );
};

export default SelfExamGuide;