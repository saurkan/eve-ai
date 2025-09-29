import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, TextField, List, ListItem, ListItemText, Avatar, Alert, Card, CardContent, CardMedia } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { startHealthPlanChat } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const HealthPlanModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [goal, setGoal] = useState('');
    const [isGoalSet, setIsGoalSet] = useState(false);
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const handleStartPlan = () => {
        if (!goal.trim()) return;
        setIsGoalSet(true);
        const firstMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: `Great! Let's build a health plan around your goal: "${goal}". What's the first step you'd like to discuss?`,
            timestamp: new Date(),
        };
        setConversation([firstMessage]);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

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
            const modelMessage = await startHealthPlanChat(newConversation, goal);
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

    return (
        <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
            <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
                    Back to Health Hub
                </Button>
                <Typography variant="h5" gutterBottom>My AI Health Plan</Typography>
            </Box>

            {!isGoalSet ? (
                <Box sx={{ my: 'auto', textAlign: 'center' }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        What is one health goal you'd like to focus on?
                    </Typography>
                    <TextField
                        fullWidth
                        label="Your Health Goal"
                        variant="outlined"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., 'Improve my sleep quality' or 'Have more energy during the day'"
                        sx={{ maxWidth: '600px', mb: 2 }}
                    />
                    <Button variant="contained" size="large" onClick={handleStartPlan} disabled={!goal.trim()}>
                        Start My Plan
                    </Button>
                </Box>
            ) : (
                <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>Your Goal:</strong> {goal}
                    </Alert>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1 }}>
                        <List>
                            {conversation.map((msg) => (
                                <ListItem key={msg.id}>
                                    <Avatar sx={{ bgcolor: msg.role === 'model' ? 'primary.main' : 'secondary.main', mr: 2 }}>
                                        {msg.role === 'model' ? <SmartToyIcon /> : <PersonIcon />}
                                    </Avatar>
                                    <Card sx={{width: '100%'}}>
                                        <CardContent>
                                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                                        </CardContent>
                                        {msg.imageUrl && (
                                            <CardMedia
                                                component="img"
                                                image={msg.imageUrl}
                                                alt="AI generated visual"
                                                sx={{ maxHeight: 300, objectFit: 'contain', p:1 }}
                                            />
                                        )}
                                    </Card>
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
                            placeholder="Ask your AI coach a question..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                            disabled={isLoading}
                        />
                        <Button variant="contained" onClick={handleSendMessage} disabled={isLoading}>Send</Button>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default HealthPlanModule;
