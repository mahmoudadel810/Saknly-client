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

/** Fields an import table can carry. Columns are matched by their header text. */
export type ImportField =
  | 'location'
  | 'description'
  | 'floor'
  | 'price'
  | 'area'
  | 'bedrooms'
  | 'bathrooms'
  | 'type'
  | 'category'
  | 'contactName'
  | 'contactPhone';

/** One data row of the Word table, as text, exactly as found (nothing filled in). */
export interface ImportRow {
  /** 1-based position among the data rows of the document, for reporting. */
  rowNumber: number;
  cells: Partial<Record<ImportField, string>>;
}

const HEADER_ALIASES: Record<ImportField, string[]> = {
  location: ['الموقع', 'العنوان', 'المدينة'],
  description: ['الوصف'],
  floor: ['الدور', 'الطابق'],
  price: ['السعر'],
  area: ['المساحة'],
  bedrooms: ['غرف النوم', 'عدد الغرف', 'الغرف'],
  bathrooms: ['الحمامات', 'عدد الحمامات', 'دورات المياه'],
  type: ['النوع', 'نوع العقار'],
  category: ['الغرض', 'التصنيف', 'نوع العرض'],
  contactName: ['اسم التواصل', 'الاسم', 'اسم المالك'],
  contactPhone: ['الهاتف', 'رقم الهاتف', 'التليفون', 'الموبايل', 'رقم التواصل'],
};

// The original documented layout, used when the header row names no known column.
const LEGACY_ORDER: ImportField[] = ['location', 'description', 'floor', 'price', 'area'];

const normalizeHeader = (text: string) => text.replace(/\s+/g, ' ').trim();

const mapHeaders = (headerCells: string[]): (ImportField | null)[] => {
  const mapped = headerCells.map((text) => {
    const header = normalizeHeader(text);
    const field = (Object.keys(HEADER_ALIASES) as ImportField[]).find((key) =>
      HEADER_ALIASES[key].includes(header)
    );
    return field ?? null;
  });
  return mapped.some(Boolean) ? mapped : LEGACY_ORDER;
};

interface ImportPropertiesProps {
  onImportComplete: (rows: ImportRow[]) => void;
}

const ImportProperties: React.FC<ImportPropertiesProps> = ({ onImportComplete }) => {
  const [rows, setRows] = useState<ImportRow[]>([]);
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

      const extracted: ImportRow[] = [];

      tables.forEach(table => {
        const tableRows = Array.from(table.querySelectorAll('tr'));
        if (tableRows.length < 2) return;

        const cellTexts = (row: Element) =>
          Array.from(row.querySelectorAll('td, th')).map((cell) => cell.textContent?.trim() || '');

        // The first row holds the column headers.
        const columns = mapHeaders(cellTexts(tableRows[0]));

        tableRows.slice(1).forEach(row => {
          const texts = cellTexts(row);
          // A fully empty row is layout, not data.
          if (texts.every((text) => !text)) return;

          const cells: ImportRow['cells'] = {};
          columns.forEach((field, index) => {
            if (field && texts[index]) cells[field] = texts[index];
          });
          // Every data row is kept, even incomplete ones: they are reported, not dropped.
          extracted.push({ rowNumber: extracted.length + 1, cells });
        });
      });

      if (extracted.length === 0) {
        throw new Error('لم يتم العثور على صفوف بيانات في الجداول');
      }

      setRows(extracted);
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
    onImportComplete(rows);
    setRows([]);
  };

  const handleClear = () => {
    setRows([]);
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

      {rows.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            الصفوف المستخرجة ({rows.length})
          </Typography>
          
          <Paper elevation={2} sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
            <List dense>
              {rows.map((row, index) => (
                <React.Fragment key={row.rowNumber}>
                  <ListItem>
                    <ListItemText
                      primary={`${row.rowNumber}. ${row.cells.location || '—'} - ${row.cells.area || '—'} متر`}
                      secondary={`السعر: ${row.cells.price || '—'} | الدور: ${row.cells.floor || '—'} | ${row.cells.description || ''}`}
                    />
                  </ListItem>
                  {index < rows.length - 1 && <Divider />}
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
              متابعة للمراجعة ({rows.length})
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
