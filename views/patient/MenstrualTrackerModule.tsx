import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, TextField, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getMenstrualInsights } from '../../services/geminiService';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpaIcon from '@mui/icons-material/Spa';

interface MenstrualTrackerModuleProps {
  onBack: () => void;
}

const MenstrualTrackerModule: React.FC<MenstrualTrackerModuleProps> = ({ onBack }) => {
  const [cycleDay, setCycleDay] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetInsights = async () => {
    const day = parseInt(cycleDay);
    if (isNaN(day) || day < 1 || day > 60) {
      setError("Please enter a valid cycle day (e.g., 1-60).");
      return;
    }
    if (!symptoms.trim()) {
      setError("Please describe any symptoms you're experiencing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setInsights(null);
    try {
      const result = await getMenstrualInsights({ cycleDay: day, symptoms });
      setInsights(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate insights at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>Menstrual & Reproductive Health</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Enter your current cycle day and any symptoms to get AI-powered, educational insights. This tool is for informational purposes and is not medical advice.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Current Cycle Day"
            type="number"
            value={cycleDay}
            onChange={(e) => setCycleDay(e.target.value)}
            placeholder="e.g., 14"
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Describe your symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., mild cramping, feeling tired"
            disabled={isLoading}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ textAlign: 'center', my: 2 }}>
        <Button 
            variant="contained" 
            size="large"
            onClick={handleGetInsights}
            disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Get AI Insights'}
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
      
      {insights && (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Your AI-Powered Insights</Typography>
            <Paper variant="outlined" sx={{p: 2}}>
                <List>
                    <ListItem>
                        <ListItemIcon><InsightsIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="Likely Cycle Phase" secondary={insights.cycle_phase} />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><InsightsIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="Fertility Prediction" secondary={insights.fertile_window_prediction} />
                    </ListItem>
                    <ListItem sx={{alignItems: 'flex-start'}}>
                        <ListItemIcon><PsychologyIcon color="secondary" sx={{mt:1}} /></ListItemIcon>
                        <ListItemText 
                            primary="Symptom Explanations" 
                            secondary={
                                <Box component="div" sx={{pl: 0, m: 0}}>
                                    {insights.symptom_explanations.map((exp:string, i:number) => <Typography key={i} variant="body2">{exp}</Typography>)}
                                </Box>
                            } 
                        />
                    </ListItem>
                     <ListItem sx={{alignItems: 'flex-start'}}>
                        <ListItemIcon><SpaIcon color="secondary" sx={{mt:1}} /></ListItemIcon>
                        <ListItemText 
                            primary="Wellness Tips" 
                             secondary={
                                <Box component="div" sx={{pl: 0, m: 0}}>
                                    {insights.wellness_tips.map((tip:string, i:number) => <Typography key={i} variant="body2">{tip}</Typography>)}
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

export default MenstrualTrackerModule;