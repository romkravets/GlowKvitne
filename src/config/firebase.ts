// Firebase configuration for GlowKvitne
// Note: These values should match your Firebase console project settings

export const firebaseConfig = {
  apiKey: 'AIzaSyAcPgEn8iktL7RyW_oqfH-8F-Cb9H7Cd0M',
  authDomain: 'haikvitne.firebaseapp.com',
  projectId: 'haikvitne',
  storageBucket: 'haikvitne.firebasestorage.app',
  messagingSenderId: '955927835101',
  appId: '1:955927835101:web:409c90310d73c4210ac634',
};

// API endpoint configuration
export const API_CONFIG = {
  baseURL: __DEV__ ? 'http://localhost:3000' : 'https://api.glowkvitne.com',
  timeout: 300000, // 5 minutes for AI analysis
  // iOS Client ID from GoogleService-Info.plist
  googleWebClientId:
    '955927835101-1a3iesqnkm2nb1m6ipi490fjj3np4iqg.apps.googleusercontent.com',
};

// Billing constants (matching backend)
export const ONE_TIME_PURCHASES = {
  single_analysis: {
    id: 'single_analysis',
    name: 'Разовий аналіз',
    price: {
      UAH: 149,
      USD: 4.99,
      EUR: 3.99,
    },
    description: 'Один повний аналіз без підписки',
  },

  outfit_pack_10: {
    id: 'outfit_pack_10',
    name: 'Пакет 10 образів',
    price: {
      UAH: 199,
      USD: 5.99,
      EUR: 4.99,
    },
    description: '10 згенерованих образів',
  },

  pdf_style_guide: {
    id: 'pdf_style_guide',
    name: 'PDF Style Guide',
    price: {
      UAH: 99,
      USD: 2.99,
      EUR: 2.49,
    },
    description: 'Детальний гайд вашого стилю',
  },
};

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Безкоштовний',
    price: { UAH: 0 },
    features: {
      analysesPerMonth: 1,
      outfitsPerMonth: 3,
      detailedAnalysis: false,
      celebrityTwins: false,
      pdfExport: false,
      prioritySupport: false,
    },
  },

  basic: {
    id: 'basic',
    name: 'Базовий',
    price: { UAH: 199 },
    features: {
      analysesPerMonth: 5,
      outfitsPerMonth: 20,
      detailedAnalysis: true,
      celebrityTwins: true,
      pdfExport: false,
      prioritySupport: false,
    },
  },

  premium: {
    id: 'premium',
    name: 'Преміум',
    price: { UAH: 399 },
    features: {
      analysesPerMonth: -1, // Unlimited
      outfitsPerMonth: -1,
      detailedAnalysis: true,
      celebrityTwins: true,
      pdfExport: true,
      prioritySupport: true,
    },
  },
};
