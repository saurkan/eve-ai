import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, TextField, List, ListItem, ListItemText, ListItemIcon, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { analyzeJournalEntry } from '../../services/geminiService';
import { JournalAnalysis } from '../../types';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface MentalWellnessModuleProps {
  onBack: () => void;
}

const MentalWellnessModule: React.FC<MentalWellnessModuleProps> = ({ onBack }) => {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetInsights = async () => {
    if (!entry.trim()) {
      setError("Please write something in your journal first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeJournalEntry(entry);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't analyze your entry at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentChip = (sentiment: string) => {
    const lowerSentiment = sentiment.toLowerCase();
    let color: "success" | "warning" | "error" | "info" | "default" = "default";
    if (lowerSentiment.includes('positive')) color = 'success';
    if (lowerSentiment.includes('negative')) color = 'error';
    if (lowerSentiment.includes('mixed')) color = 'warning';
    if (lowerSentiment.includes('neutral')) color = 'info';
    return <Chip label={sentiment} color={color} size="small" />;
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>Mental Wellness Journal</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Write down your thoughts and feelings. When you're ready, ask your AI assistant for a moment of reflection.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={8}
        label="Today's Journal Entry..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="How are you feeling today?"
        disabled={isLoading}
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ textAlign: 'center' }}>
        <Button 
            variant="contained" 
            size="large"
            onClick={handleGetInsights}
            disabled={isLoading || !entry}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Get AI Reflection'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
      
      {analysis && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your AI-Powered Reflection</Typography>
          <Paper variant="outlined" sx={{p: 2}}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Sentiment" 
                  secondary={getSentimentChip(analysis.sentiment)} 
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText primary="Summary" secondary={analysis.summary} />
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{alignItems: 'flex-start'}}>
                <ListItemIcon sx={{mt:1}}><LightbulbIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Suggestions for Reflection" 
                  secondary={
                    <Box component="ul" sx={{pl: 2, m: 0}}>
                        {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </Box>
                  } 
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default MentalWellnessModule;