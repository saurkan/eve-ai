import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Alert, Grid, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { annotateScanAnatomy, editImageWithText } from '../../services/geminiService';
import { AnatomicalAnnotation, Finding } from '../../types';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/material/styles';
import { ImageViewer } from '../../components/ImageViewer';

const Input = styled('input')({
  display: 'none',
});

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const ScanAnnotatorModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [annotations, setAnnotations] = useState<AnatomicalAnnotation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for interactive editing
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponseText, setChatResponseText] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const url = await fileToDataUrl(selectedFile);
      setImageDataUrl(url);
      setAnnotations(null);
      setEditedImageUrl(null);
      setChatResponseText(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !imageDataUrl) {
      setError("Please upload a scan to annotate.");
      return;
    }

    setIsLoading(true);
    setAnnotations(null);
    setError(null);
    setEditedImageUrl(null);
    setChatResponseText(null);

    try {
      const result = await annotateScanAnatomy(imageDataUrl, file.type);
      setAnnotations(result);
    } catch (err) {
      console.error(err);
      setError("Annotation failed. Please ensure the image is a clear medical scan (e.g., X-ray) and try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
   const handleImageEdit = async () => {
    if (!chatPrompt.trim() || !imageDataUrl || !file) return;

    setIsChatLoading(true);
    setChatResponseText(null);
    try {
        const result = await editImageWithText(imageDataUrl, file.type, chatPrompt);
        setEditedImageUrl(result.imageDataUrl);
        setChatResponseText(result.text);
    } catch (err) {
        console.error("Failed to edit image:", err);
        setError("Sorry, I couldn't edit the image right now.");
    } finally {
        setIsChatLoading(false);
    }
  }


  const findingsForViewer: Finding[] = annotations && !editedImageUrl ? annotations.map((ann, i) => ({
    id: i.toString(),
    label: ann.label,
    description: ann.description,
    bounding_box: ann.bounding_box,
    confidence: 1.0 // Confidence is not applicable here, but the component needs it
  })) : [];

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Health Hub
      </Button>
      <Typography variant="h5" gutterBottom>Annotate My Scan</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Learn about your body. Upload a medical scan (like an X-ray) and our AI will identify and label the main anatomical structures. This is an educational tool, not a diagnostic one.
      </Typography>

        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                 <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mx: 'auto' }} />
                    <Typography color="text.secondary" sx={{ my: 2 }}>
                        {file ? `Selected: ${file.name}` : 'Select your scan image.'}
                    </Typography>
                    <label htmlFor="scan-upload">
                        <Input accept="image/*" id="scan-upload" type="file" onChange={handleFileChange} />
                        <Button variant="outlined" component="span">
                            {file ? 'Change Scan' : 'Select Scan'}
                        </Button>
                    </label>
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleAnalyze}
                    disabled={isLoading || !file}
                    fullWidth
                    sx={{height: '100%', minHeight: '100px'}}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Generate Anatomical Guide'}
                </Button>
            </Grid>
        </Grid>


      {error && <Alert severity="error" sx={{mt: 3}}>{error}</Alert>}

      {(annotations || editedImageUrl) && imageDataUrl && (
          <Box sx={{mt: 3}}>
            <Typography variant="h6" gutterBottom>Your Annotated Scan</Typography>
            <Typography color="text.secondary" variant="body2" sx={{mb: 1}}>
                {editedImageUrl ? "Here is your edited scan." : "Hover over the colored boxes to see what each part is."}
            </Typography>
            <Box sx={{height: '600px', width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider'}}>
                <ImageViewer imageUrl={editedImageUrl || imageDataUrl} findings={findingsForViewer} />
            </Box>
            <Box sx={{mt: 2}}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Interactive Learning</Typography>
                {chatResponseText && <Alert severity="info" sx={{mb: 1}}>{chatResponseText}</Alert>}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                        fullWidth
                        size="small"
                        placeholder="Ask the AI to edit the image, e.g. 'Color the rib cage blue'"
                        value={chatPrompt}
                        onChange={(e) => setChatPrompt(e.target.value)}
                        disabled={isChatLoading}
                    />
                    <Button onClick={handleImageEdit} disabled={isChatLoading || !chatPrompt} variant="contained">
                        {isChatLoading ? <CircularProgress size={24}/> : 'Edit Image'}
                    </Button>
                </Box>
            </Box>
          </Box>
      )}
    </Paper>
  );
};

export default ScanAnnotatorModule;