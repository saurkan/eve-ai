import React from 'react';
import { AppBar, Toolbar, Box, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Logo } from './Logo';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Logo size={32} />
                    <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
                        EVE AI
                    </Typography>
                </Box>
                {/* Add any other header elements here */}
            </Toolbar>
        </AppBar>
    );
};
