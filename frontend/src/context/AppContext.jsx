import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const AppContext = createContext(null);

const STRINGS = {
  en: {
    reportRequest: 'Report a Request',
    seeHowItWorks: 'See How It Works',
    heroHeading: 'Government services, finally connected.'
  },
  hi: {
    reportRequest: 'शिकायत दर्ज करें',
    seeHowItWorks: 'यह कैसे काम करता है',
    heroHeading: 'सरकारी सेवाएं, अब पूरी तरह जुड़ी हुई।'
  },
  mr: {
    reportRequest: 'तक्रार नोंदवा',
    seeHowItWorks: 'हे कसे कार्य करते ते पहा',
    heroHeading: 'सरकारी सेवा, अखेर एकत्र जोडलेल्या.'
  }
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('cfai_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('cfai_lang') || 'en');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('cfai_contrast') === 'true');
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('cfai_font_scale') || 1));
  const [simpleLanguage, setSimpleLanguage] = useState(() => localStorage.getItem('cfai_simple') === 'true');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('cfai_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    localStorage.setItem('cfai_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
    localStorage.setItem('cfai_font_scale', String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.setAttribute('data-simple-language', String(simpleLanguage));
    localStorage.setItem('cfai_simple', String(simpleLanguage));
  }, [simpleLanguage]);

  useEffect(() => {
    localStorage.setItem('cfai_lang', language);
  }, [language]);

  const pushToast = useCallback((message, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const t = useMemo(() => STRINGS[language] || STRINGS.en, [language]);

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme((th) => (th === 'light' ? 'dark' : 'light')),
    language,
    setLanguage,
    t,
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
    simpleLanguage,
    setSimpleLanguage,
    toasts,
    pushToast,
    dismissToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
