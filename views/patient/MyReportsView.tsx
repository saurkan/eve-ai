import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, CircularProgress, Button, Chip, useTheme } from '@mui/material';
import { Case, CaseStatus } from '../../types';
import { PatientViewType } from '../Layout';
import { PRIORITY_COLORS } from '../../constants';

interface MyReportsViewProps {
  onSelectCase: (caseId: string) => void; 
}

const ReportListItem: React.FC<{ caseData: Case; onView: () => void }> = ({ caseData, onView }) => {
    const theme = useTheme();
    const isReady = caseData.status === CaseStatus.REVIEW_PENDING || caseData.status === CaseStatus.REVIEW_COMPLETED;
    const priorityInfo = PRIORITY_COLORS[caseData.priority][theme.palette.mode];
    
    return (
         <ListItem
            alignItems="center"
            secondaryAction={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                     {isReady ? 
                        <Chip 
                            label={caseData.priority} 
                            size="small" 
                            sx={{ 
                                backgroundColor: priorityInfo.background, 
                                color: priorityInfo.text, 
                                fontWeight: 'bold'
                            }} 
                        /> :
                        <Chip 
                            label={caseData.status.replace(/_/g, ' ')} 
                            size="small" 
                            sx={{textTransform: 'capitalize'}} 
                        />
                     }
                    <Button variant="outlined" onClick={onView} disabled={!isReady}>
                        View Report
                    </Button>
                </Box>
            }
        >
            <ListItemText
                primary={`${caseData.healthDomain} - ${caseData.scanType}`}
                secondary={`Submitted on ${new Date(caseData.createdAt).toLocaleDateString()}`}
            />
        </ListItem>
    );
};


const MyReportsView: React.FC<MyReportsViewProps> = ({ onSelectCase }) => {
  const cases = useLiveQuery(() => db.cases.orderBy('createdAt').reverse().toArray(), []);

  if (!cases) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading your reports...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{px: 2, pt: 1}}>My Health Reports</Typography>
        {cases.length === 0 ? (
            <Typography color="text.secondary" sx={{p: 2}}>You have no reports yet. Your submitted analyses will appear here once they are ready.</Typography>
        ) : (
            <List>
                {cases.map((caseData, index) => (
                    <React.Fragment key={caseData.id}>
                        <ReportListItem caseData={caseData} onView={() => onSelectCase(caseData.id)} />
                        {index < cases.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
        )}
    </Paper>
  );
};

export default MyReportsView;