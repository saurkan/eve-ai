import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEducationalContent, EducationalContent } from '../../services/geminiService';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface PersonalizedEducationModuleProps {
  onBack: () => void;
}

const PersonalizedEducationModule: React.FC<PersonalizedEducationModuleProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError("Please enter a topic or question.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setContent(null);
    try {
      // Pass a generic "Women's Health" domain
      const result = await getEducationalContent("Women's Health", query);
      setContent(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate content at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>Personalized Health Education</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Ask a question or describe what you'd like to learn about. Our AI will generate information and visuals to help you understand.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <TextField
          fullWidth
          label="What would you like to know?"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={"e.g., 'What are the stages of menopause?' or 'Show me a diagram of the pelvic floor.'"}
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
          {isLoading ? 'Generating...' : 'Learn'}
        </Button>
      </Box>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {isLoading && <Box sx={{textAlign: 'center'}}><CircularProgress /></Box>}

      {content && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            {content.imageUrl && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img 
                        src={content.imageUrl} 
                        alt={`AI-generated visual for ${query}`}
                        style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #ddd', maxHeight: '400px' }} 
                    />
                </Box>
            )}
            <Typography sx={{whiteSpace: 'pre-wrap'}}>{content.text}</Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default PersonalizedEducationModule;