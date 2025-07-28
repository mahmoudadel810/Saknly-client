'use client';

import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/shared/provider/ToastProvider';
import { useRouter } from 'next/navigation';

const ListProperty = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const handleListProperty = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            showToast && showToast('يجب تسجيل الدخول أولاً لعرض عقارك', 'warning');
            setTimeout(() => {
                router.push('/login');
            }, 1500);
            return;
        }
        router.push('/uploadProperty');
    };

    return (
        <Box
            className="bg-white dark:bg-[#1f2937]"
            sx={{
                py: { xs: 6, sm: 8, md: 10, lg: 12 },
                px: { xs: 2, sm: 3, md: 4 },
                transition: 'background 0.3s',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 4, sm: 5, md: 6 }} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }} >
                        <Box
                            sx={{
                                height: { xs: '25vh', sm: '30vh', md: '35vh', lg: '40vh' },
                                background: 'linear-gradient(rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.2)), url("./images/skanly.jpeg")',
                                width: '100%',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 3,
                                boxShadow: '0 12px 24px -4px rgb(0 0 0 / 0.1)',
                                className: "dark:bg-opacity-50",
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} >
                        <Typography
                            variant="h2"
                            component="h2"
                            className="text-black dark:text-white"
                            sx={{
                                mb: { xs: 2, sm: 3 },
                                fontSize: { xs: '1.6rem', sm: '1.9rem', md: '2.2rem', lg: '2.4rem' },
                                fontWeight: 600,
                                lineHeight: 1.2,
                                transition: 'color 0.3s',
                            }}
                        >
                            اعرض عقارك على سكنلي
                        </Typography>
                        <Typography
                            variant="body1"
                            className="text-neutral-700 dark:text-neutral-300"
                            sx={{
                                mb: { xs: 3, sm: 4 },
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.125rem' },
                                lineHeight: 1.7,
                                transition: 'color 0.3s',
                            }}
                        >
                            أوصل لأكبر عدد من الناس وبِيع أسرع بمساعدة خبراءنا ومنصتنا المبتكر.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 600,
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                            onClick={handleListProperty}
                        >
                            أعرض عقارك دلوقتي !
                        </Button>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};

export default ListProperty;