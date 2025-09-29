import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Box, Typography, Card, CardContent, CardActionArea, Chip, CircularProgress, Paper, useTheme } from '@mui/material';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Case, CasePriority } from '../../types';
import { PRIORITY_COLORS } from '../../constants';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface DoctorDashboardProps {
  onSelectCase: (caseId: string) => void;
}

const CaseCard: React.FC<{ caseData: Case; onSelect: (id: string) => void }> = ({ caseData, onSelect }) => {
  const theme = useTheme();
  const priorityInfo = PRIORITY_COLORS[caseData.priority][theme.palette.mode];
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card elevation={2} sx={{ borderRadius: 2, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
        <CardActionArea onClick={() => onSelect(caseData.id)}>
          <Box sx={{ p: 2, borderTop: `4px solid ${priorityInfo.main}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {caseData.scanType}
                </Typography>
                 <Chip
                    label={caseData.priority}
                    size="small"
                    sx={{ backgroundColor: priorityInfo.background, color: priorityInfo.text, fontWeight: 'bold' }}
                />
            </Box>
            <Typography variant="h6" component="div" noWrap>
                Patient ID: {caseData.patientId}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                {new Date(caseData.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onSelectCase }) => {
  const cases = useLiveQuery(() => db.cases.orderBy('createdAt').reverse().toArray(), []);

  if (!cases) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading cases...</Typography>
      </Box>
    );
  }

  const sortedCases = [...cases].sort((a, b) => {
    const priorityOrder = { [CasePriority.HIGH]: 0, [CasePriority.MEDIUM]: 1, [CasePriority.LOW]: 2 };
    if(priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const gridData = sortedCases.map(caseData => ({
    ...caseData,
    priority: caseData.priority,
    createdAt: caseData.createdAt.toLocaleDateString(),
    riskScore: caseData.analysisResult?.risk_score || 0
  }));

  return (
    <Box>
      {sortedCases.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: 'transparent' }}>
            <Typography variant="h5" color="text.secondary">The triage queue is empty.</Typography>
            <Typography color="text.secondary">Upload a new scan to begin analysis.</Typography>
        </Paper>
      ) : (
        <Grid
          data={gridData}
          onRowClick={(e) => onSelectCase(e.dataItem.id)}
          style={{ height: '600px' }}
        >
          <GridColumn field="patientId" title="Patient ID" width="120px" />
          <GridColumn field="scanType" title="Scan Type" width="150px" />
          <GridColumn field="priority" title="Priority" width="100px" />
          <GridColumn field="riskScore" title="Risk Score" width="100px" />
          <GridColumn field="createdAt" title="Date" width="120px" />
        </Grid>
      )}
    </Box>
  );
};

export default DoctorDashboard;