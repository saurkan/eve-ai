import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Upload } from '@progress/kendo-react-upload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { HealthDomain, ScanType } from '../types';

const Input = styled('input')({
  display: 'none',
});

const HealthDomainScanTypes: Record<HealthDomain, ScanType[]> = {
    [HealthDomain.BREAST_CANCER_ANALYSIS]: [ScanType.BREAST_IMAGE],
    [HealthDomain.DENTAL_ORTHODONTICS]: [ScanType.CEPHALOMETRIC_XRAY],
    [HealthDomain.BREAST_HEALTH]: [ScanType.MAMMOGRAM, ScanType.ULTRASOUND, ScanType.MRI],
    [HealthDomain.SKIN_HEALTH]: [ScanType.SKIN_PHOTO],
    [HealthDomain.CARDIOVASCULAR]: [ScanType.ECG],
    [HealthDomain.BONE_HEALTH]: [ScanType.DEXA_SCAN],
    [HealthDomain.REPRODUCTIVE_HEALTH]: [ScanType.ULTRASOUND],
    [HealthDomain.PREGNANCY]: [ScanType.ULTRASOUND],
    [HealthDomain.NUTRITION]: [ScanType.MEAL_PHOTO],
    [HealthDomain.MENTAL_HEALTH]: [],
    [HealthDomain.CERVICAL_HEALTH]: [ScanType.PAP_SMEAR],
    [HealthDomain.PREVENTIVE_HEALTH]: [],
};

// Dynamically generate the list of domains that have scannable types.
const uploadableDomains = Object.entries(HealthDomainScanTypes)
    .filter(([, scanTypes]) => scanTypes.length > 0)
    .map(([domain]) => domain as HealthDomain);


interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, domain: HealthDomain, scanType: ScanType) => void;
  isProcessing: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState<HealthDomain>(HealthDomain.BREAST_CANCER_ANALYSIS);
  const [scanType, setScanType] = useState<ScanType>(ScanType.BREAST_IMAGE);
  const [error, setError] = useState('');

  const availableScanTypes = useMemo(() => HealthDomainScanTypes[domain] || [], [domain]);

  const handleDomainChange = (event: any) => {
    const newDomain = event.target.value as HealthDomain;
    setDomain(newDomain);
    const newScanTypes = HealthDomainScanTypes[newDomain];
    setScanType(newScanTypes.length > 0 ? newScanTypes[0] : ScanType.MAMMOGRAM); // fallback
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError('');
    }
  };
  
  const handleUpload = () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!scanType) {
        setError('Please select a scan type.');
        return;
    }
    onUpload(file, domain, scanType);
  };

  const handleClose = () => {
      if(isProcessing) return;
      setFile(null);
      setError('');
      setDomain(HealthDomain.BREAST_CANCER_ANALYSIS);
      setScanType(ScanType.BREAST_IMAGE);
      onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Upload New Scan</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Health Domain</Typography>
          <DropDownList
            data={uploadableDomains}
            value={domain}
            onChange={handleDomainChange}
            style={{ width: '100%' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Scan Type</Typography>
          <DropDownList
            data={availableScanTypes}
            value={scanType}
            onChange={(e) => setScanType(e.target.value as ScanType)}
            disabled={availableScanTypes.length === 0}
            style={{ width: '100%' }}
          />
        </Box>

        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
          <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop a file here, or click to select a file.
          </Typography>
          <Upload
            batch={false}
            multiple={false}
            files={[]}
            onAdd={(e) => {
              if (e.newState && e.newState.length > 0) {
                setFile(e.newState[0].getRawFile());
              }
            }}
            onRemove={() => setFile(null)}
            accept="image/*,.dcm"
            showFileList={false}
          />
          {file && <Typography sx={{ mt: 2, fontWeight: 'medium' }}>Selected: {file.name}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isProcessing}>Cancel</Button>
        <Button themeColor="primary" onClick={handleUpload} disabled={!file || isProcessing}>
          {isProcessing ? 'Processing...' : 'Upload & Analyze'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;