import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { ListView } from '@progress/kendo-react-listview';
import { Tooltip } from '@progress/kendo-react-tooltip';
import { getResearchAnswer } from '../../services/geminiService';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const Research: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<Message[]>([]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMessage: Message = { sender: 'user', text: query };
        setConversation(prev => [...prev, userMessage]);
        setIsLoading(true);
        setQuery('');

        try {
            const answer = await getResearchAnswer(query);
            const aiMessage: Message = { sender: 'ai', text: answer };
            setConversation(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { sender: 'ai', text: "I'm sorry, I encountered an error while fetching the research. Please try again." };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
            <Typography variant="h5" gutterBottom sx={{ px: 1 }}>AI Research Assistant</Typography>
            <Typography color="text.secondary" sx={{ px: 1, mb: 2 }}>
                Ask clinical questions, get summaries of latest research, or explore treatment guidelines.
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1 }}>
                <ListView
                    data={conversation.map((msg, index) => ({
                        id: index,
                        sender: msg.sender,
                        text: msg.text,
                        avatar: msg.sender === 'ai' ? <SmartToyIcon /> : <PersonIcon />
                    }))}
                    item={({ dataItem }) => (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Avatar sx={{ bgcolor: dataItem.sender === 'ai' ? 'primary.main' : 'secondary.main', mr: 2 }}>
                                {dataItem.avatar}
                            </Avatar>
                            <Typography sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                                {dataItem.text}
                            </Typography>
                        </Box>
                    )}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Input
                    style={{ flex: 1 }}
                    placeholder="e.g., 'Latest treatment guidelines for triple-negative breast cancer...'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                />
                <Tooltip content="Send your research question">
                    <Button themeColor="primary" onClick={handleSend} disabled={isLoading}>
                        Send
                    </Button>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default Research;