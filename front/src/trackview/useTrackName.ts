import { useLingui } from '@lingui/react/macro';

/**
 * A track's name in the interface language.
 *
 * The seven tracks are stored as "Rata 1" … "Rata 7", and the database has no
 * translation path. Those are names by number, so the number is kept and the
 * word follows the language ("Track 3", "Bana 3"). Any other name is shown as
 * stored. Links keep using the stored name.
 */
export function useTrackName() {
  const { t } = useLingui();
  return (name: string) => {
    const match = /^Rata (\d+)$/.exec(name.trim());
    if (!match) return name;
    const number = match[1];
    return t`Track ${number}`;
  };
}
