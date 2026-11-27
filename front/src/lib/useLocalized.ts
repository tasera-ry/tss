import { useLingui } from '@lingui/react';

/**
 * Pick the interface language's version of a text entered in three languages
 * (#462: track and section descriptions). Finnish is the original; an empty
 * Swedish or English version falls back to it.
 */
export function useLocalized() {
  const { i18n } = useLingui();
  return (fi?: string | null, sv?: string | null, en?: string | null) => {
    const own = i18n.locale === 'sv' ? sv : i18n.locale === 'en' ? en : null;
    return own?.trim() ? own : (fi ?? '');
  };
}
