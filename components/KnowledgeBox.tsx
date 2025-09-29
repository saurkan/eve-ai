import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

// Declare custom elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'nuclia-search-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'audit_metadata'?: string;
        'knowledgebox'?: string;
        'zone'?: string;
        'features'?: string;
        'rag_strategies'?: string;
        'feedback'?: string;
      };
      'nuclia-search-results': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface KnowledgeBoxProps {
  domain: string;
  sx?: SxProps<Theme>;
}

const KnowledgeBox: React.FC<KnowledgeBoxProps> = ({ domain, sx }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', ...sx }}>
      <Typography variant="h6" gutterBottom>
        {domain} Knowledge Box
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        RAG Powered by Progress Nuclia
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        {/* Nuclia Search Bar */}
        <nuclia-search-bar
          audit_metadata='{"config":"nuclia-standard","widget":"eve-ai"}'
          knowledgebox="9e6e99b5-7ab5-4124-b06b-4c0b03976c07"
          zone="aws-us-east-2-1"
          features="answers,rephrase,suggestions,autocompleteFromNERs,citations,hideResults"
          rag_strategies="neighbouring_paragraphs|2|2"
          mode="dark"
          feedback="none"
        ></nuclia-search-bar>
        {/* Nuclia Search Results */}
        <nuclia-search-results 
          mode="dark"
        ></nuclia-search-results>
      </Box>
    </Paper>
  );
};

export default KnowledgeBox;