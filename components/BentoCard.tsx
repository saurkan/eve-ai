import React from 'react';
import { Card, CardActionArea, Typography, Box, useTheme } from '@mui/material';

interface BentoCardProps {
    title: string;
    description: string;
    icon: React.ReactElement;
    onClick: () => void;
    // FIX: Add variant prop to control card height.
    variant?: 'small' | 'medium' | 'large';
}

export const BentoCard: React.FC<BentoCardProps> = ({ title, description, icon, onClick, variant = 'small' }) => {
    const theme = useTheme();

    const heightMap = {
        small: '160px',
        medium: '200px',
        large: '200px' // Reduced from 240px
    };

    return (
        <Card sx={{ 
            height: heightMap[variant], 
            display: 'flex',
        }}>
            <CardActionArea 
                onClick={onClick}
                sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    height: '100%',
                }}
            >
                <Box>
                    {React.cloneElement(icon as React.ReactElement<any>, { sx: { 
                        fontSize: { xs: 32, sm: 40 },
                        color: 'primary.main',
                    }})}
                </Box>
                <Box>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {description}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
};