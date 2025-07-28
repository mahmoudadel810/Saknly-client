"use client";

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';
import HeroSearchBar from './HeroSearchBar';

const HeroSection = () => {
    return (
        <Box
            sx={{
                height: { xs: '70vh', sm: '65vh', md: '70vh', lg: '75vh' },
                background: 'url("https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                direction: 'rtl',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    zIndex: 1,
                }
            }}
        >
            <Container 
                maxWidth="lg" 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 2, 
                    pt: { xs: 2, sm: 4, md: 6 }, 
                    pb: { xs: 2, sm: 4, md: 6 },
                    px: { xs: 2, sm: 3, md: 4 }
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        fontSize: { 
                            xs: '1.8rem', 
                            sm: '2.2rem', 
                            md: '2.6rem', 
                            lg: '2.8rem' 
                        },
                        color: '#fff',
                        letterSpacing: '0.5px',
                        mb: { xs: 1, sm: 1.5 },
                        textAlign: 'center',
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        lineHeight: { xs: 1.3, md: 1.2 },
                        maxWidth: { xs: '100%', md: '90%', lg: '80%' }
                    }}
                >
                    منزلك الجديد في انتظارك
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: 400,
                        fontSize: { 
                            xs: '0.9rem', 
                            sm: '1rem', 
                            md: '1.1rem', 
                            lg: '1.2rem' 
                        },
                        mb: { xs: 2, sm: 3 },
                        textAlign: 'center',
                        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        maxWidth: { xs: '100%', md: '90%', lg: '80%' },
                        lineHeight: 1.5
                    }}
                >
                    ابحث عن أفضل الفلل والمنازل بسهولة مع سكنلي
                </Typography>
                <Box sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    mb: { xs: 2, sm: 3 },
                    mt: { xs: 4, sm: 6 }, // أضفت marginTop لزيادة المسافة من الأعلى
                    px: { xs: 1, sm: 2 }
                }}>
                  <HeroSearchBar />
                </Box>
                <Box sx={{ 
                    mt: { xs: 2, sm: 3 }, 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    px: { xs: 1, sm: 2 }
                }}>
                  {/* تم حذف زر البحث المتقدم بناءً على طلب العميل */}
                </Box>
            </Container>
        </Box>
    );
};

export default HeroSection;
