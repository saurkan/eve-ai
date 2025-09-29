
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Splitter, SplitterPane } from '@progress/kendo-react-layout';
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import BreastControls from '../../components/BreastControls';
import BreastCanvas from '../../components/BreastCanvas';
import KnowledgeBox from '../../components/KnowledgeBox';
import { BreastAnalysisResult } from '../../types';
import { analyzeBreastImage, generateBreastReport } from '../../services/geminiService';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


const BreastCancerAnalysisView: React.FC = () => {
  const [files, setFiles] = useState<{ left?: File; right?: File }>({});
  const [analysisResult, setAnalysisResult] = useState<BreastAnalysisResult | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState(1); // 1 for Knowledge Base tab

  // Create object URLs for display, and clean them up
  const displayImages = useMemo(() => {
    const urls: { left?: string; right?: string } = {};
    if (files.left) urls.left = URL.createObjectURL(files.left);
    if (files.right) urls.right = URL.createObjectURL(files.right);
    return urls;
  }, [files]);

  useEffect(() => {
      return () => {
          if (displayImages.left) URL.revokeObjectURL(displayImages.left);
          if (displayImages.right) URL.revokeObjectURL(displayImages.right);
      }
  }, [displayImages]);

  const handleImagesUpload = (leftFile?: File, rightFile?: File) => {
    setFiles({ left: leftFile, right: rightFile });
    setAnalysisResult(null);
    setGeneratedReport(null);
  };

  const handleRunAnalysis = async () => {
    const fileToAnalyze = files.left || files.right;
    if (!fileToAnalyze) {
      setError("Please upload at least one image to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const dataUrl = await fileToDataUrl(fileToAnalyze);
      const result = await analyzeBreastImage(dataUrl, fileToAnalyze.type);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysisResult) return;
    setIsLoading(true);
    setError(null);
    try {
      const report = await generateBreastReport(analysisResult, `P${Date.now()}`);
      setGeneratedReport(report);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 112px)' }}>
      <Splitter style={{ height: '100%' }}>
        <SplitterPane size="70%" min="400px">
          <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Object.keys(displayImages).length > 0 ? (
              <BreastCanvas
                images={displayImages}
                findings={analysisResult?.findings || []}
              />
            ) : (
              <Typography color="text.secondary">Upload breast image(s) to begin analysis.</Typography>
            )}
          </Paper>
        </SplitterPane>
        <SplitterPane size="30%" min="300px">
          <TabStrip 
            selected={selectedTab} 
            onSelect={(e) => setSelectedTab(e.selected)} 
            style={{
              height: '100%',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
            }}
          >
            <TabStripTab 
              title="Controls" 
              style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <Box sx={{ p: 2, height: '100%' }}>
                <BreastControls
                  files={files}
                  onImagesUpload={handleImagesUpload}
                  onRunAnalysis={handleRunAnalysis}
                  onGenerateReport={handleGenerateReport}
                  analysisResult={analysisResult}
                  generatedReport={generatedReport}
                  isLoading={isLoading}
                  error={error}
                />
                {isLoading && (
                  <Box sx={{ mt: 2 }}>
                    <ProgressBar value={50} />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Processing analysis...
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabStripTab>
            <TabStripTab 
              title="Knowledge Base" 
              style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <Box sx={{ height: '100%' }}>
                <KnowledgeBox 
                  domain="Breast Cancer" 
                  sx={{ height: '100%' }} 
                />
              </Box>
            </TabStripTab>
          </TabStrip>
        </SplitterPane>
      </Splitter>
    </Box>
  );
};

export default BreastCancerAnalysisView;
