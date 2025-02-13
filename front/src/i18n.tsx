import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import moment from "moment";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const languageContext = createContext<[string, React.Dispatch<React.SetStateAction<string>>]>(['fi', () => {}]);

export function useLanguageContext() {
  const [lang, setLang] = useContext(languageContext)
  const setCurrentLang = useCallback((lang: string) => {
    localStorage.setItem('language', lang);
    setLang(lang);
  }, [setLang])
  return [lang, setCurrentLang] as const;
}

export function LinguiProvider({ children }: { children: React.ReactNode }) {

  const langState = useState(localStorage.getItem('language') ?? 'fi');
  const [lang] = langState;

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { messages } = await import(`./locales/${lang}/messages.po`);
      i18n.load(lang, messages);
      i18n.activate(lang);
      moment.locale(lang);
      setIsReady(true);
    })()
  }, [lang])

  if (!isReady) return null

  return (
    <languageContext.Provider value={langState}>
      <I18nProvider i18n={i18n}>
        {children}
      </I18nProvider>
    </languageContext.Provider>
  );
}
