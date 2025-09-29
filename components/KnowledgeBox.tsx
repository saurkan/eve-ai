import React, { useState, useEffect } from 'react'; // Import useEffect
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
        'mode'?: string; // Add mode attribute
      };
      'nuclia-search-results': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'mode'?: string; // Add mode attribute
      };
    }
  }
}

interface KnowledgeBoxProps {
  domain: string;
  sx?: SxProps<Theme>;
}

const KnowledgeBox: React.FC<KnowledgeBoxProps> = ({ domain, sx }) => {
  const theme = useTheme();
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    const checkWidget = setTimeout(() => {
      if (window.customElements.get('nuclia-search-bar') && window.customElements.get('nuclia-search-results')) {
        setWidgetLoaded(true);
      } else {
        console.warn('Nuclia widget custom elements not found. Displaying fallback.');
      }
    }, 1000); // Check after 1 second

    return () => clearTimeout(checkWidget);
  }, []);

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', ...sx }}>
      <Typography variant="h6" gutterBottom>
        {domain} Knowledge Box
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        RAG Powered by Progress Nuclia
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        {widgetLoaded ? (
          <>
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
          </>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body1">
              Knowledge Box is currently unavailable. Please ensure you have an active internet connection and try again later.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default KnowledgeBox;