import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import moment from "moment";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LANGUAGES = ['fi', 'sv', 'en'] as const;

export type Language = typeof LANGUAGES[number];

const languageContext = createContext<[Language, React.Dispatch<React.SetStateAction<Language>>]>(['fi', () => {}]);


export function useLanguageContext() {
  const [lang, setLang] = useContext(languageContext)
  const setCurrentLang = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    setLang(lang);
  }, [setLang])
  return [lang, setCurrentLang] as const;
}

const localStorageLang = localStorage.getItem('language') as unknown as Language;

export function LinguiProvider({ children, defaultLang = 'fi' }: { children: React.ReactNode, defaultLang?: string }) {

  const langState = useState(LANGUAGES.includes(localStorageLang) ? localStorageLang : defaultLang);
  const [lang] = langState;

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { messages } = await import(`./locales/${lang.toLowerCase()}/messages.po`);
      i18n.load(lang, messages);
      i18n.activate(lang);
      moment.locale(lang);
      setIsReady(true);
    })()
  }, [lang])

  if (!isReady) return null

  return (
    <languageContext.Provider value={langState as [Language, React.Dispatch<React.SetStateAction<Language>>]}>
      <I18nProvider i18n={i18n}>
        {children}
      </I18nProvider>
    </languageContext.Provider>
  );
}
