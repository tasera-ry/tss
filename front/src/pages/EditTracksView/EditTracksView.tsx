import { useLingui } from '@lingui/react/macro';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Prompt } from 'react-router-dom';

import api from '@/api/api';
import type { ApiSection } from '@/trackview/trackViewPlaceholder';
import { validateLogin } from '@/utils/Utils';
import { type ApiTrack, TrackEditCard } from './TrackEditCard';

/**
 * Edit tracks (#462): one card per track for its details, standing rules and
 * sections. The seven tracks are fixed, so tracks are not added or removed
 * here.
 */
export function EditTracksView() {
  const { t } = useLingui();

  useEffect(() => {
    validateLogin().then((loggedIn) => {
      if (!loggedIn) window.location.href = '/';
    });
  }, []);

  const tracks = useQuery<ApiTrack[]>(['tracks'], async () => {
    const response = await axios.get('/api/track');
    return response.data;
  });
  const sections = useQuery<ApiSection[]>(['trackSections'], () =>
    api.getTrackSections(),
  );

  // Cards with unsaved changes: leaving the page would lose them.
  const [unsaved, setUnsaved] = useState<number[]>([]);
  const onDirtyChange = useCallback((trackId: number, dirty: boolean) => {
    setUnsaved((ids) => {
      if (dirty === ids.includes(trackId)) return ids;
      return dirty ? [...ids, trackId] : ids.filter((id) => id !== trackId);
    });
  }, []);
  useEffect(() => {
    if (unsaved.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved.length]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-4 pb-16 sm:px-6">
      <h1 className="font-semibold text-2xl">{t`Edit tracks`}</h1>
      <Prompt
        when={unsaved.length > 0}
        message={t`The page has unsaved changes. Leave without saving?`}
      />
      <p className="-mt-3 text-grey text-sm">
        {t`Sections are the parts of a track that bookings take lanes from.`}
      </p>

      {tracks.isLoading || sections.isLoading ? (
        <div className="flex justify-center p-6">
          <CircularProgress disableShrink />
        </div>
      ) : tracks.isError || sections.isError || !tracks.data ? (
        <p role="alert">{t`Error fetching tracks`}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...tracks.data]
            .sort((a, b) => a.id - b.id)
            .map((track) => (
              <TrackEditCard
                key={track.id}
                track={track}
                sections={(sections.data ?? []).filter(
                  (s) => s.track_id === track.id,
                )}
                onDirtyChange={onDirtyChange}
              />
            ))}
        </div>
      )}
    </div>
  );
}
