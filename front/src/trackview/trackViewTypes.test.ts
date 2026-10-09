import { describe, expect, it } from 'vitest';
import { unavailableReason } from './trackViewTypes';

/**
 * The rule the customer stated on 8.10.2026:
 *   - shooting requires a range officer on site
 *   - members may not enter a track with no track officer
 *   - when the range officer is away, no track can be open
 *
 * The backend does not enforce this — `range_supervisor` and `track_supervisor`
 * are independent columns with no constraint between them — so the view derives
 * it. These tests pin the rule down.
 */
describe('unavailableReason', () => {
  it('allows use when both officers are present', () => {
    expect(
      unavailableReason({ rangeOfficer: 'present' }, { officer: 'present' }),
    ).toBeNull();
  });

  it.each([
    ['absent'],
    ['confirmed'],
    ['not confirmed'],
    ['en route'],
    ['closed'],
  ] as const)(
    'blocks every track when the range officer is %s, even with a track officer present',
    (rangeOfficer) => {
      expect(unavailableReason({ rangeOfficer }, { officer: 'present' })).toBe(
        'noRangeOfficer',
      );
    },
  );

  it('blocks a track with no track officer, even when the range officer is present', () => {
    expect(
      unavailableReason({ rangeOfficer: 'present' }, { officer: 'absent' }),
    ).toBe('noTrackOfficer');
  });

  it('reports the range officer first when both are missing', () => {
    expect(
      unavailableReason({ rangeOfficer: 'absent' }, { officer: 'absent' }),
    ).toBe('noRangeOfficer');
  });

  it('does not treat a closed or private track as missing its officer', () => {
    // These are states of the track, not of its supervision. The segments carry
    // the closure; the officer line should not also claim nobody is there.
    expect(
      unavailableReason({ rangeOfficer: 'present' }, { officer: 'closed' }),
    ).toBeNull();
    expect(
      unavailableReason({ rangeOfficer: 'present' }, { officer: 'private' }),
    ).toBeNull();
  });
});
