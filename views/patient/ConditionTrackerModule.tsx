import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, Slider, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getConditionInsights } from '../../services/geminiService';

interface ConditionTrackerModuleProps {
  onBack: () => void;
}

const ConditionTrackerModule: React.FC<ConditionTrackerModuleProps> = ({ onBack }) => {
  const [painLevel, setPainLevel] = useState<number>(0);
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogSymptoms = async () => {
    setIsLoading(true);
    setError(null);
    setInsight(null);
    try {
      const result = await getConditionInsights({ painLevel, symptoms });
      setInsight(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't log your symptoms at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>Specialized Condition Tracker</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Log symptoms for chronic conditions like PCOS or Endometriosis to help identify patterns with AI assistance.
      </Typography>

      <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
        <Typography gutterBottom>Pain Level (0-10)</Typography>
        <Slider
          value={painLevel}
          onChange={(e, newValue) => setPainLevel(newValue as number)}
          aria-labelledby="pain-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={0}
          max={10}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Describe other symptoms or triggers"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          sx={{ my: 2 }}
          placeholder="e.g., 'Feeling bloated, pain is worse after eating sugar'"
          disabled={isLoading}
        />
      </Box>

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleLogSymptoms}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Log & Get Insight'}
        </Button>
      </Box>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {insight && (
        <Alert severity="info">{insight}</Alert>
      )}
    </Paper>
  );
};

export default ConditionTrackerModule;