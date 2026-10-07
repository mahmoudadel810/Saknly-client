"use client";
import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import ImportProperties, { ImportRow } from '@/shared/components/ImportProperties';
import { useToast } from '@/shared/provider/ToastProvider';
import { normalizeCity, PROPERTY_TYPE_VALUES } from '@/shared/constants/property';
import { api, getErrorMessage } from '@/shared/services/api';
import DataTable, { useDataTableState, type DataTableColumn } from '@/shared/ui/DataTable';
import PageHeader from '@/shared/ui/PageHeader';
import StatusBadge from '@/shared/ui/StatusBadge';
import AdminGuard from '@/shared/ui/admin/AdminGuard';
import { errorStatus } from '@/shared/ui/admin/errors';
import { formatCount } from '@/shared/ui/admin/format';

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


const STEPS = ['رفع الملف', 'مراجعة الصفوف', 'الاستيراد', 'النتيجة'];

/** A bordered panel for one step's content. */
function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Box
      component="section"
      sx={{ border: 1, borderColor: 'divider', borderRadius: '10px', bgcolor: 'background.paper', p: { xs: 2, md: 3 }, mb: 3 }}
    >
      {title && (
        <Typography component="h2" sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}

function Tally({ label, value, token }: { label: string; value: number; token: string }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '10px', px: 2, py: 1.5, minWidth: 120 }}>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: `var(${token})` }}>
        {formatCount(value)}
      </Typography>
    </Box>
  );
}

