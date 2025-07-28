// Property form validation logic extracted from PropertyFormForSale.tsx

// Area constraints for each property type (matching backend)
export const areaConstraints = {
    'شقة': { min: 60, max: 220 },
    'محل': { min: 60, max: 220 },
    'استوديو': { min: 60, max: 100 },
    'دوبلكس': { min: 180, max: 300 },
    'فيلا': { min: 250, max: 600 },
    'تجاري': { min: 100, max: 500 }
  };
  
  export function getCurrentAreaConstraints(type: string) {
    return areaConstraints[type as keyof typeof areaConstraints] || { min: 1, max: 1000 };
  }
  
  // Main validation function
  export function validatePropertyForm(formData: any) {
    const newErrors: Record<string, string> = {};
    let isValid = true;
  
    // Required fields validation
    if (!formData.operationType) {
      newErrors.operationType = 'يجب اختيار نوع العملية';
      isValid = false;
    }
    if (!formData.type) {
      newErrors.type = 'يجب اختيار نوع العقار';
      isValid = false;
    }
    if (!formData.title) {
      newErrors.title = 'يجب إدخال عنوان الإعلان';
      isValid = false;
    } else if (formData.title.length > 70) {
      newErrors.title = 'عنوان الإعلان لا يمكن أن يتجاوز 70 حرف';
      isValid = false;
    }
    if (!formData.description) {
      newErrors.description = 'يجب إدخال وصف العقار';
      isValid = false;
    } else if (formData.description.length > 400) {
      newErrors.description = 'وصف العقار لا يمكن أن يتجاوز 400 حرف';
      isValid = false;
    }
    if (!formData.price) {
      newErrors.price = 'يجب إدخال السعر';
      isValid = false;
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        newErrors.price = 'السعر يجب أن يكون رقم موجب';
        isValid = false;
      } else if (priceValue > 100000000) {
        newErrors.price = 'السعر لا يمكن أن يتجاوز 100 مليون جنيه';
        isValid = false;
      }
    }
    if (!formData.area) {
      newErrors.area = 'يجب إدخال المساحة';
      isValid = false;
    } else {
      // Check if area contains only numbers
      const numericRegex = /^[0-9]+$/;
      if (!numericRegex.test(formData.area)) {
        newErrors.area = 'المساحة يجب أن تحتوي على أرقام فقط';
        isValid = false;
      } else {
        // Validate area based on property type (matching backend validation)
        const constraints = getCurrentAreaConstraints(formData.type);
        const areaValue = parseInt(formData.area);
        if (isNaN(areaValue) || areaValue < constraints.min || areaValue > constraints.max) {
          newErrors.area = `المساحة يجب أن تكون بين ${constraints.min} و ${constraints.max} متر مربع`;
          isValid = false;
        }
      }
    }
    if (formData.type !== 'محل') {
      if (!formData.bedrooms) {
        newErrors.bedrooms = 'يجب إدخال عدد غرف النوم';
        isValid = false;
      } else {
        const bedroomsValue = parseInt(formData.bedrooms);
        if (bedroomsValue < 0 || bedroomsValue > 10) {
          newErrors.bedrooms = 'عدد غرف النوم يجب أن يكون بين 0 و 10';
          isValid = false;
        }
      }
    }
    if (!formData.bathrooms) {
      newErrors.bathrooms = 'يجب إدخال عدد الحمامات';
      isValid = false;
    } else {
      const bathroomsValue = parseInt(formData.bathrooms);
      if (bathroomsValue < 1 || bathroomsValue > 10) {
        newErrors.bathrooms = 'عدد الحمامات يجب أن يكون بين 1 و 10';
        isValid = false;
      }
    }
    if (formData.images && formData.images.length < 1) {
      newErrors.images = 'يجب تحميل صورة واحدة على الأقل';
      isValid = false;
    }
    if (!formData.location) {
      newErrors.location = 'يجب اختيار المدينة';
      isValid = false;
    }
    // Validate district if provided
    if (formData.district && formData.district.length > 50) {
      newErrors.district = 'الحي/المنطقة لا يمكن أن يتجاوز 50 حرف';
      isValid = false;
    }
    if (!formData.contactInfo.name) {
      newErrors['contactInfo.name'] = 'يجب إدخال اسم المسؤول';
      isValid = false;
    } else {
      // Accept Arabic, English letters and spaces only
      const nameRegex = /^[A-Za-zء-ي\s]+$/;
      if (!nameRegex.test(formData.contactInfo.name)) {
        newErrors['contactInfo.name'] = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
        isValid = false;
      } else if (formData.contactInfo.name.length < 3) {
        newErrors['contactInfo.name'] = 'الاسم يجب أن يكون 3 أحرف على الأقل';
        isValid = false;
      } else if (formData.contactInfo.name.length > 25) {
        newErrors['contactInfo.name'] = 'الاسم لا يمكن أن يتجاوز 25 حرف';
        isValid = false;
      }
    }
    if (!formData.contactInfo.phone) {
      newErrors['contactInfo.phone'] = 'يجب إدخال رقم الهاتف';
      isValid = false;
    } else {
    }
  
    // Additional validations based on operation type (matching backend)
    if (formData.operationType === 'sale' && formData.paymentMethod !== 'cash') {
      if (!formData.downPayment) {
        newErrors.downPayment = 'يجب إدخال المقدم';
        isValid = false;
      }
      if (!formData.installmentPeriodInYears) {
        newErrors.installmentPeriodInYears = 'يجب إدخال فترة التقسيط';
        isValid = false;
      } else {
        const periodValue = parseInt(formData.installmentPeriodInYears);
        if (periodValue < 1 || periodValue > 30) {
          newErrors.installmentPeriodInYears = 'فترة التقسيط يجب أن تكون بين 1 و 30 سنة';
          isValid = false;
        }
      }
    }
  
    // Validate delivery terms length (matching backend)
    if (formData.deliveryTerms && formData.deliveryTerms.length > 300) {
      newErrors.deliveryTerms = 'شروط التسليم لا يمكن أن تتجاوز 300 حرف';
      isValid = false;
    }
  
    if (formData.operationType === 'rent' || formData.operationType === 'student') {
      if (!formData.leaseDuration) {
        newErrors.leaseDuration = 'يجب إدخال مدة الإيجار';
        isValid = false;
      } else {
        const durationValue = parseInt(formData.leaseDuration);
        if (durationValue < 1 || durationValue > 120) {
          newErrors.leaseDuration = 'مدة الإيجار يجب أن تكون بين 1 و 120 شهر';
          isValid = false;
        }
      }
      // Validate deposit if provided
      if (formData.deposit) {
        const numericRegex = /^[0-9]+$/;
        if (!numericRegex.test(formData.deposit)) {
          newErrors.deposit = 'مبلغ التأمين يجب أن يحتوي على أرقام فقط';
          isValid = false;
        } else {
          const depositValue = parseInt(formData.deposit);
          if (depositValue < 0 || depositValue > 100000000) {
            newErrors.deposit = 'مبلغ التأمين يجب أن يكون بين 0 و 100 مليون جنيه';
            isValid = false;
          }
        }
      }
      // Validate utilitiesCost if provided
      if (formData.utilitiesCost) {
        const numericRegex = /^[0-9]+$/;
        if (!numericRegex.test(formData.utilitiesCost)) {
          newErrors.utilitiesCost = 'تكلفة المرافق يجب أن تحتوي على أرقام فقط';
          isValid = false;
        } else {
          const costValue = parseInt(formData.utilitiesCost);
          if (costValue < 1 || costValue > 100000) {
            newErrors.utilitiesCost = 'تكلفة المرافق يجب أن تكون بين 1 و 100,000 جنيه';
            isValid = false;
          }
        }
      }
      // Validate utilitiesDetails if provided
      if (formData.utilitiesDetails && formData.utilitiesDetails.length > 200) {
        newErrors.utilitiesDetails = 'تفاصيل المرافق لا يمكن أن تتجاوز 200 حرف';
        isValid = false;
      }
      // Validate rulesOther if provided
      if (formData.rulesOther && formData.rulesOther.length > 300) {
        newErrors.rulesOther = 'الشروط الأخرى لا يمكن أن تتجاوز 300 حرف';
        isValid = false;
      }
    }
  
    // Student housing validation (matching backend)
    if (formData.operationType === 'student') {
      if (!formData.studentRoomType) {
        newErrors.studentRoomType = 'يجب اختيار نوع الغرفة';
        isValid = false;
      }
      if (!formData.studentsPerRoom) {
        newErrors.studentsPerRoom = 'يجب إدخال عدد الطلاب في الغرفة';
        isValid = false;
      } else {
        const studentsValue = parseInt(formData.studentsPerRoom);
        if (studentsValue < 1 || studentsValue > 4) {
          newErrors.studentsPerRoom = 'عدد الطلاب في الغرفة يجب أن يكون بين 1 و 4';
          isValid = false;
        }
      }
      if (!formData.studentGenderPolicy) {
        newErrors.studentGenderPolicy = 'يجب اختيار سياسة النوع';
        isValid = false;
      }
    }
  
    // Validate propertyStatus for sale
    if (formData.operationType === 'sale') {
      if (!formData.propertyStatus) {
        newErrors.propertyStatus = 'يجب اختيار حالة العقار';
        isValid = false;
      } else if (!["ready", "underConstruction"].includes(formData.propertyStatus)) {
        newErrors.propertyStatus = 'قيمة حالة العقار غير صحيحة';
        isValid = false;
      }
    }
  
    // Validate paymentMethod for sale
    if (formData.operationType === 'sale') {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'يجب اختيار طريقة الدفع';
        isValid = false;
      } else if (!["cash", "installment", "cashOrInstallment"].includes(formData.paymentMethod)) {
        newErrors.paymentMethod = 'قيمة طريقة الدفع غير صحيحة';
        isValid = false;
      }
    }
  
    // Validate email format if provided
    if (formData.contactInfo && formData.contactInfo.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
        newErrors['contactInfo.email'] = 'البريد الإلكتروني غير صحيح';
        isValid = false;
      }
    }
  
    // Validate floor and totalFloors
    if (formData.floor && formData.totalFloors) {
      const floorValue = parseInt(formData.floor);
      const totalFloorsValue = parseInt(formData.totalFloors);
      if (!isNaN(floorValue) && !isNaN(totalFloorsValue) && floorValue > totalFloorsValue) {
        newErrors.floor = 'لا يمكن أن يكون الطابق أكبر من إجمالي الطوابق';
        isValid = false;
      }
    }
  
    return { isValid, newErrors };
  } 