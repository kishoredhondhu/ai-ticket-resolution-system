// NOTE: This file requires i18next and react-i18next packages to be installed

// Run: npm install i18next react-i18next

// Temporarily disabled until dependencies are installed

// import i18n from 'i18next';

// import { initReactI18next } from 'react-i18next';

// import en from '../i18n/en.json';

// import es from '../i18n/es.json';

// Mock i18n object for now

const i18n = {
  use: () => i18n,

  init: () => Promise.resolve(),

  t: (key: string) => key,

  changeLanguage: () => Promise.resolve(),
};

// Uncomment when dependencies are installed:

// i18n

//   .use(initReactI18next)

//   .init({

//     resources: {

//       en: { translation: en },

//       es: { translation: es }

//     },

//     lng: 'en',

//     fallbackLng: 'en',

//     interpolation: { escapeValue: false }

//   });

export default i18n;
