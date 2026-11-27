import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import api from '@/api/api';
import type { ApiSection } from '@/trackview/trackViewPlaceholder';

/** A track as GET /api/track returns it, as far as this page edits it. */
export interface ApiTrack {
  id: number;
  name: string;
  short_description: string;
  description: string;
  /** Swedish and English versions; empty or null falls back to Finnish. */
  short_description_sv: string | null;
  short_description_en: string | null;
  description_sv: string | null;
  description_en: string | null;
  requires_range_officer: boolean;
  only_22lr: boolean;
  daylight_only: boolean;
}

const TRACK_FIELDS = [
  'name',
  'short_description',
  'short_description_sv',
  'short_description_en',
  'description',
  'description_sv',
  'description_en',
] as const;
const RULES = ['requires_range_officer', 'only_22lr', 'daylight_only'] as const;
type TrackDraft = Record<(typeof TRACK_FIELDS)[number], string> &
  Pick<ApiTrack, (typeof RULES)[number]>;

interface SectionDraft {
  /** Stable key: the id, or a made-up one for a section not yet saved. */
  key: string;
  id?: number;
  name: string;
  /** As typed. */
  lanes: string;
  description: string;
  descriptionSv: string;
  descriptionEn: string;
  removed: boolean;
}

const trackDraft = (track: ApiTrack): TrackDraft => ({
  name: track.name,
  short_description: track.short_description,
  short_description_sv: track.short_description_sv ?? '',
  short_description_en: track.short_description_en ?? '',
  description: track.description,
  description_sv: track.description_sv ?? '',
  description_en: track.description_en ?? '',
  requires_range_officer: track.requires_range_officer,
  only_22lr: track.only_22lr,
  daylight_only: track.daylight_only,
});

const sectionDrafts = (sections: ApiSection[]): SectionDraft[] =>
  [...sections]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      key: String(s.id),
      id: s.id,
      name: s.name,
      lanes: String(s.lane_count),
      description: s.description ?? '',
      descriptionSv: s.description_sv ?? '',
      descriptionEn: s.description_en ?? '',
      removed: false,
    }));

const sameTrack = (a: TrackDraft, b: TrackDraft) =>
  [...TRACK_FIELDS, ...RULES].every((field) => a[field] === b[field]);

const sameSection = (a: SectionDraft, b?: SectionDraft) =>
  b !== undefined &&
  a.name.trim() === b.name &&
  Number(a.lanes) === Number(b.lanes) &&
  a.description.trim() === b.description &&
  a.descriptionSv.trim() === b.descriptionSv &&
  a.descriptionEn.trim() === b.descriptionEn;

const validLanes = (lanes: string) =>
  /^\d+$/.test(lanes) && Number(lanes) >= 1 && Number(lanes) <= 1000;

interface Refusal {
  date: string;
  booked: number;
}

/**
 * One track on the Edit tracks page (#462): its names and description, its
 * standing rules (#455) and range officer requirement, and its sections. One
 * Save for the card; a section the bookings refuse stays unsaved with the
 * reason, the rest is saved.
 */
