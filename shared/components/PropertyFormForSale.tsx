"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/shared/provider/ToastProvider";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { API_URL, authHeader, clearAuthToken, getToken } from "@/shared/utils/auth";
import FileCompressor, { UPLOAD_LIMITS } from "@/shared/utils/fileCompression";
import {
  FIELD_ORDER,
  INITIAL_PROPERTY_FORM,
  isShop,
  validatePropertyForm,
  type PropertyFormValues,
} from "@/shared/utils/propertyFormValidation";
import { useUnsavedChangesGuard } from "@/shared/ui/form/useUnsavedChangesGuard";
import { saveDraft, takeDraft } from "@/shared/ui/form/property/draft";
import { focusField } from "@/shared/ui/form/property/fields";
import BasicsSection from "@/shared/ui/form/property/BasicsSection";
import PriceSection from "@/shared/ui/form/property/PriceSection";
import LocationSection from "@/shared/ui/form/property/LocationSection";
import DetailsSection from "@/shared/ui/form/property/DetailsSection";
import PhotosSection from "@/shared/ui/form/property/PhotosSection";
import ContactSection from "@/shared/ui/form/property/ContactSection";

const LOGIN_PATH = "/login?redirect=%2FuploadProperty";

/** The multipart body of POST /properties/addProperty (field names match server/modules/Property). */
function toFormData(v: PropertyFormValues): FormData {
  const fd = new FormData();
  const add = (key: string, value: string | undefined | null) => {
    if (value !== undefined && value !== null && value !== "") fd.append(key, value);
  };
  v.images.forEach((image) => fd.append("images", image));
  add("category", v.operationType);
  add("type", v.type);
  add("title", v.title.trim());
  add("description", v.description.trim());
  add("price", v.price);
  add("area", v.area);
  // The server requires bedrooms; a shop has none.
  add("bedrooms", isShop(v.type) ? "0" : v.bedrooms);
  add("bathrooms", v.bathrooms);
  add("location[city]", v.location);
  add("location[district]", v.district.trim());
  // The server requires an address: fall back to "district، city" when the owner left it empty.
  add("location[address]", v.address.trim() || [v.district.trim(), v.location].filter(Boolean).join("، "));
  add("location[latitude]", String(v.latitude));
  add("location[longitude]", String(v.longitude));
  add("floor", v.floor);
  add("totalFloors", v.totalFloors);
  add("contactInfo[name]", v.contactInfo.name.trim());
  add("contactInfo[phone]", v.contactInfo.phone);
  add("contactInfo[email]", v.contactInfo.email.trim());
  add("contactInfo[whatsapp]", v.contactInfo.whatsapp);
  fd.append("isNegotiable", String(v.isNegotiable));
  // multer parses repeated `amenities[]` fields into an array.
  v.amenities.forEach((amenity) => fd.append("amenities[]", amenity));

  if (v.operationType === "sale") {
    add("ownershipType", v.ownershipType);
    add("propertyStatus", v.propertyStatus);
    add("paymentMethod", v.paymentMethod);
    if (v.paymentMethod !== "cash") {
      add("downPayment", v.downPayment);
      add("installmentPeriodInYears", v.installmentPeriodInYears);
      add("minInstallmentAmount", v.minInstallmentAmount);
    }
    add("deliveryDate", v.deliveryDate);
    add("deliveryTerms", v.deliveryTerms.trim());
  }

  if (v.operationType === "rent" || v.operationType === "student") {
    add("deposit", v.deposit);
    add("leaseDuration", v.leaseDuration);
    add("availableFrom", v.availableFrom);
    fd.append("utilities[included]", String(v.utilitiesIncluded));
    add("utilities[cost]", v.utilitiesCost);
    add("utilities[details]", v.utilitiesDetails);
    fd.append("rules[pets]", String(v.rulesPets));
    fd.append("rules[parties]", String(v.rulesParties));
    add("rules[other]", v.rulesOther.trim());
  }

  if (v.operationType === "student") {
    fd.append("isStudentFriendly", "true");
    fd.append("studentHousingDetails[isEnabled]", "true");
    add("studentHousingDetails[roomType]", v.studentRoomType);
    add("studentHousingDetails[studentsPerRoom]", v.studentsPerRoom);
    add("studentHousingDetails[genderPolicy]", v.studentGenderPolicy);
    fd.append("studentHousingDetails[academicYearOnly]", String(v.academicYearOnly));
    add("studentHousingDetails[semester]", v.semester);
    v.nearbyUniversities
      .filter((u) => u.name.trim() && u.distanceInKm)
      .forEach((u, i) => {
        fd.append(`studentHousingDetails[nearbyUniversities][${i}][name]`, u.name.trim());
        fd.append(`studentHousingDetails[nearbyUniversities][${i}][distanceInKm]`, u.distanceInKm);
      });
  }
  return fd;
}

