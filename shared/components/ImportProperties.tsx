"use client";
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';

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

/** A message the admin can act on; parse failures we raise ourselves are already in Arabic. */
class ImportFileError extends Error {}

/** Reads every table row of a .docx file. mammoth is loaded only when a file is dropped. */
async function readRows(file: File): Promise<ImportRow[]> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  const doc = new DOMParser().parseFromString(result.value, 'text/html');
  const tables = doc.querySelectorAll('table');
  if (!tables.length) {
    throw new ImportFileError('لا يحتوي الملف على جدول. أضف جدولًا صفه الأول عناوين الأعمدة.');
  }

  const extracted: ImportRow[] = [];
  tables.forEach((table) => {
    const tableRows = Array.from(table.querySelectorAll('tr'));
    if (tableRows.length < 2) return;

    const cellTexts = (row: Element) =>
      Array.from(row.querySelectorAll('td, th')).map((cell) => cell.textContent?.trim() || '');

    // The first row holds the column headers.
    const columns = mapHeaders(cellTexts(tableRows[0]));

    tableRows.slice(1).forEach((row) => {
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
    throw new ImportFileError('الجداول في الملف لا تحتوي على صفوف بيانات تحت صف العناوين.');
  }
  return extracted;
}

interface ImportPropertiesProps {
  /** Called with every data row found, exactly as read, and the file name. */
  onImportComplete: (rows: ImportRow[], fileName: string) => void;
}

/** Step 1 of the import: drop or pick a .docx file; its table rows are read in the browser. */
const ImportProperties: React.FC<ImportPropertiesProps> = ({ onImportComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      const file = acceptedFiles[0];
      setLoading(true);
      setError('');
      try {
        onImportComplete(await readRows(file), file.name);
      } catch (err) {
        setError(
          err instanceof ImportFileError
            ? err.message
            : 'تعذّرت قراءة الملف. تأكد أنه ملف Word بصيغة .docx وغير تالف.'
        );
      } finally {
        setLoading(false);
      }
    },
    [onImportComplete]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  const rejected = fileRejections.length > 0;

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1,
          px: 2,
          py: 5,
          border: '1px dashed',
          borderColor: isDragActive ? 'primary.main' : 'var(--c-border-strong)',
          borderRadius: '10px',
          bgcolor: isDragActive ? 'var(--c-primary-soft)' : 'background.paper',
          cursor: loading ? 'progress' : 'pointer',
          transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }}
      >
        <input {...getInputProps()} aria-label="اختيار ملف Word" />
        {loading ? (
          <CircularProgress size={32} aria-hidden />
        ) : (
          <UploadFileOutlined aria-hidden sx={{ fontSize: 40, color: isDragActive ? 'primary.main' : 'var(--c-muted)' }} />
        )}
        <Typography sx={{ fontWeight: 600 }}>
          {loading ? 'جارٍ قراءة الملف…' : isDragActive ? 'أفلت الملف هنا' : 'اسحب ملف Word إلى هنا أو انقر لاختياره'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ملف واحد بصيغة .docx يحتوي على جدول العقارات.
        </Typography>
      </Box>

      <Box aria-live="polite">
        {(error || rejected) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'هذا الملف غير مدعوم. اختر ملف Word واحدًا بصيغة .docx.'}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default ImportProperties;
