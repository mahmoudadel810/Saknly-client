// The publish-listing form: its values, client-side rules and validation. Server rules live in
// server/modules/Property/propertyValidation.js and server/Model/PropertyModel.js; the per-type area ranges
// below are a client-only rule (the server only requires at least 20 m²).

export type OperationType = "" | "sale" | "rent" | "student";

export interface PropertyFormValues {
  operationType: OperationType;
  type: string;
  ownershipType: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  title: string;
  description: string;
  /** The governorate (location[governorate]); the server derives it from the city when missing. */
  governorate: string;
  /** The city (location[city]). */
  location: string;
  district: string;
  /** Street or landmark (location[address]); falls back to district and city when empty. */
  address: string;
  latitude: number;
  longitude: number;
  price: string;
  contactInfo: { name: string; phone: string; email: string; whatsapp: string };
  isNegotiable: boolean;
  floor: string;
  totalFloors: string;
  images: File[];
  deliveryDate: string;
  deliveryTerms: string;
  propertyStatus: string;
  paymentMethod: string;
  downPayment: string;
  installmentPeriodInYears: string;
  minInstallmentAmount: string;
  deposit: string;
  leaseDuration: string;
  availableFrom: string;
  utilitiesIncluded: boolean;
  utilitiesCost: string;
  utilitiesDetails: string;
  rulesPets: boolean;
  rulesParties: boolean;
  rulesOther: string;
  isStudentFriendly: boolean;
  studentRoomType: string;
  studentsPerRoom: string;
  studentGenderPolicy: string;
  academicYearOnly: boolean;
  semester: string;
  nearbyUniversities: { name: string; distanceInKm: string }[];
}

export const INITIAL_PROPERTY_FORM: PropertyFormValues = {
  operationType: "",
  type: "",
  ownershipType: "firstOwner",
  area: "",
  bedrooms: "",
  bathrooms: "",
  amenities: [],
  title: "",
  description: "",
  governorate: "",
  location: "",
  district: "",
  address: "",
  // Shebin El Kom, where Saknly started; the map re-centres on the chosen governorate.
  latitude: 30.5546,
  longitude: 31.0117,
  price: "",
  contactInfo: { name: "", phone: "", email: "", whatsapp: "" },
  isNegotiable: false,
  floor: "",
  totalFloors: "",
  images: [],
  deliveryDate: "",
  deliveryTerms: "",
  propertyStatus: "ready",
  paymentMethod: "cash",
  downPayment: "",
  installmentPeriodInYears: "",
  minInstallmentAmount: "",
  deposit: "",
  leaseDuration: "",
  availableFrom: "",
  utilitiesIncluded: false,
  utilitiesCost: "",
  utilitiesDetails: "",
  rulesPets: false,
  rulesParties: false,
  rulesOther: "",
  isStudentFriendly: false,
  studentRoomType: "",
  studentsPerRoom: "",
  studentGenderPolicy: "",
  academicYearOnly: false,
  semester: "",
  nearbyUniversities: [{ name: "", distanceInKm: "" }],
};

/** Server and form limits shown in helper text. */
export const LIMITS = {
  title: 70,
  description: 400,
  address: 300,
  district: 50,
  terms: 300,
  maxPrice: 500_000_000,
  contactName: 25,
} as const;

// Area ranges per property type (client rule). Wide enough for Cairo studios and New Cairo villas.
export const areaConstraints = {
  شقة: { min: 30, max: 600 },
  محل: { min: 20, max: 1000 },
  استوديو: { min: 20, max: 150 },
  دوبلكس: { min: 100, max: 800 },
  فيلا: { min: 150, max: 3000 },
} as const;

export function getCurrentAreaConstraints(type: string) {
  return areaConstraints[type as keyof typeof areaConstraints] || { min: 20, max: 5000 };
}

/** A shop has no bedrooms; the server still requires the field, so the form sends 0. */
export const isShop = (type: string) => type === "محل";

/** Western digits only: Arabic-Indic (٠-٩) and Persian (۰-۹) digits are converted, anything else dropped. */
export function toDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
}