const isDirty = (v: PropertyFormValues) => {
  const { images, ...rest } = v;
  const { images: _initialImages, ...initial } = INITIAL_PROPERTY_FORM;
  return images.length > 0 || JSON.stringify(rest) !== JSON.stringify(initial);
};

/** True when the stored token is missing or past its expiry (checked before uploading photos). */
function sessionExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return typeof exp === "number" && exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

/**
 * The publish-listing form: six sections sharing one state, a draft kept across an expired session, an
 * unsaved-changes guard, and a review notice. Uploads stay on fetch (multipart with photos) so a 401 can be
 * handled here without the shared client's redirect dropping the form.
 */
export default function PropertyFormForSale() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const [values, setValues] = useState<PropertyFormValues>(INITIAL_PROPERTY_FORM);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [done, setDone] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  /** Set once the user chose to leave (or must sign in again), so the guard lets the navigation through. */
  const [leaving, setLeaving] = useState(false);
  const previewsRef = useRef<string[]>([]);
  previewsRef.current = previews;

  // Restore the text fields saved when the session expired (photos cannot be saved).
  useEffect(() => {
    const draft = takeDraft();
    if (draft) {
      setValues({ ...INITIAL_PROPERTY_FORM, ...draft, images: [] });
      setRestored(true);
    }
  }, []);

  // Release the photo previews when leaving the page.
  useEffect(() => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const dirty = isDirty(values);
  useUnsavedChangesGuard(dirty && !done && !submitting && !leaving, setLeaveTo);

  const setField = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => {
        let next: PropertyFormValues;
        if (name.startsWith("contactInfo.")) {
          next = { ...prev, contactInfo: { ...prev.contactInfo, [name.slice("contactInfo.".length)]: value } };
        } else {
          next = { ...prev, [name]: value } as PropertyFormValues;
        }
        if (name === "operationType") {
          const student = value === "student";
          next.isStudentFriendly = student;
          next.utilitiesIncluded = student;
          if (student && isShop(next.type)) next.type = "";
        }
        if (name === "type" && isShop(String(value))) next.bedrooms = "";
        return next;
      });
      // After a failed submit, re-check as the user fixes fields.
      if (submitted) {
        setErrors((prev) => {
          if (!prev[name]) return prev;
          const rest = { ...prev };
          delete rest[name];
          return rest;
        });
      }
    },
    [submitted],
  );

  const addPhotos = async (files: File[]) => {
    const room = UPLOAD_LIMITS.maxFiles - values.images.length;
    if (files.length > room) {
      setErrors((prev) => ({ ...prev, images: `يمكنك إضافة ${UPLOAD_LIMITS.maxFiles} صور كحد أقصى.` }));
      return;
    }
    for (const file of files) {
      const check = FileCompressor.validateFile(file);
      if (!check.isValid) {
        setErrors((prev) => ({ ...prev, images: check.error ?? "هذا الملف غير مدعوم." }));
        return;
      }
    }
    setProcessingPhotos(true);
    try {
      const compressed = (await FileCompressor.compressFiles(files)).map((c) => c.file);
      const tooBig = compressed.find((f) => f.size > UPLOAD_LIMITS.maxFileBytes);
      if (tooBig) {
        setErrors((prev) => ({ ...prev, images: `«${tooBig.name}» أكبر من 4 ميجابايت حتى بعد التصغير.` }));
        return;
      }
      const total = FileCompressor.getTotalSize([...values.images, ...compressed]);
      if (total > UPLOAD_LIMITS.maxTotalBytes) {
        setErrors((prev) => ({
          ...prev,
          images: `حجم الصور معًا ${FileCompressor.formatFileSize(total)}، والحد 4 ميجابايت. احذف صورة أو اختر صورًا أصغر.`,
        }));
        return;
      }
      setValues((prev) => ({ ...prev, images: [...prev.images, ...compressed] }));
      setPreviews((prev) => [...prev, ...compressed.map((f) => URL.createObjectURL(f))]);
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.images;
        return rest;
      });
    } finally {
      setProcessingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setValues((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const resetForm = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
    setValues(INITIAL_PROPERTY_FORM);
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
    setRestored(false);
    setDone(false);
    window.scrollTo({ top: 0 });
  };

  /** Keep the text fields, then send the user to sign in again and back here. */
  const reLogin = () => {
    saveDraft(values);
    clearAuthToken();
    // A client navigation keeps the context's user; clear it so /login shows the form, not "already signed in".
    setUser(null);
    showToast("انتهت جلستك. سجّل الدخول، وسنعيد إليك ما كتبته عدا الصور.", "warning");
    setLeaving(true);
    router.push(LOGIN_PATH);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || processingPhotos) return;
    setSubmitted(true);
    setSubmitError(null);

    const { isValid, newErrors } = validatePropertyForm(values);
    setErrors(newErrors);
    if (!isValid) {
      const first = FIELD_ORDER.find((name) => newErrors[name]);
      if (first) focusField(first);
      return;
    }
    if (sessionExpired()) {
      reLogin();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/properties/addProperty`, {
        method: "POST",
        headers: authHeader(),
        body: toFormData(values),
      });
      if (res.status === 401) {
        reLogin();
        return;
      }
      if (!res.ok) {
        setSubmitError(
          res.status === 413
            ? "حجم الصور أكبر من المسموح. احذف صورة أو أكثر ثم حاول مرة أخرى."
            : res.status === 400
              ? "رفض الخادم بعض البيانات. راجع الحقول ثم حاول مرة أخرى."
              : "لم نتمكن من إرسال الإعلان الآن. بياناتك ما زالت هنا؛ حاول مرة أخرى بعد قليل.",
        );
        return;
      }
      setDone(true);
      if (isAdmin) {
        showToast("نُشر العقار", "success");
        router.push("/properties");
      } else {
        showToast("أُرسل الإعلان للمراجعة", "success");
        window.scrollTo({ top: 0 });
      }
    } catch {
      setSubmitError("تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى؛ بياناتك ما زالت هنا.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done && !isAdmin) {
    return (
      <Box
        role="status"
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          bgcolor: "background.paper",
          p: { xs: 3, md: 5 },
          textAlign: "center",
        }}
      >
        <CheckCircleOutlined aria-hidden sx={{ fontSize: 48, color: "success.main" }} />
        <Typography component="h2" variant="h4" sx={{ mt: 1 }}>
          أُرسل إعلانك للمراجعة
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: "52ch", mx: "auto" }}>
          سيراجعه فريق سكنلي، ويظهر في نتائج البحث بعد قبوله. تابع حالته من «حسابي».
        </Typography>
        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
          <Button component={Link} href="/userProfile" variant="contained">
            متابعة إعلاناتي
          </Button>
          <Button onClick={resetForm} variant="outlined">
            إضافة عقار آخر
          </Button>
        </Box>
      </Box>
    );
  }

  const errorCount = Object.keys(errors).length;
  const sectionProps = { values, errors, setField };

  return (
    <>
      {restored && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={resetForm}>
              البدء من جديد
            </Button>
          }
        >
          استعدنا ما كتبته قبل تسجيل الدخول. الصور لا تُحفظ، فأضفها من جديد.
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        aria-label="بيانات الإعلان"
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <BasicsSection {...sectionProps} />
        <PriceSection {...sectionProps} />
        <LocationSection {...sectionProps} />
        <DetailsSection {...sectionProps} />
        <PhotosSection
          previews={previews}
          error={errors.images}
          processing={processingPhotos}
          onAdd={addPhotos}
          onRemove={removePhoto}
        />
        <ContactSection {...sectionProps} />

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "10px",
            bgcolor: "var(--c-surface-2)",
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div aria-live="polite">
            {submitted && errorCount > 0 && (
              <Alert severity="error" variant="outlined">
                {errorCount === 1 ? "حقل واحد يحتاج إلى مراجعة." : `${errorCount} حقول تحتاج إلى مراجعة.`} انتقلنا إلى
                أولها.
              </Alert>
            )}
            {submitError && (
              <Alert severity="error" variant="outlined">
                {submitError}
              </Alert>
            )}
          </div>
          <Typography variant="body2" color="text.secondary">
            {isAdmin
              ? "أنت مشرف، فسيُنشر الإعلان مباشرة دون مراجعة."
              : "بعد الإرسال يراجع فريق سكنلي الإعلان، ويظهر في البحث بعد قبوله."}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 1.5 }}>
            <Button component={Link} href="/userProfile" color="inherit" disabled={submitting}>
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || processingPhotos}
              aria-busy={submitting || undefined}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
              sx={{ minWidth: 200 }}
            >
              {submitting ? "جارٍ الإرسال…" : isAdmin ? "نشر الإعلان" : "إرسال الإعلان للمراجعة"}
            </Button>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={Boolean(leaveTo)}
        title="مغادرة الصفحة؟"
        description="لم ترسل الإعلان بعد. إن غادرت الآن ستفقد البيانات والصور التي أضفتها."
        confirmLabel="مغادرة الصفحة"
        cancelLabel="البقاء وإكمال الإعلان"
        onConfirm={() => {
          const target = leaveTo;
          setLeaving(true);
          setLeaveTo(null);
          if (target) router.push(target);
        }}
        onClose={() => setLeaveTo(null)}
      />
    </>
  );
}
