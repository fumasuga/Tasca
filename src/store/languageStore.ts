import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations } from '../i18n/translations';

const LANGUAGE_KEY = 'app-language';

interface LanguageState {
  language: Language;
  initialized: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  initialize: () => Promise<void>;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  initialized: false,

  setLanguage: async (lang: Language) => {
    set({ language: lang });
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  },

  initialize: async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && (saved === 'en' || saved === 'ja' || saved === 'fr' || saved === 'ko')) {
        set({ language: saved as Language, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      set({ initialized: true });
    }
  },

  t: (key: string) => {
    const { language } = get();
    return translations[language][key] || translations['en'][key] || key;
  },
}));

