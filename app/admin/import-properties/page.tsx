"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImportProperties, { ImportRow } from '../../../shared/components/ImportProperties';
import { useToast } from '../../../shared/provider/ToastProvider';
import { normalizeCity, PROPERTY_TYPE_VALUES } from '../../../shared/constants/property';
import { API_URL, authHeader } from '../../../shared/utils/auth';

const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  secondary: {
    800: "#1e293b",
    700: "#334155",
    500: "#64748b",
    300: "#cbd5e1",
  },
  danger: {
    500: "#ef4444",
    600: "#dc2626",
  },
};

// Server create rules (server/modules/Property/propertyValidation.js), checked here so each
// failed row gets a specific reason. Nothing is ever filled in: a missing value fails the row.
const CATEGORY_WORDS: Record<string, 'sale' | 'rent' | 'student'> = {
  'بيع': 'sale',
  'للبيع': 'sale',
  'إيجار': 'rent',
  'ايجار': 'rent',
  'للإيجار': 'rent',
  'للايجار': 'rent',
  'سكن طلبة': 'student',
  'سكن طلاب': 'student',
  'طلبة': 'student',
};
const CATEGORY_LABEL = { sale: 'للبيع', rent: 'للإيجار', student: 'سكن طلبة' } as const;
const UPLOADS_PER_WINDOW = 20; // server fileUpload rate limit: 20 requests per 15 minutes

const toDigits = (text: string) =>
  text.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/** The first number in the text ("1,200,000 جنيه" → 1200000, "120 م2" → 120, "1.5" → 1.5). */
const parseNumber = (text?: string): number | null => {
  if (!text) return null;
  const match = toDigits(text).replace(/[,،٬](?=\d{3})/g, '').match(/\d+(?:[.٫]\d+)?/);
  return match ? Number(match[0].replace('٫', '.')) : null;
};

const parseWholeNumber = (text?: string): number | null => {
  const value = parseNumber(text);
  return value !== null && Number.isInteger(value) ? value : null;
};

/** "1 مليون 200 الف" → 1200000; returns null when no number can be read. */
const parsePrice = (text?: string): number | null => {
  if (!text) return null;
  const value = toDigits(text);
  if (value.includes('مليون')) {
    const [millionsPart, rest] = value.split('مليون');
    const millions = parseNumber(millionsPart);
    if (millions === null) return null;
    const restValue = parseWholeNumber(rest);
    if (restValue === null) return Math.round(millions * 1000000);
    // "1 مليون 200" is ambiguous (200 or 200 thousand): only an explicit "ألف" is accepted.
    if (!/[اأ]لف/.test(rest)) return null;
    return Math.round(millions * 1000000 + restValue * 1000);
  }
  const number = parseNumber(value);
  if (number === null) return null;
  return Math.round(/[اأ]لف/.test(value) ? number * 1000 : number);
};

interface PreparedRow {
  rowNumber: number;
  label: string;
  errors: string[];
  form: FormData | null;
}

