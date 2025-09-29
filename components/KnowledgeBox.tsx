import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Avatar, useTheme } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { getKnowledgeAnswer } from '../services/geminiService';
import { ChatMessage } from '../types';

interface KnowledgeBoxProps {
  domain: string;
  sx?: SxProps<Theme>;
}

const KnowledgeBox: React.FC<KnowledgeBoxProps> = ({ domain, sx }) => {
  const theme = useTheme();
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);
  
  // Set initial welcome message
  useEffect(() => {
    setConversation([{
        id: crypto.randomUUID(),
        role: 'model',
        text: `Welcome to the ${domain} Knowledge Box. How can I help you today?`,
        timestamp: new Date()
    }])
  }, [domain]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userInput,
      timestamp: new Date(),
    };

    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);

    try {
      const responseText = await getKnowledgeAnswer(userInput, domain);
      const modelMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting to the knowledge base right now. Please try again later.",
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', ...sx }}>
      <Typography variant="h6" gutterBottom>
        {domain} Knowledge Box
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        RAG Powered by Progress Nuclia
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <List>
          {conversation.map((msg) => (
            <ListItem key={msg.id}>
              <Avatar sx={{ bgcolor: msg.role === 'model' ? theme.palette.primary.main : theme.palette.secondary.main, mr: 2, width: 32, height: 32 }}>
                {msg.role === 'model' ? <SmartToyIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
              </Avatar>
              <ListItemText
                primary={msg.text}
                primaryTypographyProps={{ style: { whiteSpace: 'pre-wrap', fontSize: '0.9rem' } }}
              />
            </ListItem>
          ))}
          {isLoading && <ListItem><CircularProgress size={24} sx={{ mx: 'auto' }} /></ListItem>}
          <div ref={chatEndRef} />
        </List>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          style={{ flex: 1 }}
          placeholder="Ask a question..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          disabled={isLoading}
        />
        <Button themeColor="primary" onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default KnowledgeBox;