import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Paper sx={{ p: 3, m: 2, textAlign: 'center', backgroundColor: 'error.dark', color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1">
            We're sorry for the inconvenience. Please try refreshing the page.
          </Typography>
          {this.state.error && (
            <Box sx={{ mt: 2, textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2">Error Details:</Typography>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
              </Typography>
              {this.state.errorInfo && (
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 1 }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;