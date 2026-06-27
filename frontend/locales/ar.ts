export const ar = {
  common: {
    navbar: {
      home: "الرئيسية",
      flights: "رحلات الطيران",
      hotels: "الفنادق",
      bookings: "الحجوزات",
      dashboard: "لوحة التحكم",
      profile: "الملف الشخصي",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      logout: "تسجيل الخروج",
      notifications: "الإشعارات",
      markAllRead: "تحديد الكل كمقروء",
      clearAll: "مسح الكل",
      noNotifications: "لا توجد إشعارات",
      confirmClear: "هل تريد مسح جميع الإشعارات؟ 🧹",
      start: "ابدأ الآن"
    },
    footer: {
      description: "احجز رحلات طيران وفنادق بأفضل الأسعار. دفع آمن وتأكيد فوري ودعم على مدار الساعة.",
      rights: "© {year} FlightHotel. جميع الحقوق محفوظة."
    },
    roles: {
      ADMIN: "مدير النظام",
      HOTEL_MANAGER: "مدير الفندق",
      FLIGHT_MANAGER: "مدير الرحلات",
      CLIENT: "عميل"
    },
    status: {
      SCHEDULED: "مجدولة",
      BOARDING: "صعود الطائرة",
      DEPARTED: "مغادرة",
      ARRIVED: "وصلت",
      CANCELLED: "ملغاة",
      DELAYED: "متأخرة",
      CONFIRMED: "مؤكد",
      PENDING: "قيد الانتظار",
      PAID: "مدفوع",
      REFUNDED: "مسترجع",
      FAILED: "فاشل"
    },
    loading: "جاري التحميل...",
    submitting: "جاري المعالجة...",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    actions: "الإجراءات",
    back: "رجوع"
  },
  home: {
    hero: {
      title: "رحلتك تبدأ من هنا",
      subtitle: "اكتشف أفضل العروض على رحلات الطيران والفنادق حول العالم.",
      searchFlights: "البحث عن رحلات طيران",
      searchHotels: "البحث عن فنادق"
    },
    searchForm: {
      from: "من",
      fromPlaceholder: "مدينة المغادرة",
      to: "إلى",
      toPlaceholder: "الوجهة",
      date: "التاريخ",
      passengers: "المسافرون",
      search: "بحث",
      city: "المدينة",
      cityPlaceholder: "وجهتك (المدينة)",
      checkIn: "الوصول",
      checkOut: "المغادرة",
      guests: "الضيوف"
    },
    features: {
      bestPrice: "ضمان أفضل الأسعار",
      bestPriceDesc: "هل وجدت سعراً أقل؟ سنقوم بمطابقته ونمنحك خصماً إضافياً.",
      support: "دعم 24/7",
      supportDesc: "فريق الدعم المخصص لدينا متواجد دائماً لمساعدتك أثناء رحلاتك.",
      booking: "حجز سهل وسريع",
      bookingDesc: "احجز رحلات الطيران والفنادق في بضع نقرات فقط مع دفع آمن."
    }
  },
  auth: {
    login: {
      title: "مرحباً بعودتك",
      subtitle: "قم بتسجيل الدخول لإدارة حجوزاتك وملفك الشخصي",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      button: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      signUp: "أنشئ حساباً",
      forgotPass: "نسيت كلمة المرور؟",
      success: "تم تسجيل الدخول بنجاح! 👋",
      error: "بيانات الاعتماد غير صالحة"
    },
    register: {
      title: "إنشاء حساب جديد",
      subtitle: "انضم إلينا للبدء في حجز الرحلات والفنادق",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      button: "إنشاء حساب",
      haveAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
      success: "تم إنشاء الحساب بنجاح! 🎉",
      error: "فشل إنشاء الحساب"
    },
    forgot: {
      title: "نسيت كلمة المرور",
      subtitle: "أدخل بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور",
      email: "البريد الإلكتروني",
      button: "إرسال رابط إعادة التعيين",
      backToLogin: "العودة لتسجيل الدخول",
      success: "تم إرسال الرابط! تفقد بريدك الإلكتروني.",
      error: "فشل إرسال الرابط"
    },
    reset: {
      title: "إعادة تعيين كلمة المرور",
      subtitle: "أدخل كلمة المرور الجديدة وقم بتأكيدها أدناه",
      password: "كلمة المرور الجديدة",
      confirm: "تأكيد كلمة المرور الجديدة",
      button: "إعادة تعيين كلمة المرور",
      success: "تمت إعادة تعيين كلمة المرور بنجاح! 🎉",
      error: "فشل إعادة تعيين كلمة المرور"
    }
  },
  flights: {
    search: {
      title: "البحث عن رحلات",
      results: "تم العثور على {count} رحلة",
      searching: "جاري البحث...",
      pricePerPerson: "للشخص الواحد",
      noFlights: "لم يتم العثور على رحلات",
      noFlightsDesc: "حاول تعديل معايير البحث الخاصة بك",
      seatsLeft: "تبقت {count} مقاعد"
    },
    filters: {
      title: "الفلاتر",
      priceRange: "نطاق السعر",
      min: "الأدنى",
      max: "الأقصى",
      airline: "شركة الطيران",
      allAirlines: "جميع الشركات",
      clear: "مسح الفلاتر"
    }
  },
  hotels: {
    search: {
      title: "البحث عن فنادق",
      results: "تم العثور على {count} فندق",
      searching: "جاري البحث...",
      pricePerNight: "بدءاً من {price} / ليلة",
      onRequest: "الغرف متوفرة عند الطلب",
      noHotels: "لم يتم العثور على فنادق",
      noHotelsDesc: "حاول تعديل معايير البحث الخاصة بك",
      roomsCount: "{count} غرف"
    },
    filters: {
      title: "الفلاتر",
      stars: "النجوم",
      anyStars: "أي تصنيف",
      andUp: "فما فوق",
      pricePerNight: "سعر الليلة",
      clear: "مسح الفلاتر"
    }
  },
  profile: {
    title: "ملفي الشخصي",
    subtitle: "إدارة معلوماتك الشخصية",
    personalInfo: "المعلومات الشخصية",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    role: "صلاحية الحساب",
    memberSince: "عضو منذ",
    editBtn: "تعديل الملف الشخصي",
    cancelBtn: "إلغاء",
    saveBtn: "حفظ التغييرات",
    success: "تم تحديث الملف الشخصي بنجاح! 🎉",
    error: "فشل تحديث الملف الشخصي"
  },
  reservations: {
    title: "حجوزاتي",
    subtitle: "إدارة حجوزات الطيران والفنادق الخاصة بك",
    flightsTab: "الرحلات",
    hotelsTab: "الفنادق",
    empty: "لم يتم العثور على أي حجوزات",
    emptyDesc: "ابدأ في استكشاف الرحلات والفنادق لإجراء حجز جديد!",
    flightCard: {
      seats: "المقاعد: {count}",
      class: "الدرجة: {class}",
      amount: "المبلغ الإجمالي",
      download: "تحميل التذكرة",
      cancel: "إلغاء الرحلة"
    },
    hotelCard: {
      room: "غرفة {roomNumber} ({type})",
      checkIn: "الوصول",
      checkOut: "المغادرة",
      amount: "المبلغ الإجمالي",
      download: "تحميل الوثيقة",
      cancel: "إلغاء الحجز"
    },
    cancellation: {
      confirm: "هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟",
      success: "تم إلغاء الحجز بنجاح! 💸",
      error: "فشل إلغاء الحجز"
    }
  },
  payment: {
    title: "إتمام عملية الدفع",
    summary: "تفاصيل الحجز",
    secure: "دفع آمن ومحمي",
    ssl: "تشفير SSL 256 بت",
    methodCard: "💳 بطاقة بنكية",
    methodPaypal: "🅿️ باي بال",
    cardHolder: "اسم حامل البطاقة",
    cardNumber: "رقم البطاقة",
    expiryMonth: "الشهر",
    expiryYear: "السنة",
    cvv: "رمز الأمان CVV",
    simulated: "⚠️ دفع تجريبي — استخدم أي تنسيق بطاقة صحيح",
    payBtn: "دفع {amount}",
    payNow: "ادفع الآن",
    success: {
      title: "تم الدفع بنجاح!",
      transaction: "رقم المعاملة",
      instruction: "تفقد بريدك الإلكتروني للحصول على {type}.",
      boardingPass: "بطاقة صعود الطائرة",
      voucher: "سند إقامة الفندق",
      downloadBtn: "تحميل ملف PDF",
      viewBookings: "عرض الحجوزات",
      toast: "تمت عملية الدفع بنجاح! 🎉"
    },
    errors: {
      fields: "يرجى ملء جميع حقول الدفع",
      failed: "فشلت عملية الدفع"
    }
  },
  dashboard: {
    admin: {
      title: "لوحة التحكم",
      welcome: "مرحباً بعودتك، {name} — {role}",
      users: "إجمالي المستخدمين",
      bookings: "إجمالي الحجوزات",
      revenue: "إجمالي الإيرادات",
      activeFlights: "الرحلات النشطة",
      recentFlights: "حجوزات الرحلات الأخيرة",
      recentUsers: "أحدث الأعضاء الجدد",
      monthlyReservations: "الحجوزات الشهرية",
      monthlyRevenue: "الإيرادات الشهرية",
      revenueByHotel: "الإيرادات حسب الفندق",
      revenueByAirline: "الإيرادات حسب شركة الطيران"
    },
    flightManager: {
      title: "لوحة تحكم مدير الرحلات",
      subtitle: "مرحباً بعودتك، {name}. نظرة عامة على الرحلات النشطة.",
      recentFlights: "أحدث الرحلات",
      table: {
        flight: "الرحلة",
        route: "المسار",
        departure: "المغادرة",
        seats: "المقاعد",
        status: "الحالة"
      }
    },
    hotelManager: {
      title: "لوحة تحكم مدير الفندق",
      subtitle: "مرحباً بعودتك، {name}. إليك نظرة عامة على منشآتك.",
      noProperties: "لا توجد فنادق بعد",
      noPropertiesDesc: "لم يتم تعيين أي فنادق لإدارتها بعد. يرجى التواصل مع المدير.",
      totalRooms: "الغرف",
      reservations: "الحجوزات",
      roomsSection: "الغرف",
      roomNumber: "غرفة {number}",
      capacity: "السعة: {capacity} أشخاص",
      available: "متاحة",
      booked: "محجوزة",
      moreRooms: "+ {count} غرف أخرى"
    }
  }
};
