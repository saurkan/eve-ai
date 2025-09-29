import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { glassmorphismDarkTheme } from './themes';
import DoctorView from './views/DoctorView';
import PatientView from './views/PatientView';
import ModeSelector from './views/ModeSelector';
import LandingPage from './views/LandingPage';
import UploadModal from './components/UploadModal';
import { AppMode, HealthDomain, ScanType } from './types';
import { useCaseProcessor } from './hooks/useCaseProcessor';

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('landing');
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    
    // Theme is now fixed to dark mode.
    const { isProcessing, processNewCase } = useCaseProcessor();

    const activeTheme = glassmorphismDarkTheme;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleUploadRequest = () => {
        setUploadModalOpen(true);
    };

    const handleFileUpload = async (file: File, domain: HealthDomain, scanType: ScanType) => {
        setUploadModalOpen(false);
        await processNewCase(file, domain, scanType);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress />
                    <Typography variant="h6" mt={2}>Loading EVE AI</Typography>
                </Box>
            );
        }

        switch (mode) {
            case 'landing':
                return <LandingPage onEnter={() => setMode('selection')} />;
            case 'doctor':
                return <DoctorView onUploadClick={handleUploadRequest} onSwitchMode={() => setMode('selection')} />;
            case 'patient':
                return <PatientView onUploadClick={handleUploadRequest} onSwitchMode={() => setMode('selection')} />;
            case 'selection':
            default:
                return <ModeSelector onSelectMode={setMode} onBack={() => setMode('landing')} />;
        }
    };

    return (
        <ThemeProvider theme={activeTheme}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh', // Ensure it takes full viewport height to center content
                    backgroundColor: activeTheme.palette.background.paper, // Use theme background
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '1400px', // Max width for the application
                        height: '95vh', // Max height for the application
                        maxHeight: '900px', // Max height for the application
                        borderRadius: 4,
                        overflow: 'hidden', // Hide overflow if content exceeds bounds
                        boxShadow: 24, // Add some shadow for visual separation
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {renderContent()}
                </Box>
            </Box>
            <UploadModal 
                open={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUpload={handleFileUpload}
                isProcessing={isProcessing}
            />
        </ThemeProvider>
    );
};

export default App;