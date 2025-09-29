import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Box, Typography, Button, Paper, Alert, List, ListItem, ListItemText, Avatar, TextField, CircularProgress, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { ChatMessage } from '../../types';
import { startPatientReportChat, generateHealthTips } from '../../services/geminiService';

interface PatientReportViewerProps {
  caseId: string;
  onBack: () => void;
}

const PatientReportViewer: React.FC<PatientReportViewerProps> = ({ caseId, onBack }) => {
  const caseData = useLiveQuery(() => db.cases.get(caseId), [caseId]);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [healthTips, setHealthTips] = useState<string[] | null>(null);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !caseData?.patientReport) return;
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userInput,
      timestamp: new Date()
    };

    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);

    try {
        const responseText = await startPatientReportChat(caseData.patientReport, newConversation);
        const modelMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
        };
        setConversation(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
            timestamp: new Date()
        };
        setConversation(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateTips = async () => {
      if(!caseData?.patientReport) return;
      setIsLoading(true);
      const tips = await generateHealthTips(caseData.patientReport);
      setHealthTips(tips);
      setIsLoading(false);
  }

  if (!caseData) return <CircularProgress />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to My Reports
      </Button>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Your Report for {caseData.scanType}</Typography>
        <Typography variant="caption" display="block" color="text.secondary" sx={{mb: 2}}>
            Analyzed on {new Date(caseData.createdAt).toLocaleString()}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap', bgcolor: 'action.hover' }}>
            {caseData.patientReport || "Report details are not available."}
        </Paper>
      </Paper>

       <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Personalized Health Tips</Typography>
            <Button 
                variant="outlined"
                onClick={handleGenerateTips}
                startIcon={<TipsAndUpdatesIcon />}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24}/> : 'Generate Wellness Tips'}
            </Button>
            {healthTips && (
                <List sx={{mt: 2}}>
                    {healthTips.map((tip, i) => <ListItem key={i}><ListItemText primary={`• ${tip}`} /></ListItem>)}
                </List>
            )}
       </Paper>

      <Paper sx={{ p: 2, mt: 3, display: 'flex', flexDirection: 'column', height: '500px' }}>
          <Typography variant="h6" sx={{px:1, mb: 1}}>Ask a Question About Your Report</Typography>
           <Divider sx={{mb: 1}}/>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1 }}>
                <List>
                    {conversation.map((msg) => (
                        <ListItem key={msg.id}>
                            <Avatar sx={{ bgcolor: msg.role === 'model' ? 'primary.main' : 'secondary.main', mr: 2 }}>
                                {msg.role === 'model' ? <SmartToyIcon /> : <PersonIcon />}
                            </Avatar>
                            <ListItemText 
                                primary={msg.text} 
                                primaryTypographyProps={{ style: { whiteSpace: 'pre-wrap' } }}
                            />
                        </ListItem>
                    ))}
                    {isLoading && <ListItem><CircularProgress size={24} sx={{mx: 'auto'}} /></ListItem>}
                    <div ref={chatEndRef} />
                </List>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="e.g., 'What does benign mean?'"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    disabled={isLoading}
                />
                <Button variant="contained" onClick={handleSendMessage} disabled={isLoading}>Send</Button>
            </Box>
        </Paper>
    </Box>
  );
};

export default PatientReportViewer;