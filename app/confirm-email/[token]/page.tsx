'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import Link from 'next/link';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useParams } from 'next/navigation';

export default function EmailConfirmedPage() {
    const params = useParams();
    const token = params.token as string;
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false);

    useEffect(() => {
        if (!token || hasVerified.current) return;
        const verifyEmail = async () => {
            hasVerified.current = true;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/confirm-email/${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                // console.log('Email confirmation response:', data);

                if (response.ok) {
                    setStatus('success');
                    setMessage('تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول إلى حسابك.');
                } else {
                    setStatus('error');
                    setMessage('حدث خطأ أثناء تأكيد البريد الإلكتروني. الرجاء المحاولة مرة أخرى.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('حدث خطأ أثناء الاتصال بالخادم. الرجاء المحاولة مرة أخرى.');
            }
           
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ededed',
                px: 2,
                direction: 'rtl',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    my:"3rem",
                    width: '100%',
                    maxWidth: 400,
                    px: 3,
                    py: 5,
                    height: "fit-content",
                    textAlign: 'center',
                    borderRadius: 4,
                    boxShadow: 3,
                    bgcolor: 'white',
                    shadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, mt: 1 }}>
                    سكنلى
                </Typography>

                {status === 'loading' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                        <CircularProgress color="primary" />
                        <Typography sx={{ mt: 2 }}>جاري التحقق من البريد الإلكتروني...</Typography>
                    </Box>
                )}

                {status === 'success' && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: 'green.100',
                                    borderRadius: '50%',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box sx={{ backgroundColor: '#0284c7', color: 'white', borderRadius: '50%', p: 2 }} >
                                    <CheckIcon sx={{ fontSize: 30 }} />
                                </Box>
                            </Box>
                        </Box>

                        <Typography variant="h6" sx={{ my: 4, fontWeight: 500 }}>
                            تم تأكيد البريد الإلكتروني!
                        </Typography>

                        <Box
                            sx={{
                                bgcolor: '#0284c7',
                                color: 'white',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: 14 }}>
                                {message}
                            </Typography>
                        </Box>

                        <Typography sx={{ fontSize: 14, mt: 4, mb: 2 }}>
                            يمكنك الآن
                            <Link href="/login" style={{
                                color: '#0284c7', display: 'inline-block',
                                padding: '0rem 0.4rem',
                            }}>
                                تسجيل الدخول
                            </Link>
                            وبدء استخدام سكنلى.
                        </Typography>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: 'error.light',
                                    borderRadius: '50%',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box sx={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', p: 2 }} >
                                    <ErrorOutlineIcon sx={{ fontSize: 30 }} />
                                </Box>
                            </Box>
                        </Box>

                        <Typography variant="h6" sx={{ my: 4, fontWeight: 500 }}>
                            خطأ في تأكيد البريد الإلكتروني
                        </Typography>

                        <Box
                            sx={{
                                bgcolor: '#ef4444',
                                color: 'white',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: 14 }}>
                                {message}
                            </Typography>
                        </Box>

                        <Typography sx={{ fontSize: 14, mt: 4, mb: 2 }}>
                            يمكنك
                            <Link href="/register" style={{
                                color: '#0284c7', display: 'inline-block',
                                padding: '0rem 0.4rem',
                            }}>
                                التسجيل مرة أخرى
                            </Link>
                            أو
                            <Link href="/login" style={{
                                color: '#0284c7', display: 'inline-block',
                                padding: '0rem 0.4rem',
                            }}>
                                تسجيل الدخول
                            </Link>
                            إذا كنت تعتقد أن هذا خطأ.
                        </Typography>
                    </>
                )}
            </Paper>
        </Box>
    );
} 