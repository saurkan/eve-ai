import React from 'react';
import { Box, Button, Typography, Paper, Slider, Divider, List, ListItem, ListItemText, CircularProgress, Alert, Chip, TextareaAutosize, useTheme, Grid } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArticleIcon from '@mui/icons-material/Article';
import { BreastAnalysisResult } from '../types';
import { BI_RADS_CATEGORIES } from '../constants';

interface BreastControlsProps {
  files: { left?: File | null; right?: File | null; };
  onImagesUpload: (left?: File, right?: File) => void;
  onRunAnalysis: () => void;
  onGenerateReport: () => void;
  analysisResult: BreastAnalysisResult | null;
  generatedReport: string | null;
  isLoading: boolean;
  error: string | null;
  sx?: SxProps<Theme>;
}

const BreastControls: React.FC<BreastControlsProps> = ({
  files,
  onImagesUpload,
  onRunAnalysis,
  onGenerateReport,
  analysisResult,
  generatedReport,
  isLoading,
  error,
  sx,
}) => {
  const theme = useTheme();

  const handleFileChange = (side: 'left' | 'right', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (side === 'left') onImagesUpload(file, files.right || undefined);
      if (side === 'right') onImagesUpload(files.left || undefined, file);
    }
  };
  
  const biRadsInfo = analysisResult ? BI_RADS_CATEGORIES[analysisResult.bi_rads_score] : null;

  return (
    <Paper sx={{ p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', ...sx }}>
      <Typography variant="h6" gutterBottom>Controls & Reporting</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2} sx={{mb: 2}}>
        <Grid item xs={6}>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} fullWidth size="small">
                {files.left ? files.left.name.substring(0,10)+'...' : 'Upload Left'}
                <input type="file" hidden accept="image/png, image/jpeg" onChange={(e) => handleFileChange('left', e)} />
            </Button>
        </Grid>
        <Grid item xs={6}>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} fullWidth size="small">
                {files.right ? files.right.name.substring(0,10)+'...' : 'Upload Right'}
                <input type="file" hidden accept="image/png, image/jpeg" onChange={(e) => handleFileChange('right', e)} />
            </Button>
        </Grid>
      </Grid>

      <Button
        onClick={onRunAnalysis}
        variant="contained"
        fullWidth
        startIcon={isLoading ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
        disabled={isLoading || (!files.left && !files.right)}
        sx={{mb: 2}}
      >
        Run AI Analysis
      </Button>

      {error && <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>}

      {analysisResult && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>AI Analysis Summary</Typography>
          <Chip label={`BI-RADS: ${analysisResult.bi_rads_score} - ${biRadsInfo?.name}`} color={analysisResult.bi_rads_score >= 4 ? 'error' : 'success'} sx={{mb: 1}}/>
          <Typography variant="body2" sx={{mb: 1}}>{analysisResult.clinical_summary}</Typography>
          <List dense sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {analysisResult.findings.map(f => (
                <ListItem key={f.id} sx={{bgcolor: f.malignancy_probability > 0.75 ? theme.palette.error.light : theme.palette.warning.light}}>
                    <ListItemText 
                        primary={`${f.label} - Malignancy Prob: ${(f.malignancy_probability * 100).toFixed(0)}%`}
                        secondary={f.description}
                    />
                </ListItem>
            ))}
          </List>

           <Button
                onClick={onGenerateReport}
                variant="outlined"
                fullWidth
                startIcon={isLoading ? <CircularProgress size={20} /> : <ArticleIcon />}
                disabled={isLoading || !!generatedReport}
                sx={{mt: 2}}
            >
                { generatedReport ? 'Report Generated' : 'Auto-Generate Report' }
            </Button>
        </>
      )}

      {generatedReport && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Generated Report</Typography>
            <TextareaAutosize 
                minRows={10} 
                defaultValue={generatedReport || ''} 
                style={{width: '100%', fontFamily: 'monospace', fontSize: '0.9rem', padding: '8px', background: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: '4px'}}
            />
            <Button variant="contained" sx={{mt: 1}}>Save to Patient Record</Button>
          </>
      )}
    </Paper>
  );
};

export default BreastControls;