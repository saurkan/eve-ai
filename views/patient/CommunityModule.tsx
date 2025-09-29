import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAIHealthCoachTip } from '../../services/geminiService';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface CommunityModuleProps {
  onBack: () => void;
}

const CommunityModule: React.FC<CommunityModuleProps> = ({ onBack }) => {
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTip = async () => {
    setIsLoading(true);
    try {
      const dailyTip = await getAIHealthCoachTip();
      setTip(dailyTip);
    } catch (error) {
      console.error(error);
      setTip("Could not fetch a tip at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>Community & Education</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Connect with others, find resources, and get daily health tips from your AI coach.
      </Typography>

      <Card sx={{mb: 4}}>
        <CardContent>
            <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                <LightbulbIcon color="primary" sx={{mr: 1}}/> AI Health Coach
            </Typography>
            {isLoading ? <CircularProgress size={24} /> : <Alert severity="info">{tip}</Alert>}
             <Button onClick={fetchTip} disabled={isLoading} sx={{mt: 1}}>Get New Tip</Button>
        </CardContent>
      </Card>
      
      <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <GroupsIcon color="secondary" sx={{mr: 1}}/> Community Forums
      </Typography>
      <Typography color="text.secondary">
          Support groups and community discussions are coming soon.
      </Typography>

    </Paper>
  );
};

export default CommunityModule;