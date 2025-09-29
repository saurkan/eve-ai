import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, Slider, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getWellnessSummary } from '../../services/geminiService';

interface WellnessTrackerModuleProps {
  onBack: () => void;
}

const WellnessTrackerModule: React.FC<WellnessTrackerModuleProps> = ({ onBack }) => {
  const [mood, setMood] = useState<number>(3);
  const [sleep, setSleep] = useState<string>('8');
  const [hydration, setHydration] = useState<string>('8');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const sleepHours = parseFloat(sleep) || 0;
      const hydrationGlasses = parseInt(hydration) || 0;
      const result = await getWellnessSummary({ mood, sleep: sleepHours, hydration: hydrationGlasses });
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate a summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>Daily Wellness Tracker</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Log your daily wellness metrics to identify patterns and get encouraging feedback from your AI assistant.
      </Typography>

      <Box sx={{ maxWidth: '500px', mx: 'auto' }}>
        <Typography gutterBottom>Today's Mood (1-5)</Typography>
        <Slider
          value={mood}
          onChange={(e, newValue) => setMood(newValue as number)}
          aria-labelledby="mood-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={5}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          label="Hours of Sleep"
          type="number"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          sx={{ my: 2 }}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          label="Glasses of Water"
          type="number"
          value={hydration}
          onChange={(e) => setHydration(e.target.value)}
          disabled={isLoading}
        />
      </Box>

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleGetSummary}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Get AI Summary'}
        </Button>
      </Box>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {summary && (
        <Alert severity="success">{summary}</Alert>
      )}
    </Paper>
  );
};

export default WellnessTrackerModule;