const prepareRow = (row: ImportRow): PreparedRow => {
  const c = row.cells;
  const errors: string[] = [];

  // "[city] rest of address" or just the city
  const locationText = c.location || '';
  const cityText = locationText.includes(']')
    ? locationText.split(']')[0].replace('[', '').trim()
    : locationText.trim();
  const city = normalizeCity(cityText);
  if (!locationText) errors.push('الموقع مفقود');
  else if (!city) errors.push(`مدينة غير مدعومة: "${cityText}"`);

  const description = c.description || '';
  if (!description) errors.push('الوصف مفقود');
  else if (description.length > 400) errors.push('الوصف أطول من 400 حرف');

  const price = parsePrice(c.price);
  if (price === null) errors.push(c.price ? `سعر غير مفهوم: "${c.price}"` : 'السعر مفقود');
  else if (price > 100000000) errors.push('السعر أكبر من 100 مليون');

  const area = parseWholeNumber(c.area);
  if (area === null) errors.push(c.area ? `مساحة غير مفهومة: "${c.area}"` : 'المساحة مفقودة');
  else if (area < 60) errors.push('المساحة أقل من 60 متر');

  const bedrooms = parseWholeNumber(c.bedrooms);
  if (bedrooms === null) errors.push('عدد غرف النوم مفقود');
  else if (bedrooms > 10) errors.push('عدد غرف النوم أكبر من 10');

  const bathrooms = parseWholeNumber(c.bathrooms);
  if (bathrooms === null) errors.push('عدد الحمامات مفقود');
  else if (bathrooms < 1 || bathrooms > 10) errors.push('عدد الحمامات يجب أن يكون من 1 إلى 10');

  const type = (c.type || '').trim();
  if (!type) errors.push('نوع العقار مفقود');
  else if (!(PROPERTY_TYPE_VALUES as readonly string[]).includes(type)) errors.push(`نوع عقار غير مدعوم: "${type}"`);

  const category = CATEGORY_WORDS[(c.category || '').trim()];
  if (!c.category) errors.push('الغرض (بيع/إيجار/سكن طلبة) مفقود');
  else if (!category) errors.push(`غرض غير مفهوم: "${c.category}"`);

  const contactName = (c.contactName || '').trim();
  if (!contactName) errors.push('اسم التواصل مفقود');
  const contactPhone = (c.contactPhone || '').trim();
  if (!contactPhone) errors.push('رقم الهاتف مفقود');

  const floor = parseWholeNumber(c.floor);

  const title = type && category && city ? `${type} ${CATEGORY_LABEL[category]} في ${city}`.slice(0, 70) : '';
  const label = title || locationText || `صف ${row.rowNumber}`;

  if (errors.length > 0) {
    return { rowNumber: row.rowNumber, label, errors, form: null };
  }

  // Only values read from the document; optional fields that are absent are omitted,
  // so server-side defaults apply instead of client guesses.
  const form = new FormData();
  form.append('category', category);
  form.append('type', type);
  form.append('title', title);
  form.append('description', description);
  form.append('price', String(price));
  form.append('area', String(area));
  form.append('bedrooms', String(bedrooms));
  form.append('bathrooms', String(bathrooms));
  form.append('location[city]', city as string);
  form.append('location[address]', locationText);
  form.append('contactInfo[name]', contactName);
  form.append('contactInfo[phone]', contactPhone);
  if (floor !== null) form.append('floor', String(floor));

  return { rowNumber: row.rowNumber, label, errors, form };
};

interface RowResult {
  rowNumber: number;
  label: string;
  ok: boolean;
  reason: string;
}