/** Like toDigits, but keeps one decimal point (the Arabic decimal separator ٫ counts as one): "١٫٥" -> "1.5". */
export function toDecimal(value: string): string {
  const [whole, ...rest] = value.replace(/[٫,]/g, ".").split(".");
  return rest.length ? `${toDigits(whole)}.${toDigits(rest.join(""))}` : toDigits(whole);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Egyptian mobiles (01 + 9 digits) and landlines with an area code (0 + 9 digits).
const PHONE_PATTERN = /^0\d{9,10}$/;

export function validatePropertyForm(formData: PropertyFormValues) {
  const e: Record<string, string> = {};
  const sale = formData.operationType === "sale";
  const rental = formData.operationType === "rent" || formData.operationType === "student";
  const student = formData.operationType === "student";

  // Basics
  if (!formData.operationType) e.operationType = "اختر نوع الإعلان: بيع أو إيجار أو سكن طلاب.";
  if (!formData.type) e.type = "اختر نوع العقار.";
  if (!formData.title.trim()) e.title = "اكتب عنوانًا للإعلان.";
  else if (formData.title.length > LIMITS.title) e.title = `العنوان حتى ${LIMITS.title} حرفًا.`;
  if (!formData.description.trim()) e.description = "اكتب وصفًا للعقار.";
  else if (formData.description.length > LIMITS.description) e.description = `الوصف حتى ${LIMITS.description} حرف.`;

  // Price and terms
  if (!formData.price) e.price = "اكتب السعر.";
  else if (Number(formData.price) > LIMITS.maxPrice) e.price = "السعر لا يزيد على 500 مليون جنيه.";
  if (sale && formData.paymentMethod !== "cash") {
    if (!formData.downPayment) e.downPayment = "اكتب قيمة المقدم.";
    if (!formData.installmentPeriodInYears) e.installmentPeriodInYears = "اختر مدة التقسيط.";
  }
  if (formData.deliveryTerms.length > LIMITS.terms) e.deliveryTerms = `شروط التسليم حتى ${LIMITS.terms} حرف.`;
  if (rental) {
    if (!formData.leaseDuration) e.leaseDuration = "اختر مدة الإيجار.";
    if (formData.deposit && Number(formData.deposit) > LIMITS.maxPrice)
      e.deposit = "التأمين لا يزيد على 500 مليون جنيه.";
    if (formData.rulesOther.length > LIMITS.terms) e.rulesOther = `الشروط حتى ${LIMITS.terms} حرف.`;
  }

  // Location
  if (!formData.governorate) e.governorate = "اختر المحافظة.";
  if (!formData.location) e.location = "اختر المدينة.";
  if (formData.district.length > LIMITS.district) e.district = `اسم الحي حتى ${LIMITS.district} حرفًا.`;
  if (formData.address.length > LIMITS.address) e.address = `العنوان حتى ${LIMITS.address} حرف.`;

  // Details
  if (!formData.area) e.area = "اكتب المساحة.";
  else {
    const { min, max } = getCurrentAreaConstraints(formData.type);
    const area = Number(formData.area);
    if (area < min || area > max) e.area = `المساحة بين ${min} و${max} م².`;
  }
  if (!isShop(formData.type) && formData.bedrooms === "") e.bedrooms = "اختر عدد غرف النوم.";
  if (!formData.bathrooms) e.bathrooms = "اختر عدد الحمامات.";
  if (formData.floor && formData.totalFloors && Number(formData.floor) > Number(formData.totalFloors)) {
    e.floor = "الدور أعلى من عدد أدوار المبنى.";
  }
  if (student) {
    if (!formData.studentRoomType) e.studentRoomType = "اختر نوع الغرفة.";
    if (!formData.studentsPerRoom) e.studentsPerRoom = "اختر عدد الطلاب في الغرفة.";
    if (!formData.studentGenderPolicy) e.studentGenderPolicy = "اختر الفئة المسموح بها.";
  }

  // Photos
  if (formData.images.length < 1) e.images = "أضف صورة واحدة على الأقل.";

  // Contact
  const name = formData.contactInfo.name.trim();
  if (!name) e["contactInfo.name"] = "اكتب اسم من يرد على المتصلين.";
  else if (!/^[A-Za-zء-ي\s]+$/.test(name)) e["contactInfo.name"] = "الاسم بالحروف العربية أو الإنجليزية فقط.";
  else if (name.length < 3 || name.length > LIMITS.contactName)
    e["contactInfo.name"] = `الاسم من 3 إلى ${LIMITS.contactName} حرفًا.`;
  if (!formData.contactInfo.phone) e["contactInfo.phone"] = "اكتب رقم الهاتف.";
  else if (!PHONE_PATTERN.test(formData.contactInfo.phone))
    e["contactInfo.phone"] = "اكتب رقمًا مصريًا يبدأ بـ 0، مثل 01012345678.";
  if (formData.contactInfo.whatsapp && !/^01\d{9}$/.test(formData.contactInfo.whatsapp)) {
    e["contactInfo.whatsapp"] = "اكتب رقم موبايل من 11 رقمًا يبدأ بـ 01.";
  }
  if (formData.contactInfo.email && !EMAIL_PATTERN.test(formData.contactInfo.email)) {
    e["contactInfo.email"] = "البريد الإلكتروني غير صحيح.";
  }

  return { isValid: Object.keys(e).length === 0, newErrors: e };
}

/** The order fields appear in, so the first invalid one can be focused. */
export const FIELD_ORDER = [
  "operationType",
  "type",
  "title",
  "description",
  "price",
  "downPayment",
  "installmentPeriodInYears",
  "deliveryTerms",
  "deposit",
  "leaseDuration",
  "rulesOther",
  "governorate",
  "location",
  "district",
  "address",
  "area",
  "bedrooms",
  "bathrooms",
  "floor",
  "studentRoomType",
  "studentsPerRoom",
  "studentGenderPolicy",
  "images",
  "contactInfo.name",
  "contactInfo.phone",
  "contactInfo.email",
  "contactInfo.whatsapp",
] as const;
