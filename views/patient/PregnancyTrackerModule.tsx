import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, TextField, List, ListItem, ListItemText } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getPregnancyUpdate, editImageWithText } from '../../services/geminiService';
import { PregnancyUpdate } from '../../types';

interface PregnancyTrackerModuleProps {
  onBack: () => void;
}

const PregnancyTrackerModule: React.FC<PregnancyTrackerModuleProps> = ({ onBack }) => {
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [update, setUpdate] = useState<PregnancyUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for interactive editing
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerateUpdate = async () => {
    if (!dueDate) {
      setError("Please enter your estimated due date.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setUpdate(null);
    setEditedImageUrl(null);
    try {
      const result = await getPregnancyUpdate({ dueDate });
      setUpdate(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate an update. Please check the date and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageEdit = async () => {
    if (!editPrompt.trim() || !update?.imageUrl) return;

    setIsEditing(true);
    try {
        const result = await editImageWithText(update.imageUrl, 'image/jpeg', editPrompt);
        setEditedImageUrl(result.imageDataUrl);
    } catch (err) {
        console.error("Failed to edit image:", err);
        setError("Sorry, I couldn't edit the image right now.");
    } finally {
        setIsEditing(false);
    }
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>Pregnancy & Postpartum Tracker</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Enter your due date to get a weekly summary of your baby's development and personalized health recommendations.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, maxWidth: '400px' }}>
        <TextField
          fullWidth
          label="Estimated Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
          InputLabelProps={{ shrink: true }}
        />
        <Button 
          variant="contained" 
          onClick={handleGenerateUpdate}
          disabled={isLoading || !dueDate}
          sx={{ height: '56px' }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Get Weekly Update'}
        </Button>
      </Box>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {update && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your Update for Week {update.week}</Typography>
          <Paper variant="outlined" sx={{p: 2}}>
             {(editedImageUrl || update.imageUrl) && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img src={editedImageUrl || update.imageUrl} alt={`Fetus at week ${update.week}`} style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                <TextField 
                    fullWidth
                    size="small"
                    placeholder="Ask AI to highlight something, e.g., 'highlight the brain'"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    disabled={isEditing}
                />
                <Button onClick={handleImageEdit} disabled={isEditing || !editPrompt} variant="outlined">
                    {isEditing ? <CircularProgress size={24}/> : 'Update Image'}
                </Button>
            </Box>

            <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>Fetal Development</Typography>
            <Typography variant="body2" sx={{mb: 2}}>{update.fetal_development_summary}</Typography>
            
            <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>Common Symptoms This Week</Typography>
            <List dense>
                {update.common_symptoms.map((symptom:string, i:number) => <ListItem key={i}><ListItemText primary={`• ${symptom}`} /></ListItem>)}
            </List>
            
            <Typography variant="subtitle1" sx={{fontWeight: 'bold', mt: 1}}>Health Recommendations</Typography>
             <List dense>
                {update.health_recommendations.map((rec:string, i:number) => <ListItem key={i}><ListItemText primary={`• ${rec}`} /></ListItem>)}
            </List>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default PregnancyTrackerModule;