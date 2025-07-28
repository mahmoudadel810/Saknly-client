"use client";
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as mammoth from 'mammoth';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';

interface Property {
  location: string;
  description: string;
  floor: string;
  price: string;
  area: string;
}

interface ImportPropertiesProps {
  onImportComplete: (properties: Property[]) => void;
}

const ImportProperties: React.FC<ImportPropertiesProps> = ({ onImportComplete }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    
    setLoading(true);
    setError('');
    
    try {
      const file = acceptedFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;
      
      // تحليل الجدول من محتوى HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const tables = doc.querySelectorAll('table');
      
      if (!tables.length) {
        throw new Error('لم يتم العثور على جداول في المستند');
      }
      
      const extractedProperties: Property[] = [];
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        
        // تخطي الصف الأول إذا كان يحتوي على عناوين
        const dataRows = Array.from(rows).slice(1);
        
        dataRows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 5) {
            const property: Property = {
              location: cells[0].textContent?.trim() || '',
              description: cells[1].textContent?.trim() || '',
              floor: cells[2].textContent?.trim() || '',
              price: cells[3].textContent?.trim() || '',
              area: cells[4].textContent?.trim() || '',
            };
            
            // تأكد من أن العقار يحتوي على بيانات أساسية
            if (property.location && property.price && property.area) {
              extractedProperties.push(property);
            }
          }
        });
      });
      
      if (extractedProperties.length === 0) {
        throw new Error('لم يتم العثور على بيانات عقارات صالحة في الجداول');
      }
      
      setProperties(extractedProperties);
    } catch (err) {
      setError(`خطأ في المعالجة: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleImport = () => {
    onImportComplete(properties);
    setProperties([]);
  };

  const handleClear = () => {
    setProperties([]);
    setError('');
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: '2px dashed #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionIcon color="primary" />
        استيراد العقارات من ملف Word
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        قم برفع ملف Word (.docx) يحتوي على جدول بالعقارات. يجب أن يحتوي الجدول على الأعمدة التالية: الموقع، الوصف، الدور، السعر، المساحة
      </Typography>
      
      <div {...getRootProps()} style={{
        padding: '30px',
        border: '2px dashed #3f51b5',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f7ff' : 'white',
        transition: 'all 0.3s ease'
      }}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: '#3f51b5', mb: 2 }} />
        {isDragActive ? (
          <Typography color="primary" sx={{ fontWeight: 'bold' }}>
            أسقط الملف هنا...
          </Typography>
        ) : (
          <Box>
            <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
              اسحب وأسقط ملف Word هنا، أو انقر للاختيار
            </Typography>
            <Typography variant="body2" color="text.secondary">
              يدعم ملفات .docx فقط
            </Typography>
          </Box>
        )}
      </div>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>جاري معالجة الملف...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {properties.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            العقارات المستخرجة ({properties.length})
          </Typography>
          
          <Paper elevation={2} sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
            <List dense>
              {properties.map((prop, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${prop.location} - ${prop.area} متر`}
                      secondary={`السعر: ${prop.price} | الدور: ${prop.floor} | ${prop.description}`}
                    />
                  </ListItem>
                  {index < properties.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImport}
              sx={{ flex: 1 }}
            >
              استيراد العقارات ({properties.length})
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
            >
              مسح
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImportProperties;
