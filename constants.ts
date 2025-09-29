import { CasePriority } from './types';
import { PaletteMode } from '@mui/material';

export const BI_RADS_CATEGORIES: { [key: number]: { name: string; description: string } } = {
  0: { name: 'Incomplete', description: 'Need additional imaging evaluation.' },
  1: { name: 'Negative', description: 'There is nothing to comment on.' },
  2: { name: 'Benign', description: 'A definite benign finding is present.' },
  3: { name: 'Probably Benign', description: 'A finding has a very high probability of being benign.' },
  4: { name: 'Suspicious', description: 'Finding is suspicious for malignancy.' },
  5: { name: 'Highly Suggestive of Malignancy', description: 'Finding has a high probability of being cancer.' },
  6: { name: 'Known Biopsy-Proven Malignancy', description: 'Malignancy proven by a prior biopsy.' },
};

export const PRIORITY_COLORS: { [key in CasePriority]: { [mode in PaletteMode]: { main: string; background: string; text: string; } } } = {
    [CasePriority.HIGH]: { 
        light: { main: '#d32f2f', background: '#ffebee', text: '#d32f2f' },
        dark: { main: '#f44336', background: 'rgba(244, 67, 54, 0.2)', text: '#ffcdd2' },
    },
    [CasePriority.MEDIUM]: { 
        light: { main: '#ffa000', background: '#fff8e1', text: '#ffa000' },
        dark: { main: '#ffc107', background: 'rgba(255, 193, 7, 0.2)', text: '#ffecb3' },
    },
    [CasePriority.LOW]: {
        light: { main: '#388e3c', background: '#e8f5e9', text: '#388e3c' },
        dark: { main: '#4caf50', background: 'rgba(76, 175, 80, 0.2)', text: '#c8e6c9' },
    },
};