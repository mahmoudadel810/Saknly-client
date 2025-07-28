import React from 'react';
import { 
  Box, Typography, Paper, Stack, Button, IconButton, Divider 
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Property } from '@/shared/types';

interface ContactProps {
  property: Property;
}

const ContactCard: React.FC<ContactProps> = ({ property }) => {
  return (
    <Paper elevation={0} sx={{ 
      p: 3, 
      borderRadius: 3, 
      position: 'sticky',
      top: 20,
      boxShadow: '0px 5px 25px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        تواصل مع المعلن
      </Typography>
      
      <Stack spacing={2} mb={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CallIcon />}
          fullWidth
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '1.1rem',
            bgcolor: 'primary.dark',
            '&:hover': { bgcolor: 'primary.main' }
          }}
          href={`tel:${property.contactInfo?.phone || ''}`}
        >
          اتصال مباشر
        </Button>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<WhatsAppIcon />}
          fullWidth
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '1.1rem',
            bgcolor: '#25D366',
            '&:hover': { bgcolor: '#22C55E' }
          }}
          href={`https://wa.me/${property.contactInfo?.phone || ''}`}
          target="_blank"
        >
          التواصل عبر واتساب
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<EmailIcon />}
          fullWidth
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '1.1rem',
            borderWidth: 2,
            '&:hover': { borderWidth: 2 }
          }}
          href={`mailto:${property.contactInfo?.email || ''}`}
        >
          إرسال بريد إلكتروني
        </Button>
      </Stack>
      
      <Divider sx={{ my: 3 }} />
      
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          مشاركة العقار
        </Typography>
        <Stack direction="row" justifyContent="center" spacing={1.5}>
          <ShareButton 
            icon={<ContentCopyIcon />} 
            color="#6B7280" 
            tooltip="نسخ الرابط" 
          />
          <ShareButton 
            icon={<WhatsAppIcon />} 
            color="#25D366" 
            tooltip="واتساب" 
          />
          <ShareButton 
            icon={<FacebookIcon />} 
            color="#1877F2" 
            tooltip="فيسبوك" 
          />
          <ShareButton 
            icon={<TwitterIcon />} 
            color="#1DA1F2" 
            tooltip="تويتر" 
          />
        </Stack>
      </Box>
    </Paper>
  );
};

// Share Button Component
const ShareButton = ({ 
  icon, 
  color, 
  tooltip 
}: { 
  icon: React.ReactNode; 
  color: string; 
  tooltip: string; 
}) => (
  <IconButton
    sx={{
      bgcolor: `${color}10`,
      color: color,
      '&:hover': { 
        bgcolor: `${color}20`,
        transform: 'translateY(-2px)'
      },
      transition: 'all 0.2s ease',
      width: 44,
      height: 44
    }}
  >
    {icon}
  </IconButton>
);

export default ContactCard;