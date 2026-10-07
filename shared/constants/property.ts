// Property enums shared by the forms, filters and the importer.
// Keep these identical to the server enums in server/Model/PropertyModel.js
// (CITIES, PROPERTY_TYPES, AMENITIES and the category discriminator).

export const CITIES = [
  'شبين الكوم',
  'منوف',
  'تلا',
  'اشمون', // without hamza (server alias)
  'أشمون', // with hamza
  'قويسنا',
  'بركة السبع',
  'الباجور',
  'طنطا',
  'مدينة السادات',
] as const;

export type City = (typeof CITIES)[number];

// Cities offered in dropdowns and filters: the hamza-less 'اشمون' alias is accepted by the
// server but shown only once, as 'أشمون'.
export const CITY_OPTIONS: readonly City[] = CITIES.filter((city) => city !== 'اشمون');

// Known spellings that are not in the server enum, mapped to the enum value.
export const CITY_ALIASES: Record<string, City> = {
  'السادات': 'مدينة السادات',
  'مدينه السادات': 'مدينة السادات',
};

export const normalizeCity = (input: string | undefined | null): City | null => {
  const value = (input || '').trim();
  if (!value) return null;
  if ((CITIES as readonly string[]).includes(value)) return value as City;
  if (CITY_ALIASES[value]) return CITY_ALIASES[value];
  return null;
};

export const PROPERTY_TYPE_VALUES = ['شقة', 'فيلا', 'محل', 'استوديو', 'دوبلكس'] as const;

export const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPE_VALUES.map((value) => ({ value, label: value }));

export const AMENITIES = [
  'تكييف',
  'مصعد',
  'شرفة',
  'موقف سيارات',
  'مسموح بالحيوانات الأليفة',
  'مفروشة جزئياً',
  'أمن',
  'نظام كهرباء ذكي',
  'مطبخ مجهز',
  'مخزن',
] as const;

export const PROPERTY_CATEGORIES = ['sale', 'rent', 'student'] as const;
export type PropertyCategoryValue = (typeof PROPERTY_CATEGORIES)[number];