function ImportWorkflow() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [fileName, setFileName] = useState('');
  const [prepared, setPrepared] = useState<PreparedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<RowResult[]>([]);
  const reviewTable = useDataTableState({ pageSize: 25 });
  const resultsTable = useDataTableState({ pageSize: 25 });

  // Parsed rows are validated first and shown for review; nothing is sent yet.
  const handleImportedProperties = useCallback(
    (rows: ImportRow[], name: string) => {
      setResults([]);
      setFileName(name);
      setPrepared(rows.map(prepareRow));
      reviewTable.setPage(0);
    },
    [reviewTable]
  );

  const validRows = prepared.filter((row) => row.form);
  const invalidRows = prepared.filter((row) => !row.form);

  const runImport = async () => {
    if (isImporting) return;
    setIsImporting(true);

    // Rows that failed validation are reported as failed with their reasons.
    const collected: RowResult[] = invalidRows.map((row) => ({
      rowNumber: row.rowNumber,
      label: row.label,
      ok: false,
      reason: row.errors.join('، '),
    }));
    setResults([...collected]);

    // One request at a time; a 429 stops further sends (server fileUpload rate limit).
    let rateLimited = false;
    for (const row of validRows) {
      let result: RowResult;
      if (rateLimited) {
        result = { rowNumber: row.rowNumber, label: row.label, ok: false, reason: 'لم يُرسل: بلغ الخادم حد الرفع. أعد المحاولة بعد 15 دقيقة.' };
      } else {
        try {
          await api.post('/properties/addProperty', row.form as FormData);
          result = { rowNumber: row.rowNumber, label: row.label, ok: true, reason: '' };
        } catch (err) {
          const status = errorStatus(err);
          if (status === 429) rateLimited = true;
          result = {
            rowNumber: row.rowNumber,
            label: row.label,
            ok: false,
            reason:
              status === 429
                ? 'بلغ الخادم حد الرفع. أعد المحاولة بعد 15 دقيقة.'
                : status
                  ? getErrorMessage(err, `خطأ من الخادم (${status})`)
                  : 'تعذّر الاتصال بالخادم',
          };
        }
      }
      collected.push(result);
      setResults([...collected]);
    }

    collected.sort((a, b) => a.rowNumber - b.rowNumber);
    setResults([...collected]);
    setPrepared([]);
    setIsImporting(false);
    resultsTable.setPage(0);

    // Counted from the finished results, not from state captured mid-run.
    const succeeded = collected.filter((r) => r.ok).length;
    const failed = collected.length - succeeded;
    if (succeeded > 0) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'published-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    }
    showToast(
      failed ? `اكتمل الاستيراد: نجح ${formatCount(succeeded)}، وتعذّر ${formatCount(failed)}.` : `اكتمل الاستيراد: نجح ${formatCount(succeeded)}.`,
      failed ? 'warning' : 'success'
    );
  };

  const reset = () => {
    setPrepared([]);
    setResults([]);
    setFileName('');
  };

  const step = isImporting ? 2 : results.length > 0 ? 3 : prepared.length > 0 ? 1 : 0;
  const succeeded = results.filter((r) => r.ok).length;
  const processed = results.length;

  const reviewColumns: DataTableColumn<PreparedRow>[] = [
    { id: 'row', header: 'الصف', cell: (r) => <span className="num">{r.rowNumber}</span>, width: 64, cardLabel: 'الصف' },
    { id: 'label', header: 'العقار', card: 'title', cell: (r) => r.label },
    {
      id: 'state',
      header: 'الحالة',
      cell: (r) =>
        r.form ? (
          <StatusBadge status="approved" label="جاهز" />
        ) : (
          <Box>
            <StatusBadge status="denied" label="لن يُستورد" />
            <Typography variant="caption" color="error" component="p" sx={{ mt: 0.5 }}>
              {r.errors.join('، ')}
            </Typography>
          </Box>
        ),
    },
  ];

  const resultColumns: DataTableColumn<RowResult>[] = [
    { id: 'row', header: 'الصف', cell: (r) => <span className="num">{r.rowNumber}</span>, width: 64, cardLabel: 'الصف' },
    { id: 'label', header: 'العقار', card: 'title', cell: (r) => r.label },
    {
      id: 'result',
      header: 'النتيجة',
      cell: (r) => (r.ok ? <StatusBadge status="approved" label="نُشر" /> : <StatusBadge status="denied" label="لم يُستورد" />),
    },
    { id: 'reason', header: 'السبب', cell: (r) => (r.ok ? '—' : r.reason) },
  ];

  return (
    <>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }} aria-label="خطوات الاستيراد">
        {STEPS.map((label, index) => (
          <Step key={label} completed={index < step}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && (
        <>
          <Panel title="رفع ملف Word">
            <ImportProperties onImportComplete={handleImportedProperties} />
          </Panel>
          <Panel title="شكل الملف المطلوب">
            <Box component="ol" sx={{ m: 0, paddingInlineStart: 2.5, display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary', fontSize: '0.9375rem' }}>
              <li>ملف Word بصيغة .docx فيه جدول واحد أو أكثر، وصفه الأول عناوين الأعمدة.</li>
              <li>
                تُطابق الأعمدة بعناوينها: الموقع، الوصف، السعر، المساحة، غرف النوم، الحمامات، النوع (شقة أو فيلا أو محل أو
                استوديو أو دوبلكس)، الغرض (بيع أو إيجار أو سكن طلبة)، اسم التواصل، الهاتف، والدور (اختياري).
              </li>
              <li>كل الأعمدة مطلوبة عدا الدور. الصف الناقص لا يُستورد، ويظهر سببه في المراجعة وفي النتيجة.</li>
              <li>لا تُكمَل أي قيمة ناقصة تلقائيًا: ما يُنشر هو ما في الملف فقط.</li>
            </Box>
          </Panel>
        </>
      )}

      {step === 1 && (
        <Panel title={`مراجعة الصفوف${fileName ? `: ${fileName}` : ''}`}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            <Typography variant="body2">
              {formatCount(validRows.length)} جاهز للاستيراد، و{formatCount(invalidRows.length)} ناقص أو غير صالح.
            </Typography>
            {invalidRows.length > 0 && (
              <Alert severity="warning">الصفوف الناقصة لن تُستورد. أكمل بياناتها في الملف ثم ارفعه من جديد.</Alert>
            )}
            {validRows.length > UPLOADS_PER_WINDOW && (
              <Alert severity="info">
                يقبل الخادم {UPLOADS_PER_WINDOW} عملية رفع كل 15 دقيقة. يتوقف الاستيراد عند بلوغ الحد، وتظهر الصفوف المتبقية
                في النتيجة لتعيد رفعها لاحقًا.
              </Alert>
            )}
            <Alert severity="info">تُنشر الصفوف المستوردة في الموقع فورًا، لأنها تُضاف بحساب مشرف.</Alert>
          </Box>
          <DataTable
            label="صفوف الملف"
            rows={prepared}
            columns={reviewColumns}
            getRowId={(r) => String(r.rowNumber)}
            pagination={{
              page: reviewTable.page,
              pageSize: reviewTable.pageSize,
              onPageChange: reviewTable.setPage,
              onPageSizeChange: reviewTable.setPageSize,
              pageSizeOptions: [25, 50, 100],
            }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={reset}>
              اختيار ملف آخر
            </Button>
            <Button variant="contained" onClick={runImport} disabled={validRows.length === 0}>
              استيراد {formatCount(validRows.length)} {validRows.length === 1 ? 'عقار' : 'عقارات'}
            </Button>
          </Box>
        </Panel>
      )}

      {step === 2 && (
        <Panel title="جارٍ الاستيراد">
          <LinearProgress
            variant="determinate"
            value={prepared.length ? (processed / prepared.length) * 100 : 0}
            aria-label="تقدم الاستيراد"
            sx={{ height: 8, borderRadius: '6px', mb: 1.5 }}
          />
          <Typography variant="body2" role="status" aria-live="polite">
            عولج {formatCount(processed)} من {formatCount(prepared.length)} صفًا. لا تغلق الصفحة حتى ينتهي الاستيراد.
          </Typography>
        </Panel>
      )}

      {step === 3 && (
        <Panel title="نتيجة الاستيراد">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }} role="status">
            <Tally label="نُشر" value={succeeded} token="--c-success" />
            <Tally label="لم يُستورد" value={results.length - succeeded} token="--c-error" />
            <Tally label="المجموع" value={results.length} token="--c-text" />
          </Box>
          <DataTable
            label="نتيجة كل صف"
            rows={results}
            columns={resultColumns}
            getRowId={(r) => String(r.rowNumber)}
            pagination={{
              page: resultsTable.page,
              pageSize: resultsTable.pageSize,
              onPageChange: resultsTable.setPage,
              onPageSizeChange: resultsTable.setPageSize,
              pageSizeOptions: [25, 50, 100],
            }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button component={Link} href="/admin/dashboard/properties" variant="outlined">
              الانتقال إلى العقارات
            </Button>
            <Button variant="contained" startIcon={<UploadFileOutlined />} onClick={reset}>
              استيراد ملف آخر
            </Button>
          </Box>
        </Panel>
      )}
    </>
  );
}

export default function AdminImportPropertiesPage() {
  return (
    <>
      <PageHeader
        title="استيراد العقارات"
        description="أضف عدة عقارات دفعة واحدة من جدول في ملف Word، بعد مراجعة كل صف."
        breadcrumbs={[{ label: 'لوحة الإدارة', href: '/admin/dashboard' }, { label: 'استيراد العقارات' }]}
        actions={
          <Button component={Link} href="/admin/dashboard" variant="outlined">
            العودة إلى لوحة الإدارة
          </Button>
        }
      />
      <AdminGuard>
        <ImportWorkflow />
      </AdminGuard>
    </>
  );
}
