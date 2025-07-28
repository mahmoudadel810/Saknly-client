import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const Loading: React.FC = () => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress color="primary" />
        </Box>
    );
};

export default Loading;
