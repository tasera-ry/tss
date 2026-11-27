import api from '@/api/api';
import { TrackStatistics } from '@/pages/TabletView/components/TrackStatistics/TrackStatistics';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Button } from '@mui/material';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import colors from '../../../colors.module.scss';
import css from '../rangeofficer.module.scss';

const classes = classNames.bind(css);

const buttonStates = {
  present: {
    labelMsg: msg`Present`,
    color: colors.green,
  },
  closed: {
    labelMsg: msg`Closed`,
    color: colors.redLight,
  },
  absent: {
    labelMsg: msg`No track officer`,
    color: colors.white,
  },
} as const;

const toggleStates = ['present', 'closed', 'absent'] as const;
// B10 (#464): without the range officer on site the server refuses 'present'.
const toggleStatesWithoutPresent = ['closed', 'absent'] as const;

const officerAwayMsg = msg`The range officer is not present, so the track officer cannot be marked present.`;
const saveFailedMsg = msg`The track status could not be saved.`;

export function TrackCard({
  track,
  disabled,
  scheduleId,
  date,
  socket,
  rangeOfficerPresent,
  setNotification,
}) {
  const { i18n } = useLingui();
  const queryClient = useQueryClient();

  const supervisionState = useMemo(() => {
    return track.scheduled ? track.scheduled.track_supervisor : 'absent';
  }, [track]);

  // Rata 6 needs no range officer (requires_range_officer false); unknown
  // counts as needed, as on the server.
  const canBePresent =
    rangeOfficerPresent || track.requires_range_officer === false;

  const buttonState = useMemo(() => {
    return buttonStates?.[supervisionState] ?? buttonStates.absent;
  }, [supervisionState]);

  useEffect(() => {
    const onTrackUpdate = (msg: any) => {
      if (msg.id !== track.id) return;
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          tracks: old.tracks.map((t: any) =>
            t.id === track.id
              ? {
                  ...t,
                  scheduled: {
                    ...t.scheduled,
                    track_supervisor: msg.super,
                  },
                }
              : t,
          ),
        };
      });
    };
    if (!socket) return;
    socket.on('trackUpdate', onTrackUpdate);
    return () => {
      socket.off('trackUpdate');
    };
  }, [socket, track.id, date, queryClient.setQueryData]);

  const trackMutation = useMutation({
    mutationFn: (status: string) => {
      console.log(track);
      const isScheduled = !!track.scheduled;
      if (isScheduled) {
        return api.patchScheduledSupervisionTrack(scheduleId, track.id, {
          track_supervisor: status,
        });
      }
      return api.postScheduledSupervisionTrack({
        track_id: track.id,
        scheduled_range_supervision_id: scheduleId,
        track_supervisor: status,
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      const refused =
        error.response?.data?.error === 'Range officer not present';
      setNotification({
        open: true,
        type: 'error',
        message: i18n._(refused ? officerAwayMsg : saveFailedMsg),
      });
      // The range officer's status may have changed elsewhere: read it again.
      if (refused) queryClient.invalidateQueries(['schedule', date]);
    },
    onSuccess: (_, status) => {
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          tracks: old.tracks.map((t: any) =>
            t.id === track.id
              ? {
                  ...t,
                  scheduled: {
                    ...t.scheduled,
                    track_supervisor: status,
                  },
                }
              : t,
          ),
        };
      });
    },
  });

  const onStatusClick = useCallback(() => {
    const states: readonly string[] = canBePresent
      ? toggleStates
      : toggleStatesWithoutPresent;
    // From 'present' (marked before the officer left), indexOf is -1: the
    // next is 'closed', and the track cannot be set back to present.
    trackMutation.mutate(
      states[(states.indexOf(supervisionState) + 1) % states.length],
    );
  }, [canBePresent, supervisionState, trackMutation]);

  return (
    <div className={classes(css.rangediv)}>
      <div className={classes(css.rangeStyle)}>
        <div className="text-center font-medium text-xl flex flex-col">
          <span>{track.name}</span>
          <span className="text-sm">{track.short_description}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            style={{ backgroundColor: buttonState.color }}
            size="large"
            variant="contained"
            fullWidth
            onClick={onStatusClick}
            data-testid={`trackSupervisorButton-${track.id}`}
            disabled={disabled || trackMutation.isLoading}
          >
            {i18n._(buttonState.labelMsg)}
          </Button>
          <TrackStatistics
            track={track}
            superVisionState={supervisionState}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
