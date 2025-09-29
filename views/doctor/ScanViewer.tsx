import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { generateReports, generateDifferentialDiagnosis, generateLongitudinalSummary, draftClinicalNote, editImageWithText, getSecondOpinion } from '../../services/geminiService';
import { Box, Typography, Button, CircularProgress, Paper, Divider, Chip, Alert, ButtonGroup, useTheme, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, TextareaAutosize, DialogActions, TextField, Avatar, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { ImageViewer } from '../../components/ImageViewer';
import { BI_RADS_CATEGORIES, PRIORITY_COLORS } from '../../constants';
import { Case } from '../../types';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface ScanViewerProps {
  caseData: Case;
  onBack: () => void;
}

const DetailItem: React.FC<{ label: string, value: React.ReactNode}> = ({label, value}) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5}}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Box sx={{textAlign: 'right'}}>{value}</Box>
    </Box>
);

const ScanViewer: React.FC<ScanViewerProps> = ({ caseData, onBack }) => {
  const theme = useTheme();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [differentials, setDifferentials] = useState<string[] | null>(null);
  const [longitudinalSummary, setLongitudinalSummary] = useState<string | null>(null);
  const [clinicalNote, setClinicalNote] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<string | null>(null);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [secondOpinion, setSecondOpinion] = useState<string | null>(null);

  // State for interactive image editing
  const [interactiveImageUrl, setInteractiveImageUrl] = useState<string | null>(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);


  const patientHistory = useLiveQuery(() => 
    db.cases.where('patientId').equals(caseData.patientId).and(c => c.id !== caseData.id).reverse().sortBy('createdAt'),
    [caseData.patientId]
  );
  
  const handleGenerateReport = async () => {
    if (!caseData?.analysisResult) return;
    setIsGeneratingReport(true);
    try {
        const reports = await generateReports(caseData.analysisResult);
        await db.cases.update(caseData.id, {
            clinicalReport: reports.clinicalReport,
            patientReport: reports.patientReport,
        });
    } catch (error) { console.error("Failed to generate report:", error); } 
    finally { setIsGeneratingReport(false); }
  };
  
  const handleDecision = async (decision: 'Accepted' | 'Overridden') => {
      await db.cases.update(caseData.id, { clinicianDecision: decision });
  }

  const handleGetDifferentials = async () => {
      if(!caseData.analysisResult) return;
      setIsLoadingAI('diff');
      const result = await generateDifferentialDiagnosis(caseData.analysisResult);
      setDifferentials(result);
      setIsLoadingAI(null);
  }

  const handleGetLongitudinal = async (previousCase: Case) => {
      if(!caseData.analysisResult || !previousCase.analysisResult) return;
      setIsLoadingAI(`long-${previousCase.id}`);
      const result = await generateLongitudinalSummary(caseData, previousCase);
      setLongitudinalSummary(result);
      setIsLoadingAI(null);
  }

  const handleDraftNote = async () => {
      setIsLoadingAI('note');
      const result = await draftClinicalNote(caseData);
      setClinicalNote(result);
      setNoteModalOpen(true);
      setIsLoadingAI(null);
  }

  const handleGetSecondOpinion = async () => {
      if(!caseData || !caseData.analysisResult) return;
      setIsLoadingAI('second-opinion');
      setSecondOpinion(null); // Clear previous
      try {
        const result = await getSecondOpinion(caseData, caseData.analysisResult);
        setSecondOpinion(result);
      } catch (err) {
        console.error("Failed to get second opinion:", err);
        setSecondOpinion("An error occurred while getting the second opinion.");
      } finally {
        setIsLoadingAI(null);
      }
  }

  const handleSendChatMessage = async () => {
    if (!chatPrompt.trim()) return;
    
    const userMessage = { role: 'user' as const, text: chatPrompt };
    setChatHistory(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatPrompt('');

    try {
        const result = await editImageWithText(caseData.image.dataUrl, caseData.image.type, chatPrompt);
        setInteractiveImageUrl(result.imageDataUrl);
        const modelMessage = { role: 'model' as const, text: result.text || "Here is the edited image."};
        setChatHistory(prev => [...prev, modelMessage]);
    } catch(err) {
        console.error("Image editing failed", err);
        const errorMessage = { role: 'model' as const, text: "I'm sorry, I couldn't edit the image. Please try again."};
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  };


  const { status, analysisResult, image } = caseData;
  const priorityInfo = PRIORITY_COLORS[caseData.priority][theme.palette.mode];

  const renderContent = () => {
    if (status === 'PENDING_ANALYSIS') return <Alert severity="info" icon={<CircularProgress size={20} />}>AI analysis is in progress...</Alert>
    if (status === 'ANALYSIS_FAILED' || !analysisResult) return <Alert severity="error">AI analysis failed for this case.</Alert>
    
    const biRadsInfo = analysisResult.bi_rads !== undefined ? BI_RADS_CATEGORIES[analysisResult.bi_rads] : null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={7} lg={8}>
            <Box sx={{ 
                height: 'calc(100vh - 120px)', 
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)', 
                padding: '16px', 
                backgroundColor: '#212121', 
                borderRadius: 2,
                transition: 'background-color 0.3s'
            }}>
                <ImageViewer imageUrl={interactiveImageUrl || image.dataUrl} findings={interactiveImageUrl ? [] : (analysisResult.findings || [])} />
            </Box>
        </Grid>
        <Grid item xs={12} md={5} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', pb:2}}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>AI Analysis</Typography>
                <Divider sx={{ mb: 2 }}/>
                <DetailItem label="Priority" value={<Chip label={caseData.priority} size="small" sx={{ backgroundColor: priorityInfo.background, color: priorityInfo.text, fontWeight: 'bold' }} />} />
                <DetailItem label="Risk Score" value={`${analysisResult.risk_score.toFixed(1)}%`} />
                {biRadsInfo && <DetailItem label="BI-RADS" value={`${analysisResult.bi_rads} - ${biRadsInfo.name}`} />}
                <DetailItem label="AI Recommendation" value={analysisResult.recommendation} />
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'action.hover', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Clinical Summary</Typography>
                    <Typography variant="body2">{analysisResult.clinical_summary}</Typography>
                </Box>
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Interactive Analysis Chat</Typography>
                 <Box sx={{ height: 200, overflowY: 'auto', mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <List dense>
                        {chatHistory.map((msg, index) => (
                            <ListItem key={index}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: msg.role === 'model' ? 'primary.main' : 'secondary.main', mr: 1.5 }}>
                                    {msg.role === 'model' ? <SmartToyIcon fontSize="small"/> : <PersonIcon fontSize="small"/>}
                                </Avatar>
                                <ListItemText primary={msg.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="e.g., 'Circle the most suspicious mass...'"
                        value={chatPrompt}
                        onChange={(e) => setChatPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleSendChatMessage()}
                        disabled={isChatLoading}
                    />
                    <Button variant="contained" onClick={handleSendChatMessage} disabled={isChatLoading}>
                        {isChatLoading ? <CircularProgress size={24} /> : 'Send'}
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Clinical Tools</Typography>
                <Divider sx={{ mb: 2 }}/>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                    <Button onClick={handleGetDifferentials} variant="outlined" disabled={!!isLoadingAI}>
                        {isLoadingAI === 'diff' ? <CircularProgress size={24}/> : 'Suggest Differentials'}
                    </Button>
                    {differentials && <Alert severity="info" onClose={() => setDifferentials(null)}>Differentials: {differentials.join(', ')}</Alert>}

                    <Button onClick={handleDraftNote} variant="outlined" disabled={!!isLoadingAI}>
                        {isLoadingAI === 'note' ? <CircularProgress size={24}/> : 'Draft Note'}
                    </Button>
                    
                    <Button onClick={handleGetSecondOpinion} variant="outlined" disabled={!!isLoadingAI}>
                        {isLoadingAI === 'second-opinion' ? <CircularProgress size={24}/> : 'Get AI Second Opinion'}
                    </Button>
                    {secondOpinion && <Alert severity="success" sx={{whiteSpace: 'pre-wrap'}} onClose={() => setSecondOpinion(null)}>{secondOpinion}</Alert>}
                </Box>
            </Paper>

            {patientHistory && patientHistory.length > 0 && (
                 <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Patient History</Typography>
                    <List dense>
                        {patientHistory.slice(0, 3).map(pCase => (
                            <ListItem key={pCase.id} disableGutters secondaryAction={
                                <Button size="small" onClick={() => handleGetLongitudinal(pCase)} disabled={!!isLoadingAI}>
                                    {isLoadingAI === `long-${pCase.id}` ? <CircularProgress size={20}/> : 'Compare'}
                                </Button>
                            }>
                                <ListItemText primary={`${pCase.scanType} - ${pCase.healthDomain}`} secondary={new Date(pCase.createdAt).toLocaleDateString()} />
                            </ListItem>
                        ))}
                    </List>
                     {longitudinalSummary && <Alert severity="info" onClose={() => setLongitudinalSummary(null)} sx={{mt:1}}>{longitudinalSummary}</Alert>}
                </Paper>
            )}

             <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Reporting</Typography>
                <Divider sx={{ mb: 2 }}/>
                 {caseData.clinicalReport ? (
                     <Alert severity="success">Reports generated successfully.</Alert>
                 ) : (
                    <Button
                        variant="contained"
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isGeneratingReport ? 'Generating...' : 'Generate Reports'}
                    </Button>
                 )}
            </Paper>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Triage
      </Button>
      {renderContent()}
      <Dialog open={isNoteModalOpen} onClose={() => setNoteModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Draft Clinical Note</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{mb: 2}}>
                This AI-drafted note is a starting point. Please review, edit, and confirm its accuracy.
            </DialogContentText>
            <TextareaAutosize 
                minRows={15} 
                defaultValue={clinicalNote || ''} 
                style={{width: '100%', fontFamily: 'monospace', fontSize: '0.9rem', padding: '8px', background: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`}}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setNoteModalOpen(false)}>Close</Button>
            <Button onClick={() => setNoteModalOpen(false)} variant="contained">Save Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanViewer;