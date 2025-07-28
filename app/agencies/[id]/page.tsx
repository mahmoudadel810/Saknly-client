"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Container,
  Avatar,
  Stack,
  Skeleton,
  Alert,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Collapse,
  IconButton
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Head from "next/head";
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import AddCommentIcon from '@mui/icons-material/AddComment';

const fetchAgencyById = async (id: string) => {

    const URL = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';
    const res = await fetch(`${URL}/agencies/${id}`);
  if (!res.ok) throw new Error("تعذر تحميل بيانات الوكالة");
  const data = await res.json();
  return data.data;
};

const fetchApprovedTestimonials = async (agencyId: string) => {
  const URL = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';
  const res = await fetch(`${URL}/testimonial?type=agency&agencyId=${agencyId}&status=approved`);
  if (!res.ok) throw new Error("تعذر تحميل آراء العملاء");
  const data = await res.json();
  return data.data;
};

import { useDarkMode } from "@/app/context/DarkModeContext";

const AgencyDetailsPage: React.FC = () => {
  const params = useParams();
  const { id } = params as { id: string };
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // فورم إضافة رأي
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [testimonialLoading, setTestimonialLoading] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState<string | null>(null);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const commentsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / commentsPerPage);
  const currentComments = testimonials.slice(
    (page - 1) * commentsPerPage,
    page * commentsPerPage
  );

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialLoading(true);
    setTestimonialSuccess(null);
    setTestimonialError(null);
    try {
      const URL = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';
      const res = await fetch(`${URL}/testimonial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testimonialName,
          text: testimonialText,
          type: "agency",
          agencyId: agency._id,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "حدث خطأ أثناء إرسال الرأي");
      }
      
      // Use the message from the server response
      setTestimonialSuccess(data.message || "تم إضافة رأيك بنجاح");
      
      // Clear the form
      setTestimonialName("");
      setTestimonialText("");
      
      // Refresh the testimonials list to show the new one immediately
      if (data.data?.status === 'approved') {
        const updatedTestimonials = await fetchApprovedTestimonials(agency._id);
        setTestimonials(updatedTestimonials);
      }
      
    } catch (err: any) {
      setTestimonialError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setTestimonialLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchAgencyById(id)
        .then(data => setAgency(data))
        .catch(() => setError("تعذر تحميل بيانات الوكالة"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (agency?._id) {
      setTestimonialsLoading(true);
      fetchApprovedTestimonials(agency._id)
        .then(data => setTestimonials(data))
        .catch(() => setTestimonials([]))
        .finally(() => setTestimonialsLoading(false));
    }
  }, [agency?._id]);

  const { isDarkMode } = useDarkMode();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: isDarkMode ? 'var(--dark-800)' : '#f8f9fa', py: 4 }}>
        <Container maxWidth="md">
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4, mb: 3, bgcolor: isDarkMode ? 'var(--dark-700)' : undefined }} />
          <Skeleton variant="text" height={60} sx={{ mb: 2, bgcolor: isDarkMode ? 'var(--dark-700)' : undefined }} />
        </Container>
      </Box>
    );
  }

  if (error || !agency) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: isDarkMode ? 'var(--dark-800)' : '#f8f9fa', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2, bgcolor: isDarkMode ? 'var(--dark-700)' : undefined, color: isDarkMode ? '#fff' : undefined }}>{error || "الوكالة غير متاحة"}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{agency.name} | تفاصيل الوكالة</title>
        <meta name="description" content={agency.description?.slice(0, 150)} />
      </Head>
      <Box sx={{ minHeight: '100vh', backgroundColor: isDarkMode ? 'var(--dark-800)' : '#f8f9fa', py: 4, transition: 'background 0.3s' }}>
        <Container maxWidth="md">
          {/* Agency Header */}
          <Paper sx={{ 
            p: 4, mb: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4,
            bgcolor: isDarkMode ? 'var(--dark-700)' : 'rgba(255,255,255,0.95)',
            border: isDarkMode ? '1px solid var(--dark-600)' : '1px solid #eee',
            boxShadow: isDarkMode ? '0 4px 24px 0 rgba(24,24,27,0.15)' : undefined,
            color: isDarkMode ? '#fff' : undefined
          }}>
            <Avatar src={agency.logo?.url || '/images/placeholder.jpg'} alt={agency.name} sx={{ width: 100, height: 100, border: '2px solid #667eea' }} />
            <Box flex={1} minWidth={0}>
              <Typography variant="h4" fontWeight="bold" color={isDarkMode ? '#fff' : '#667eea'} gutterBottom>
                {agency.name}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                {agency.isFeatured && <Chip icon={<HomeWorkIcon />} label="وكالة مميزة" color="primary" sx={{ fontWeight: 'bold', gap: 1 }} />}
                {/* لو فيه بيانات تواصل */}
                {agency.phone && <Chip icon={<CallIcon />} label={agency.phone} sx={{ bgcolor: 'rgba(76,175,80,0.1)', color: '#388e3c', fontWeight: 'bold', gap: 1 }} />}
                {agency.email && <Chip icon={<EmailIcon />} label={agency.email} sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#1976d2', fontWeight: 'bold', gap: 1 }} />}
              </Stack>
              <Typography variant="body1" sx={{ color: isDarkMode ? '#fff' : undefined }}>
                {agency.description}
              </Typography>
            </Box>
          </Paper>

          {/* Featured Properties Placeholder */}
          <Paper sx={{ 
            p: 3, mb: 4, borderRadius: 4,
            bgcolor: isDarkMode ? 'var(--dark-700)' : '#f0f0f0',
            border: isDarkMode ? '1px solid var(--dark-600)' : '1px solid #CCC',
            color: isDarkMode ? '#fff' : undefined
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color={isDarkMode ? '#fff' : '#764ba2'}>
              العقارات الخاصة بالوكالة
            </Typography>
            {Array.isArray(agency.properties) && agency.properties.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {agency.properties.map((property: any) => (
                  <Paper key={property._id} sx={{ p: 2, borderRadius: 2, border: '1px solid #eee', bgcolor: isDarkMode ? 'var(--dark-700)' : '#fff', mb: 2 }}>
                    <Typography fontWeight="bold" sx={{ fontSize: '1.1rem', mb: 1, color: isDarkMode ? '#fff' : undefined }}>{property.title}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                      <Chip label={`السعر: ${property.price} جنيه`} color="primary" size="small" />
                      <Chip label={`المساحة: ${property.area} م²`} color={isDarkMode ? 'default' : 'default'} size="small" sx={{ color: isDarkMode ? '#fff' : undefined }} />
                      <Chip label={`الغرف: ${property.bedrooms}`} color={isDarkMode ? 'success' : 'success'} size="small" sx={{ color: isDarkMode ? '#fff' : undefined }} />
                      <Chip label={`الحمامات: ${property.bathrooms}`} color="info" size="small" sx={{ color: isDarkMode ? '#fff' : undefined }} />
                      <Chip label={`النوع: ${property.type}`} color="secondary" size="small" sx={{ color: isDarkMode ? '#fff' : undefined }} />
                      <Chip label={`العنوان: ${property.location?.address || '-'}`} color="default" size="small" sx={{ color: isDarkMode ? '#fff' : undefined }} />
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      href={`/properties/${property._id}`}
                      sx={{ mt: 1, borderRadius: 2, fontWeight: 'bold' }}
                    >
                      عرض التفاصيل
                    </Button>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">لا توجد بيانات عقارات متاحة حالياً.</Typography>
            )}
          </Paper>

          {/* Testimonials Section */}
          <Paper sx={{ 
            p: 4, mb: 4, borderRadius: 4, backdropFilter: 'blur(10px)',
            bgcolor: isDarkMode ? 'var(--dark-700)' : 'rgba(255,255,255,0.95)',
            border: isDarkMode ? '1px solid var(--dark-600)' : '1px solid rgba(255,255,255,0.2)',
            boxShadow: isDarkMode ? '0 8px 32px rgba(24,24,27,0.18)' : '0 8px 32px rgba(240, 147, 251, 0.1)',
            color: isDarkMode ? '#fff' : undefined
          }}>
  <Typography 
    variant="h5" 
    fontWeight="bold" 
    gutterBottom
    sx={{
      background: 'black',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: isDarkMode ? '#fff' : 'transparent',
      mb: 3
    }}
  >
    آراء العملاء
  </Typography>
  <Box mb={3}>
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddCommentIcon />}
      onClick={() => setShowForm(v => !v)}
      sx={{ 
        mb: 2,

        borderRadius: 2,
        px: 3,
        py: 1.2,
        boxShadow: isDarkMode ? '0 4px 12px rgba(24,24,27,0.18)' : '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}
    >
      {showForm ? "إخفاء الفورم" : "أضف رأيك"}
    </Button>
    <Collapse in={showForm}>
      <Box 
        component="form" 
        onSubmit={handleTestimonialSubmit} 
        sx={{ 
          mt: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          bgcolor: isDarkMode ? 'var(--dark-600)' : 'rgba(255,255,255,0.9)',
          p: 3, 
          borderRadius: 2, 
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: isDarkMode ? '0 4px 12px rgba(24,24,27,0.08)' : '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Typography fontWeight="bold" mb={1} sx={{ color: isDarkMode ? '#fff' : undefined }}>أضف رأيك عن الوكالة</Typography>
        <TextField
          label="اسمك"
          value={testimonialName}
          onChange={e => setTestimonialName(e.target.value)}
          required
          inputProps={{ maxLength: 50, style: { color: isDarkMode ? '#fff' : undefined } }}
          InputLabelProps={{ style: { color: isDarkMode ? '#fff' : undefined } }}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: isDarkMode ? '#fff' : undefined,
              '& fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? '#fff' : undefined,
            }
          }}
        />
        <TextField
          label="رأيك"
          value={testimonialText}
          onChange={e => setTestimonialText(e.target.value.slice(0, 200))}
          required
          multiline
          minRows={3}
          inputProps={{ maxLength: 200, style: { color: isDarkMode ? '#fff' : undefined } }}
          InputLabelProps={{ style: { color: isDarkMode ? '#fff' : undefined } }}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: isDarkMode ? '#fff' : undefined,
              '& fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? '#fff' : undefined,
            }
          }}
        />
        <Typography variant="caption" color={testimonialText.length === 200 ? 'error' : (isDarkMode ? '#fff' : 'text.secondary')} sx={{ alignSelf: 'flex-end', color: isDarkMode ? '#fff' : undefined }}>
          {testimonialText.length}/200
        </Typography>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={testimonialLoading || !testimonialName || !testimonialText}
          sx={{
            bgcolor: isDarkMode ? '#667eea' : '#667eea',
            color: isDarkMode ? '#fff' : undefined,
            '&:hover': {
              bgcolor: '#5a6fd1'
            },
            borderRadius: 2,
            py: 1.2,
            boxShadow: isDarkMode ? '0 4px 12px rgba(24,24,27,0.18)' : '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
        >
          {testimonialLoading ? <CircularProgress size={22} color="inherit" /> : "إرسال الرأي"}
        </Button>
        {testimonialSuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              borderRadius: 2,
              bgcolor: 'rgba(76,175,80,0.1)',
              borderColor: 'rgba(76,175,80,0.2)'
            }}
          >
            {testimonialSuccess}
          </Alert>
        )}
        {testimonialError && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              bgcolor: 'rgba(244,67,54,0.1)',
              borderColor: 'rgba(244,67,54,0.2)'
            }}
          >
            {testimonialError}
          </Alert>
        )}
      </Box>
    </Collapse>
  </Box>
  
  {/* عرض الآراء */}
  {testimonialsLoading ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton 
          key={i}
          variant="rectangular" 
          height={120} 
          sx={{ 
            borderRadius: 2,
            bgcolor: isDarkMode ? '#fff' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)'
          }} 
        />
      ))}
    </Box>
  ) : testimonials.length === 0 ? (
    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, color: isDarkMode ? '#fff' : undefined }}>
      لا توجد آراء متاحة حالياً.
    </Typography>
  ) : (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {currentComments.map((t, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              width: '100%',
              bgcolor: isDarkMode ? 'var(--dark-600)' : 'rgba(255,255,255,0.9)', 
              borderRadius: 2, 
              p: 3, 
              border: '1px solid rgba(118, 75, 162, 0.1)',
              transition: 'all 0.3s ease', 
              '&:hover': { 
                transform: 'translateY(-3px)', 
                boxShadow: '0 8px 24px rgba(118, 75, 162, 0.1)', 
                borderColor: 'rgba(118, 75, 162, 0.2)' 
              }
            }}
          >
            <Stack direction="row" alignItems="center" gap={2} mb={2}>
              <Avatar 
                sx={{ 
                  bgcolor: isDarkMode ? 'var(--dark-800)' : '#764ba2', 
                  width: 48, 
                  height: 48,
                  boxShadow: isDarkMode ? '0 2px 8px rgba(24,24,27,0.18)' : '0 2px 8px rgba(118, 75, 162, 0.3)'
                }}
              >
                {t.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography fontWeight="bold" fontSize="1.1rem">{t.name}</Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#fff' : 'text.secondary' }}>
                  {new Date(t.createdAt).toLocaleDateString('ar-EG')}
                </Typography>
              </Box>
            </Stack>
            <Typography 
              color="text.secondary" 
              sx={{
                lineHeight: 1.8,
                fontSize: '1rem',
                color: isDarkMode ? '#fff' : undefined
              }}
            >
              {t.text}
            </Typography>
          </Box>
        ))}
      </Box>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: page === 1 ? 'rgba(0,0,0,0.05)' : 'rgba(118, 75, 162, 0.1)',
                color: page === 1 ? 'text.disabled' : '#764ba2',
                '&:hover': {
                  bgcolor: page === 1 ? 'rgba(0,0,0,0.05)' : 'rgba(118, 75, 162, 0.2)'
                }
              }}
            >
              &lt;
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                onClick={() => setPage(num)}
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: page === num ? '#764ba2' : 'rgba(118, 75, 162, 0.1)',
                  color: page === num ? 'white' : '#764ba2',
                  fontWeight: page === num ? 'bold' : 'normal',
                  '&:hover': {
                    bgcolor: page === num ? '#764ba2' : 'rgba(118, 75, 162, 0.2)'
                  }
                }}
              >
                {num}
              </Button>
            ))}
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: page === totalPages ? 'rgba(0,0,0,0.05)' : 'rgba(118, 75, 162, 0.1)',
                color: page === totalPages ? 'text.disabled' : '#764ba2',
                '&:hover': {
                  bgcolor: page === totalPages ? 'rgba(0,0,0,0.05)' : 'rgba(118, 75, 162, 0.2)'
                }
              }}
            >
              &gt;
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )}
</Paper>
        </Container>
      </Box>
    </>
  );
};

export default AgencyDetailsPage;
