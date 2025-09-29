
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText } from '@mui/material';
import { initializeAi } from '../services/geminiService';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (open) {
      const storedKey = localStorage.getItem('gemini_api_key');
      setApiKey(storedKey || '');
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    initializeAi();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gemini API Key Settings</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please enter your Google Gemini API key. This will be stored securely in your browser's local storage and will not be sent to any server other than Google's.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Gemini API Key"
          type="password"
          fullWidth
          variant="outlined"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyModal;
