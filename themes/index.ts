import { createTheme, ThemeOptions, PaletteColor } from '@mui/material/styles';

const baseGlassmorphismOptions: ThemeOptions = {
  typography: {
    fontFamily: '"JetBrains Mono", monospace',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 500, fontSize: '1rem' },
    button: {
        fontWeight: 600,
        fontSize: '0.6rem',
    }
  },
};

const darkPalette = {
    primary: { main: '#9575CD', light: '#B39DDB', dark: '#7E57C2' },
    secondary: { main: '#4DB6AC', light: '#80CBC4', dark: '#26A69A' },
    background: {
      default: 'transparent',
      paper: 'rgba(35, 35, 45, 0.65)',
    },
    text: { primary: '#E0E0E0', secondary: '#B0B0B0' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
    grey: {
        '50': '#fafafa',
        '100': '#f5f5f5',
        '200': '#eeeeee',
        '300': '#e0e0e0',
        '400': '#bdbdbd',
        '500': '#9e9e9e',
        '600': '#757575',
        '700': '#616161',
        '800': '#424242',
        '900': '#212121',
        'A100': '#d5d5d5',
        'A200': '#aaaaaa',
        'A400': '#303030',
        'A700': '#616161',
    },
};

const createGlassmorphismTheme = (): ThemeOptions => {
    const glassBorderStyle = `1px solid rgba(255, 255, 255, 0.2)`;

    return {
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    html: { height: '100%' },
                    body: {
                        fontSize: '0.75rem', // Global body font size
                        background: '#0b0b0f',
                        backgroundImage: 'radial-gradient(1200px 600px at 20% -10%, rgba(149,117,205,0.12) 0%, rgba(149,117,205,0) 60%), radial-gradient(1200px 600px at 110% 110%, rgba(77,182,172,0.10) 0%, rgba(77,182,172,0) 60%)',
                        color: darkPalette.text.primary,
                        minHeight: '100%',
                    },
                    '#root': { minHeight: '100%' },
                    '*': { scrollbarColor: '#3a3a46 #15151b' },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkPalette.background.paper,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)', // For Safari
                        border: glassBorderStyle,
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                        color: darkPalette.text.primary,
                        padding: '16px', // Added default padding
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'transparent', // Inherit from Paper
                        borderRadius: '16px',
                    }
                }
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkPalette.background.paper,
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderBottom: glassBorderStyle,
                        boxShadow: 'none',
                        color: darkPalette.text.primary,
                    }
                }
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: 'rgba(30, 30, 40, 0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRight: glassBorderStyle,
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
                        textTransform: 'none',
                        padding: '6px 12px', // Reduced padding
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        }
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: ({ ownerState, theme }) => {
                        const color = ownerState.color;
                        // Safely handle 'default' or undefined colors to prevent crashes
                        if (color && color !== 'default' && theme.palette[color]) {
                            return {
                                backgroundColor: (theme.palette[color] as PaletteColor).main + '33',
                                backdropFilter: 'blur(5px)',
                            };
                        }
                        return {
                            backgroundColor: theme.palette.grey[800] + 'CC',
                            backdropFilter: 'blur(5px)',
                        };
                    }
                }
            }
        }
    }
}

export const glassmorphismDarkTheme = createTheme({
  ...baseGlassmorphismOptions,
  palette: darkPalette,
  ...createGlassmorphismTheme(),
});