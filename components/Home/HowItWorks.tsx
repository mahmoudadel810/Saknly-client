'use client';

import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { Search, Key } from '@mui/icons-material';
import HandshakeIcon from '@mui/icons-material/Handshake';



const steps = [
    {
        icon: <Search sx={{ fontSize: 48, color: 'primary.main' }} />,
        title: 'اعثر على وحدتك',
        description: 'استخدم أداة البحث المتقدمة لدينا لاكتشاف العقارات التي تتطابق مع معاييرك الدقيقة.',
    },
    {
        icon: <HandshakeIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
        title: 'التواصل والعرض',
        description: 'تواصل بسهولة معنا لتجد وحدتك وسنرتب لك الموعد المناسب لتراها.',
    },
    {
        icon: <Key sx={{ fontSize: 48, color: 'primary.main' }} />,
        title: 'تأمين منزلك',
        description: 'أكمل العملية باستخدام منصتنا الآمنة، مما يجعل منزل أحلامك حقيقة.',
    },
];

const HowItWorks = () => {
    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' ,direction:"rtl"}}>
            <Container maxWidth="lg">
                <Typography
                    variant="h2"
                    component="h2"
                    textAlign="center"
                    sx={{
                        mb: 8,
                        color: 'text.primary',
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        fontWeight: 600,
                    }}
                >
                    كيف يعمل سكنلى
                </Typography>

                <Grid container spacing={4}>
                    {steps.map((step, index) => (
                        <Grid key={index} size= {{xs:12, md:4}}>
                            <Card
                                sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ mb: 3 }}>
                                        {step.icon}
                                    </Box>
                                    <Typography
                                        variant="h4"
                                        component="h3"
                                        sx={{
                                            mb: 2,
                                            fontSize: '1.5rem',
                                            fontWeight: 600,
                                            color: 'text.primary',
                                        }}
                                    >
                                        {step.title}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {step.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default HowItWorks;