export default function AdminImportPropertiesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prepared, setPrepared] = useState<PreparedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<RowResult[]>([]);

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        router.push('/login');
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role !== 'admin') {
          showToast('غير مصرح لك بالوصول إلى هذه الصفحة', 'error');
          router.push('/');
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        showToast('خطأ في التحقق من الصلاحيات', 'error');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, showToast]);

  // Parsed rows are validated first and shown for review; nothing is sent yet.
  const handleImportedProperties = (rows: ImportRow[]) => {
    setResults([]);
    setPrepared(rows.map(prepareRow));
  };

  const validRows = prepared.filter((row) => row.form);
  const invalidRows = prepared.filter((row) => !row.form);

  const runImport = async () => {
    if (isImporting) return;
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('انتهت صلاحية الجلسة', 'error');
      return;
    }
    setIsImporting(true);

    // Rows that failed validation are reported as failed with their reasons.
    const collected: RowResult[] = invalidRows.map((row) => ({
      rowNumber: row.rowNumber,
      label: row.label,
      ok: false,
      reason: row.errors.join('، '),
    }));
    setResults([...collected]);

    let rateLimited = false;
    for (const row of validRows) {
      let result: RowResult;
      if (rateLimited) {
        result = { rowNumber: row.rowNumber, label: row.label, ok: false, reason: 'لم يُرسل: تم بلوغ حد الرفع، أعد المحاولة لاحقًا' };
      } else {
        try {
          const response = await fetch(`${API_URL}/properties/addProperty`, {
            method: 'POST',
            headers: authHeader(token),
            body: row.form as FormData,
          });
          if (response.ok) {
            result = { rowNumber: row.rowNumber, label: row.label, ok: true, reason: '' };
          } else {
            const body = await response.json().catch(() => ({}));
            if (response.status === 429) rateLimited = true;
            result = {
              rowNumber: row.rowNumber,
              label: row.label,
              ok: false,
              reason: `${response.status}: ${body?.message || 'خطأ من الخادم'}`,
            };
          }
        } catch (err) {
          result = { rowNumber: row.rowNumber, label: row.label, ok: false, reason: 'تعذر الاتصال بالخادم' };
        }
      }
      collected.push(result);
      setResults([...collected]);
    }

    collected.sort((a, b) => a.rowNumber - b.rowNumber);
    setResults([...collected]);
    setPrepared([]);
    setIsImporting(false);

    // Counted from the finished results, not from state captured mid-run.
    const succeeded = collected.filter((r) => r.ok).length;
    const failed = collected.length - succeeded;
    showToast(`تم الانتهاء من الاستيراد. نجح: ${succeeded}، فشل: ${failed}`, failed ? 'warning' : 'success');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>جاري التحقق من الصلاحيات...</Typography>
      </Container>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin')}
            sx={{ mr: 2 }}
          >
            العودة للوحة الإدارة
          </Button>
          <AdminIcon sx={{ fontSize: 32, color: colors.primary[600], mr: 2 }} />
          <Typography variant="h4" sx={{ color: colors.primary[600], fontWeight: 'bold' }}>
            استيراد العقارات من ملف Word
          </Typography>
        </Box>

        {/* Admin Notice */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            هذه الصفحة متاحة للمديرين فقط. يمكنك استيراد عدة عقارات دفعة واحدة من ملف Word.
          </Typography>
        </Alert>

        {/* Review before import */}
        {prepared.length > 0 && !isImporting && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              مراجعة الصفوف: {validRows.length} جاهز، {invalidRows.length} ناقص أو غير صالح
            </Typography>
            {invalidRows.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                الصفوف الناقصة لن تُستورد وستظهر كفاشلة مع السبب. أكمل بياناتها في الملف ثم أعد رفعه.
              </Alert>
            )}
            {validRows.length > UPLOADS_PER_WINDOW && (
              <Alert severity="info" sx={{ mb: 2 }}>
                الخادم يسمح بـ {UPLOADS_PER_WINDOW} عملية رفع كل 15 دقيقة؛ الصفوف بعد ذلك ستفشل وتحتاج إعادة.
              </Alert>
            )}
            <TableContainer sx={{ maxHeight: 400, mb: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>العقار</TableCell>
                    <TableCell>الحالة</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prepared.map((row) => (
                    <TableRow key={row.rowNumber}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell sx={{ color: row.form ? 'success.main' : 'error.main' }}>
                        {row.form ? 'جاهز' : row.errors.join('، ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={runImport} disabled={validRows.length === 0}>
                استيراد {validRows.length} عقار
              </Button>
              <Button variant="outlined" onClick={() => setPrepared([])}>
                إلغاء
              </Button>
            </Box>
          </Paper>
        )}

        {/* Import Progress */}
        {isImporting && (
          <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              جاري الاستيراد: {results.length} من {prepared.length}
            </Typography>
          </Paper>
        )}

        {/* Per-row results; they stay visible after the run */}
        {results.length > 0 && !isImporting && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              نتيجة الاستيراد: نجح {results.filter((r) => r.ok).length}، فشل {results.filter((r) => !r.ok).length}، المجموع {results.length}
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>العقار</TableCell>
                    <TableCell>النتيجة</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.rowNumber}>
                      <TableCell>{r.rowNumber}</TableCell>
                      <TableCell>{r.label}</TableCell>
                      <TableCell sx={{ color: r.ok ? 'success.main' : 'error.main' }}>
                        {r.ok ? 'تم النشر' : `فشل — ${r.reason}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Import Component */}
        {!isImporting && prepared.length === 0 && (
          <ImportProperties onImportComplete={handleImportedProperties} />
        )}

        {/* Instructions */}
        <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            تعليمات الاستخدام:
          </Typography>
          <Typography variant="body2" component="div">
            <ol>
              <li>قم بإنشاء ملف Word (.docx) يحتوي على جدول بالعقارات</li>
              <li>الصف الأول عناوين الأعمدة، وتُطابق بالاسم: الموقع، الوصف، السعر، المساحة، غرف النوم، الحمامات، النوع (شقة/فيلا/محل/استوديو/دوبلكس)، الغرض (بيع/إيجار/سكن طلبة)، اسم التواصل، الهاتف، والدور (اختياري)</li>
              <li>كل الأعمدة عدا الدور مطلوبة؛ الصف الذي ينقصه أي منها لا يُستورد ويظهر سببه في النتيجة</li>
              <li>الصف الأول يجب أن يحتوي على عناوين الأعمدة</li>
              <li>ارفع الملف باستخدام منطقة السحب والإفلات</li>
              <li>راجع العقارات المستخرجة قبل الاستيراد</li>
              <li>انقر على "متابعة للمراجعة" ثم "استيراد" لنشر الصفوف الجاهزة</li>
            </ol>
          </Typography>
        </Paper>
      </Paper>
    </Container>
  );
}