export function TrackEditCard({
  track,
  sections,
  onDirtyChange,
}: {
  track: ApiTrack;
  /** The track's sections, in any order. */
  sections: ApiSection[];
  onDirtyChange: (trackId: number, dirty: boolean) => void;
}) {
  const { t, i18n } = useLingui();
  const queryClient = useQueryClient();
  const storedTrack = trackDraft(track);
  const storedSections = sectionDrafts(sections);

  const [draft, setDraft] = useState(storedTrack);
  const [rows, setRows] = useState(storedSections);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const nextKey = useRef(0);

  const storedByKey = new Map(storedSections.map((s) => [s.key, s]));
  const sectionsDirty =
    rows.length !== storedSections.length ||
    rows.some(
      (row) => row.removed || !sameSection(row, storedByKey.get(row.key)),
    );
  const dirty = !sameTrack(draft, storedTrack) || sectionsDirty;

  const kept = rows.filter((row) => !row.removed);
  const trackInvalid =
    draft.name.trim() === '' ||
    draft.description.trim() === '' ||
    draft.short_description.trim() === '' ||
    [...draft.short_description.trim()].length > 25;
  const invalid =
    trackInvalid ||
    kept.length === 0 ||
    kept.some((row) => row.name.trim() === '' || !validLanes(row.lanes));

  // Follow the server (a refetch, another admin) while the card has no edits
  // of its own; never overwrite edits in progress. A save sets the drafts
  // itself, from the reloaded data.
  const signature = JSON.stringify([storedTrack, storedSections]);
  const previous = useRef(signature);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the signature stands for the stored data
  useEffect(() => {
    if (previous.current === signature) return;
    previous.current = signature;
    if (!dirty) {
      setDraft(storedTrack);
      setRows(storedSections);
    }
  }, [signature]);

  useEffect(() => {
    onDirtyChange(track.id, dirty);
    if (dirty) setAnnouncement('');
  }, [dirty, onDirtyChange, track.id]);
  useEffect(
    () => () => onDirtyChange(track.id, false),
    [onDirtyChange, track.id],
  );

  const formatDays = (days: Refusal[]) =>
    days
      .map(
        ({ date, booked }) =>
          `${i18n.date(moment(date).toDate(), { day: 'numeric', month: 'numeric', year: 'numeric' })} (${booked})`,
      )
      .join(', ');

  function setRow(key: string, changes: Partial<SectionDraft>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
    setRowErrors(({ [key]: _, ...rest }) => rest);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setRowErrors({});
    setAnnouncement('');
    const refusedRows = new Map<string, SectionDraft>();
    const errors: Record<string, string> = {};
    let trackRefused: TrackDraft | undefined;

    if (!sameTrack(draft, storedTrack)) {
      try {
        await api.updateTrack(track.id, {
          ...draft,
          ...Object.fromEntries(
            TRACK_FIELDS.map((field) => [field, draft[field].trim()]),
          ),
        });
      } catch {
        trackRefused = draft;
      }
    }

    for (const row of rows) {
      const stored = storedByKey.get(row.key);
      const body = {
        name: row.name.trim(),
        lane_count: Number(row.lanes),
        description: row.description.trim(),
        description_sv: row.descriptionSv.trim(),
        description_en: row.descriptionEn.trim(),
      };
      try {
        if (row.removed && row.id !== undefined) {
          await api.deleteTrackSection(row.id);
        } else if (row.removed) {
          // Added and removed before saving: nothing to do.
        } else if (row.id === undefined) {
          await api.createTrackSection({ track_id: track.id, ...body });
        } else if (!sameSection(row, stored)) {
          await api.updateTrackSection(row.id, body);
        }
      } catch (e) {
        const response = (
          e as { response?: { status: number; data?: { days?: Refusal[] } } }
        ).response;
        const days = response?.data?.days;
        if (response?.status === 409 && days && row.removed) {
          errors[row.key] =
            t`Not removed: the section has bookings on ${formatDays(days)}.`;
          refusedRows.set(row.key, { ...row, removed: false });
        } else if (response?.status === 409 && days) {
          errors[row.key] =
            t`Not saved: the bookings need more lanes at once on ${formatDays(days)}.`;
          refusedRows.set(row.key, row);
        } else {
          errors[row.key] = t`The section could not be saved.`;
          refusedRows.set(row.key, row);
        }
      }
    }

    // Reload, then draft from the server's data with what it refused laid
    // back over it: a refused change stays unsaved, the rest is saved.
    await Promise.all([
      queryClient.refetchQueries(['tracks']),
      queryClient.refetchQueries(['trackSections']),
    ]);
    const freshTrack =
      queryClient
        .getQueryData<ApiTrack[]>(['tracks'])
        ?.find((t) => t.id === track.id) ?? track;
    const freshSections = sectionDrafts(
      (queryClient.getQueryData<ApiSection[]>(['trackSections']) ?? []).filter(
        (s) => s.track_id === track.id,
      ),
    );
    previous.current = JSON.stringify([trackDraft(freshTrack), freshSections]);
    setDraft(trackRefused ?? trackDraft(freshTrack));
    setRows([
      ...freshSections.map((s) => refusedRows.get(s.key) ?? s),
      ...[...refusedRows.values()].filter((r) => r.id === undefined),
    ]);

    const anything = trackRefused || refusedRows.size > 0;
    setRowErrors(errors);
    if (trackRefused) setError(t`The track could not be saved.`);
    if (!anything) {
      setAnnouncement(t`Saved`);
      heading.current?.focus();
    }
    setSaving(false);
  }

  const field =
    'w-full rounded-md border border-black-tint-50 px-2 py-1.5 text-sm';
  const rules = {
    requires_range_officer: t`Requires a range officer on site`,
    only_22lr: t`.22LR only`,
    daylight_only: t`No shooting in the dark`,
  };

  return (
    <section
      className={classNames(
        'rounded-xl border bg-white p-4 sm:p-5',
        dirty ? 'border-black-tint-70' : 'border-black-tint-20',
      )}
      aria-labelledby={`track-${track.id}`}
    >
      <h2
        id={`track-${track.id}`}
        ref={heading}
        tabIndex={-1}
        className="mb-3 font-semibold text-lg focus:outline-none"
      >
        {track.name}
      </h2>

      <div className="grid grid-cols-1 gap-3">
        <label className="flex flex-col gap-1 text-sm sm:max-w-sm">
          <span className="font-medium">{t`Name`}</span>
          <input
            type="text"
            className={field}
            value={draft.name}
            maxLength={255}
            aria-invalid={draft.name.trim() === ''}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
      </div>
      <LanguageFields
        legend={t`Short description`}
        values={[
          draft.short_description,
          draft.short_description_sv,
          draft.short_description_en,
        ]}
        maxLength={25}
        onChange={(language, value) =>
          setDraft({
            ...draft,
            [language === 'fi'
              ? 'short_description'
              : `short_description_${language}`]: value,
          })
        }
      />
      <LanguageFields
        legend={t`Description`}
        values={[draft.description, draft.description_sv, draft.description_en]}
        maxLength={255}
        multiline
        onChange={(language, value) =>
          setDraft({
            ...draft,
            [language === 'fi' ? 'description' : `description_${language}`]:
              value,
          })
        }
      />

      <fieldset className="mt-4 text-sm">
        <legend className="mb-1 font-medium">{t`Rules`}</legend>
        <div className="flex flex-col gap-1">
          {RULES.map((rule) => (
            <label key={rule} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft[rule]}
                onChange={(e) =>
                  setDraft({ ...draft, [rule]: e.target.checked })
                }
              />
              {rules[rule]}
            </label>
          ))}
        </div>
      </fieldset>

      <h3 className="mt-4 mb-1 font-semibold text-grey text-xs uppercase tracking-wider">
        {t`Sections`}
      </h3>
      <ul className="flex list-none flex-col gap-2 p-0">
        {rows.map((row) => (
          <li
            key={row.key}
            className={classNames(
              'rounded-lg border border-black-tint-20 p-3',
              row.removed && 'bg-black-tint-05',
            )}
          >
            {row.removed ? (
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <s>{row.name}</s>{' '}
                  <span className="text-grey">
                    {t`Removed on save, with its past bookings.`}
                  </span>
                </span>
                <button
                  type="button"
                  className="rounded-md border border-black-tint-50 bg-white px-3 py-1 text-sm"
                  onClick={() => setRow(row.key, { removed: false })}
                >
                  {t`Undo`}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_6rem] gap-2 text-sm sm:grid-cols-[1fr_6rem_auto] sm:items-end">
                <label className="flex flex-col gap-1">
                  <span className="text-grey">{t`Section name`}</span>
                  <input
                    type="text"
                    className={field}
                    value={row.name}
                    maxLength={255}
                    aria-invalid={row.name.trim() === ''}
                    onChange={(e) => setRow(row.key, { name: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-grey">{t`Lanes`}</span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    className={`${field} tabular-nums`}
                    value={row.lanes}
                    aria-invalid={!validLanes(row.lanes)}
                    onChange={(e) => setRow(row.key, { lanes: e.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className="col-span-2 justify-self-start px-2 py-1.5 text-grey text-sm hover:text-black disabled:opacity-50 sm:col-span-1"
                  disabled={kept.length <= 1}
                  title={
                    kept.length <= 1
                      ? t`A track needs at least one section.`
                      : undefined
                  }
                  onClick={() =>
                    row.id === undefined
                      ? setRows((current) =>
                          current.filter((r) => r.key !== row.key),
                        )
                      : setRow(row.key, { removed: true })
                  }
                >
                  {t`Remove`}
                </button>
                <div className="col-span-2 sm:col-span-3">
                  <LanguageFields
                    legend={t`Description`}
                    values={[
                      row.description,
                      row.descriptionSv,
                      row.descriptionEn,
                    ]}
                    maxLength={255}
                    optional
                    onChange={(language, value) =>
                      setRow(row.key, {
                        [language === 'fi'
                          ? 'description'
                          : language === 'sv'
                            ? 'descriptionSv'
                            : 'descriptionEn']: value,
                      })
                    }
                  />
                </div>
              </div>
            )}
            {rowErrors[row.key] && (
              <p role="alert" className="mt-2 font-medium text-sm">
                ⚠ {rowErrors[row.key]}
              </p>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 rounded-md border border-black-tint-50 bg-white px-3 py-1.5 text-sm"
        onClick={() => {
          nextKey.current += 1;
          setRows([
            ...rows,
            {
              key: `new-${nextKey.current}`,
              name: '',
              lanes: '',
              description: '',
              descriptionSv: '',
              descriptionEn: '',
              removed: false,
            },
          ]);
        }}
      >
        + {t`Add section`}
      </button>

      {dirty && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-black-tint-05 px-3 py-2">
          <span className="font-medium text-sm">{t`Unsaved changes`}</span>
          <span className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-black-tint-50 bg-white px-3 py-1.5 text-sm"
              onClick={() => {
                setDraft(storedTrack);
                setRows(storedSections);
                setError(null);
                setRowErrors({});
                heading.current?.focus();
              }}
            >
              {t`Undo`}
            </button>
            <button
              type="button"
              className="rounded-md bg-black-tint-70 px-4 py-1.5 font-medium text-sm text-white disabled:opacity-60"
              onClick={save}
              disabled={saving || invalid}
            >
              {t`Save`}
            </button>
          </span>
        </div>
      )}
      <output className="mt-2 block text-grey text-sm empty:hidden">
        {!dirty && announcement}
      </output>
      {error && (
        <p role="alert" className="mt-2 font-medium text-sm">
          ⚠ {error}
        </p>
      )}
    </section>
  );
}

const LANGUAGES = [
  ['fi', 'Suomi'],
  ['sv', 'Svenska'],
  ['en', 'English'],
] as const;

/**
 * One text in Finnish, Swedish and English (#462). The language names are
 * written in their own language. Finnish is required unless `optional`; an
 * empty translation falls back to Finnish where the text is shown.
 */
function LanguageFields({
  legend,
  values,
  maxLength,
  multiline = false,
  optional = false,
  onChange,
}: {
  legend: string;
  values: readonly [string, string, string];
  maxLength: number;
  multiline?: boolean;
  optional?: boolean;
  onChange: (language: 'fi' | 'sv' | 'en', value: string) => void;
}) {
  const field =
    'w-full rounded-md border border-black-tint-50 px-2 py-1.5 text-sm';
  return (
    <fieldset className="mt-3 text-sm">
      <legend className="mb-1 font-medium">{legend}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LANGUAGES.map(([language, name], i) => (
          <label key={language} className="flex flex-col gap-1">
            <span className="text-grey" lang={language}>
              {name}
            </span>
            {multiline ? (
              <textarea
                className={field}
                rows={2}
                value={values[i]}
                maxLength={maxLength}
                aria-invalid={
                  language === 'fi' && !optional && values[i].trim() === ''
                }
                onChange={(e) => onChange(language, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className={field}
                value={values[i]}
                maxLength={maxLength}
                aria-invalid={
                  language === 'fi' && !optional && values[i].trim() === ''
                }
                onChange={(e) => onChange(language, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
