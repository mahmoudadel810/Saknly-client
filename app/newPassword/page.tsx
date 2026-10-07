'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Paper,
    Container,
} from '@mui/material';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useToast } from '@/shared/provider/ToastProvider';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/shared/utils/auth';
import { emailSchema, passwordSchema, RESET_EMAIL_KEY } from '@/shared/utils/authValidation';

const validationSchema = yup.object({
    email: emailSchema,
    code: yup
        .string()
        .required('كود التحقق مطلوب'),
    newPassword: passwordSchema,
    confirmNewPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'كلمة المرور غير متطابقة')
        .required('تأكيد كلمة المرور مطلوب'),
});

export default function ResetPasswordFormPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            email: '',
            code: '',
            newPassword: '',
            confirmNewPassword: '',
        },
        validationSchema: validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                
                // Make API request with the code entered by the user directly in the form
                const res = await fetch(`${API_URL}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: values.email,
                        code: values.code,
                        newPassword: values.newPassword,
                        confirmNewPassword: values.confirmNewPassword 
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) throw new Error(data.message || "هناك خطأ فى الكود أو كلمة المرور الذى تم ادخالهم");

                try {
                    sessionStorage.removeItem(RESET_EMAIL_KEY);
                } catch {
                    // ignore
                }
                showToast('تم تغيير كلمة المرور بنجاح', 'success');
                router.push('/login');
            } catch (err: any) {
                showToast(err.message || "هناك خطأ فى الكود أو كلمة المرور الذى تم ادخالهم", 'error');
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Carry the email over from the forgot-password step (?email=... or sessionStorage).
    useEffect(() => {
        let email = new URLSearchParams(window.location.search).get('email') || '';
        if (!email) {
            try {
                email = sessionStorage.getItem(RESET_EMAIL_KEY) || '';
            } catch {
                email = '';
            }
        }
        if (email) formik.setFieldValue('email', email, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, direction: 'rtl' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%', 
                        p: 1, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Lock size={24} style={{ color: 'white' }} />
                    </Box>
                    <Typography component="h1" variant="h5" fontWeight="bold">
                        إعادة تعيين كلمة المرور
                    </Typography>
                </Box>

                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="البريد الإلكتروني"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        margin="normal"
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        id="code"
                        name="code"
                        label="كود التحقق"
                        value={formik.values.code}
                        onChange={formik.handleChange}
                        error={formik.touched.code && Boolean(formik.errors.code)}
                        helperText={formik.touched.code && formik.errors.code}
                        margin="normal"
                        variant="outlined"
                        placeholder="أدخل كود التحقق المرسل إلى بريدك الإلكتروني"
                    />

                    <TextField
                        fullWidth
                        id="newPassword"
                        name="newPassword"
                        label="كلمة المرور الجديدة"
                        type={showPassword ? 'text' : 'password'}
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                        helperText={formik.touched.newPassword && formik.errors.newPassword}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        label="تأكيد كلمة المرور الجديدة"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formik.values.confirmNewPassword}
                        onChange={formik.handleChange}
                        error={formik.touched.confirmNewPassword && Boolean(formik.errors.confirmNewPassword)}
                        helperText={formik.touched.confirmNewPassword && formik.errors.confirmNewPassword}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isSubmitting}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {isSubmitting ? 'جاري المعالجة...' : 'تغيير كلمة المرور'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}
