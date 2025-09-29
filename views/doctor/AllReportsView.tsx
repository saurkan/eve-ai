import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Box, Typography, Paper, CircularProgress, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Case } from '../../types';

type Order = 'asc' | 'desc';
type OrderBy = 'patientId' | 'createdAt' | 'healthDomain';

const AllReportsView: React.FC = () => {
  const allCases = useLiveQuery(() => db.cases.where('clinicalReport').notEqual('').toArray(), []);
  
  const [filter, setFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('createdAt');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedAndFilteredCases = useMemo(() => {
    if (!allCases) return [];

    let filtered = allCases.filter(c => c.patientId.toLowerCase().includes(filter.toLowerCase()));

    return filtered.sort((a, b) => {
      const isAsc = order === 'asc' ? 1 : -1;
      if (b[orderBy] < a[orderBy]) return -1 * isAsc;
      if (b[orderBy] > a[orderBy]) return 1 * isAsc;
      return 0;
    });
  }, [allCases, filter, order, orderBy]);

  if (!allCases) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading reports...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">All Generated Reports</Typography>
        <TextField
          size="small"
          placeholder="Search by Patient ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'patientId' ? order : false}>
                <TableSortLabel active={orderBy === 'patientId'} direction={orderBy === 'patientId' ? order : 'asc'} onClick={() => handleRequestSort('patientId')}>
                  Patient ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                <TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleRequestSort('createdAt')}>
                  Report Date
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'healthDomain' ? order : false}>
                <TableSortLabel active={orderBy === 'healthDomain'} direction={orderBy === 'healthDomain' ? order : 'asc'} onClick={() => handleRequestSort('healthDomain')}>
                  Health Domain
                </TableSortLabel>
              </TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndFilteredCases.length > 0 ? sortedAndFilteredCases.map((caseData) => (
              <TableRow key={caseData.id} hover>
                <TableCell>{caseData.patientId}</TableCell>
                <TableCell>{new Date(caseData.createdAt).toLocaleString()}</TableCell>
                <TableCell>{caseData.healthDomain}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => setSelectedReport(caseData.clinicalReport || null)}>
                    View Report
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">No reports found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedReport} onClose={() => setSelectedReport(null)} maxWidth="md" fullWidth>
        <DialogTitle>Clinical Report</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {selectedReport}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReport(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AllReportsView;
