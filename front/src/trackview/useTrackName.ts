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

/**
 * A section's position in the interface language.
 *
 * The positions are stored in Finnish, in the words members use on site
 * (back/knex/sectionLayout.js). The known ones are translated; any other value
 * is shown as stored.
 */
export function usePositionName() {
  const { t } = useLingui();
  return (position: string) => {
    switch (position.trim()) {
      case 'Vasemmanpuoleisin':
        return t`Leftmost`;
      case 'Keskimmäinen':
        return t`Middle`;
      case 'Oikeanpuoleisin':
        return t`Rightmost`;
      case 'Merkityt paikat':
        return t`Marked lanes`;
      case 'Merkitsemättömät paikat':
        return t`Unmarked lanes`;
      default:
        return position;
    }
  };
}
