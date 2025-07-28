'use client';

import React, { useState } from 'react';
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

const validationSchema = yup.object({
    code: yup
        .string()
        .required('كود التحقق مطلوب'),
    newPassword: yup
        .string()
        .min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل")
        .matches(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
        .matches(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
        .matches(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
        .required("كلمة المرور مطلوبة"),
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code: values.code,
                        newPassword: values.newPassword,
                        confirmNewPassword: values.confirmNewPassword 
                    }),
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'حدث خطأ');

                showToast('تم تغيير كلمة المرور بنجاح', 'success');
                router.push('/login');
            } catch (err: any) {
                showToast("هناك خطأ فى الكود أو كلمة المرور الذى تم ادخالهم", 'error');
            } finally {
                setIsSubmitting(false);
            }
        },
    });


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
