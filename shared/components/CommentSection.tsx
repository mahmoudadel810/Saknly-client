import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Avatar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Rating from '@mui/material/Rating';

interface Comment {
  _id: string;
  user: { userName: string; email: string };
  text: string;
  createdAt: string;
  rating?: number;
}

interface CommentSectionProps {
  propertyId: string;
  isAuthenticated: boolean;
  userName?: string;
  userEmail?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  propertyId,
  isAuthenticated,
  userName,
  userEmail,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/property-comments/${propertyId}`
      );
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
      } else {
        setError('حدث خطأ أثناء جلب التعليقات');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [propertyId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // If not authenticated, prevent posting and show error
    if (!isAuthenticated) {
      setError('يجب تسجيل الدخول لإضافة تعليق.');
      return;
    }

    setPosting(true);
    setError(null);
    setSuccess(false);

    try {
      // Try to get token from localStorage (if your app stores it there)
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Saknly__${token}`;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/property-comments/${propertyId}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: newComment}),
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.status === 401) {
        setError('يجب تسجيل الدخول لإضافة تعليق.');
      } else if (data.success) {
        setNewComment('');
        setSuccess(true);
        setComments([data.data, ...comments]);
      } else {
        setError(data.message || 'حدث خطأ أثناء إضافة التعليق');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" mb={2} fontWeight={700}>
        التعليقات
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {isAuthenticated ? (
            <Box component="form" onSubmit={handleAddComment} mb={3} display="flex" gap={2} alignItems="center">
              <TextField
                label="أضف تعليقك..."
                variant="outlined"
                fullWidth
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={posting}
                inputProps={{ maxLength: 1000 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                disabled={posting || !newComment.trim()}
                sx={{ minWidth: 120 }}
              >
                {posting ? <CircularProgress size={22} /> : 'إرسال'}
              </Button>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              يجب تسجيل الدخول لإضافة تعليق.
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              تم إضافة التعليق بنجاح
            </Alert>
          )}
          {comments.length === 0 ? (
            <Typography color="text.secondary">
              لا توجد تعليقات بعد.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {comments.map(comment => (
                <Box key={comment._id} display="flex" alignItems="flex-start" gap={2} p={2} bgcolor="#f7f7f7" borderRadius={2}>
                  <Avatar>{comment.user.userName?.[0] || '?'}</Avatar>
                  <Box>
                    <Typography fontWeight={700}>{comment.user.userName}</Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString('ar-EG')}
                      </Typography>
                    </Box>
                    <Typography>{comment.text}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CommentSection;