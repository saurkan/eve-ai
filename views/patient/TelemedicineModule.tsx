import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, TextField, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { runSymptomChecker } from '../../services/geminiService';
import { SymptomCheckerResult } from '../../types';

interface TelemedicineModuleProps {
  onBack: () => void;
}

const TelemedicineModule: React.FC<TelemedicineModuleProps> = ({ onBack }) => {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysisResult = await runSymptomChecker(symptoms);
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't analyze your symptoms at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

    const getLikelihoodColor = (likelihood: 'High' | 'Medium' | 'Low') => {
      if (likelihood === 'High') return 'error';
      if (likelihood === 'Medium') return 'warning';
      return 'success';
    }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>AI Symptom Checker</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Describe your symptoms in plain language for a preliminary AI analysis. This tool provides information, not a diagnosis.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Describe your symptoms for a preliminary analysis..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="e.g., 'I have a headache, a sore throat, and I've been feeling tired for two days.'"
        disabled={isLoading}
        sx={{ mb: 2 }}
      />
      <Box sx={{ textAlign: 'center' }}>
        <Button 
            variant="contained" 
            size="large"
            onClick={handleAnalyzeSymptoms}
            disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Analyze My Symptoms'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
      
      {result && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Disclaimer:</strong> {result.disclaimer}
          </Alert>
          <Typography variant="h6" sx={{ mb: 2 }}>Preliminary Analysis</Typography>
          <Paper variant="outlined" sx={{p: 2}}>
            <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>Possible Conditions</Typography>
            <List>
                {result.possible_conditions.map((cond, i) => (
                    <ListItem key={i} secondaryAction={<Chip label={cond.likelihood} color={getLikelihoodColor(cond.likelihood)} />}>
                        <ListItemText primary={cond.name} />
                    </ListItem>
                ))}
            </List>
            <Typography variant="subtitle1" sx={{fontWeight: 'bold', mt: 2}}>Suggested Next Steps</Typography>
            <List>
                {result.suggested_next_steps.map((step, i) => <ListItem key={i}><ListItemText primary={`• ${step}`} /></ListItem>)}
            </List>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default TelemedicineModule;