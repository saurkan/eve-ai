
import React from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import GppGoodIcon from '@mui/icons-material/GppGood';
import BiotechIcon from '@mui/icons-material/Biotech';
import { Logo } from '../components/Logo';

interface LandingPageProps {
  onEnter: () => void;
}


const FeatureListItem: React.FC<{ icon: React.ReactElement, primary: string, secondary: string }> = ({ icon, primary, secondary }) => (
    <ListItem dense>
        <ListItemIcon sx={{minWidth: 40}}>{React.cloneElement(icon as any, { color: 'primary' })}</ListItemIcon>
        <ListItemText primary={primary} secondary={secondary} primaryTypographyProps={{ fontWeight: 'medium' }} />
    </ListItem>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2 
        }}>
            <Paper elevation={4} sx={{
                width: '100%',
                maxWidth: '1200px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' }
            }}>
                <Box sx={{
                    width: { xs: '100%', md: '45%' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: { xs: 4, md: 6 },
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText'
                }}>
                    <Logo size={120} />
                    <Typography variant="h2" sx={{ fontWeight: 'bold', mt: 2, color: 'white' }}>EVE AI</Typography>
                    <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.85)' }}>
                        Clinical AI for Women’s Health — Imaging, Insights, and Education
                    </Typography>
                    <Button 
                        variant="contained" 
                        sx={{ 
                            py: 1.5,
                            px: 5,
                            borderRadius: '12px'
                        }} 
                        size="large" 
                        onClick={onEnter}
                    >
                        Enter Application
                    </Button>
                </Box>
                <Box sx={{
                    width: { xs: '100%', md: '55%' },
                    p: { xs: 3, md: 5 },
                    overflowY: 'auto'
                }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>What this application does</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                        EVE AI helps clinicians analyze breast scans and generate reports, and empowers patients with clear explanations. It includes a RAG-based Knowledge Box for breast cancer questions, powered by Progress Nuclia, and Gemini-backed analysis tools.
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>Core capabilities</Typography>
                    <List dense>
                        <FeatureListItem icon={<FindInPageIcon/>} primary="Breast scan analysis" secondary="Highlights suspicious regions, BI-RADS, and clinical summaries." />
                        <FeatureListItem icon={<AnalyticsIcon/>} primary="Case triage dashboard" secondary="Sorts by risk and recency for fast prioritization." />
                        <FeatureListItem icon={<BiotechIcon/>} primary="RAG Knowledge Box (Nuclia)" secondary="Ask breast cancer questions with grounded citations and context." />
                        <FeatureListItem icon={<NoteAddIcon/>} primary="Draft reports" secondary="One‑click clinical and patient‑friendly summaries." />
                    </List>
                   
                    <Divider sx={{ my: 2.5 }} />
                    
                    <Typography variant="h6" sx={{ mb: 1.5 }}>Powered by</Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2}}>
                        <Chip icon={<BiotechIcon />} label="Progress Nuclia RAG" color="primary" variant="outlined" size="small" />
                        <Chip icon={<AnalyticsIcon />} label="Google Gemini (analysis & reporting)" color="primary" variant="outlined" size="small" />
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1.5 }}>Trust & Compliance</Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                        <Chip icon={<VerifiedUserIcon />} label="HIPAA Compliant" color="success" variant="outlined" size="small" />
                        <Chip icon={<SecurityIcon />} label="SOC 2 Type II" color="success" variant="outlined" size="small" />
                        <Chip icon={<GppGoodIcon />} label="FDA 21 CFR Part 11 Ready" color="success" variant="outlined" size="small" />
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default LandingPage;