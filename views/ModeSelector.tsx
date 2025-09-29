

import React, { useState } from 'react';
import { Typography, Box, Card, CardActionArea, CardContent, Button, IconButton } from '@mui/material';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppMode } from '../types';
import { Logo } from '../components/Logo';
import ApiKeyModal from '../components/ApiKeyModal';


interface ModeSelectorProps {
  onSelectMode: (mode: AppMode) => void;
  onBack: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode, onBack }) => {
  const [isApiModalOpen, setApiModalOpen] = useState(false);

  return (
    <Box 
        sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            p: 3,
        }}
    >
        <IconButton 
            aria-label="settings"
            sx={{ position: 'absolute', top: 16, right: 16 }}
            onClick={() => setApiModalOpen(true)}
        >
            <SettingsIcon />
        </IconButton>
        <Box sx={{ zIndex: 1 }}>
            <Logo size={80} />
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold',
                 background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                EVE AI
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}>
                Advanced clinical support meets personalized patient care. Select your role to begin.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, justifyContent: 'center' }}>
                <Card sx={{ 
                    transition: '0.3s', 
                    flex: 1,
                    maxWidth: 400,
                    borderRadius: 4,
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 10 },
                }}>
                    <CardActionArea onClick={() => onSelectMode('doctor')} sx={{ p: { xs: 3, sm: 5 } }}>
                    <MedicalInformationIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <CardContent>
                        <Typography gutterBottom variant="h4" component="div">
                        Clinician Mode
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                        AI-powered triage, analysis, and reporting tools for medical professionals.
                        </Typography>
                    </CardContent>
                    </CardActionArea>
                </Card>
                <Card sx={{ 
                    transition: '0.3s', 
                    flex: 1,
                    maxWidth: 400,
                    borderRadius: 4,
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 10 },
                }}>
                    <CardActionArea onClick={() => onSelectMode('patient')} sx={{ p: { xs: 3, sm: 5 } }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                    <CardContent>
                        <Typography gutterBottom variant="h4" component="div">
                        Patient Mode
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                        Simplified reports, educational guides, and personal health tracking.
                        </Typography>
                    </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
             <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ mt: 4, color: 'text.secondary' }}
            >
                Return to Home
            </Button>
        </Box>
        <ApiKeyModal 
            open={isApiModalOpen}
            onClose={() => setApiModalOpen(false)}
        />
    </Box>
  );
};

export default ModeSelector;
