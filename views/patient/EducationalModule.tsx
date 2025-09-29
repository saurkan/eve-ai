import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEducationalContent, EducationalContent } from '../../services/geminiService';
import { HealthDomain } from '../../types';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface EducationalModuleProps {
  domain: HealthDomain;
  onBack: () => void;
}

const domainPrompts: Partial<Record<HealthDomain, string>> = {
    [HealthDomain.BONE_HEALTH]: "e.g., 'Show me some posture exercises'",
    [HealthDomain.MENTAL_HEALTH]: "e.g., 'Guide me through a 2-minute breathing exercise'",
    [HealthDomain.PREGNANCY]: "e.g., 'What does fetal development look like at 12 weeks?'",
    [HealthDomain.CERVICAL_HEALTH]: "e.g., 'Explain what a Pap smear is'",
    [HealthDomain.PREVENTIVE_HEALTH]: "e.g., 'Create a checklist for annual health screenings'",
}

const EducationalModule: React.FC<EducationalModuleProps> = ({ domain, onBack }) => {
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
      const result = await getEducationalContent(domain, query);
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
      <Typography variant="h5" gutterBottom>AI Health Guide: {domain}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Ask a question or describe what you'd like to learn about. Our AI will generate information and visuals to help you.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <TextField
          fullWidth
          label="What would you like to know?"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={domainPrompts[domain] || "e.g., 'Show me a diagram of...'"}
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
          {isLoading ? 'Generating...' : 'Get Info'}
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

export default EducationalModule;