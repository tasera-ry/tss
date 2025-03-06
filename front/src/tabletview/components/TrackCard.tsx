import { useLingui } from "@lingui/react";
import classNames from 'classnames';
import css from '../rangeofficer.module.scss';
import { Button } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { msg } from "@lingui/core/macro";
import colors from '../../colors.module.scss';
import { TrackStatistics } from "@/tabletview/components/TrackStatistics/TrackStatistics";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";

const classes = classNames.bind(css);

const buttonStates = {
  present: {
    labelMsg: msg`Present`,
    color: colors.green
  },
  closed: {
    labelMsg: msg`Closed`,
    color: colors.redLight
  },
  absent: {
    labelMsg: msg`No track officer`,
    color: colors.white
  },
  'en route': {
    labelMsg: msg`On the way`,
    color: colors.orange
  }
} as const


const toggleStates = ['present', 'closed', 'absent'] as const

export function TrackCard({ track, disabled, scheduleId, date, socket }) {
  const { i18n } = useLingui();
  const queryClient = useQueryClient();

  const supervisionState = useMemo(() => {
    return track.scheduled ? track.scheduled.track_supervisor : 'absent'
  }, [track]);

  const buttonState = useMemo(() => {
    return buttonStates?.[supervisionState] ?? buttonStates.absent
  }, [supervisionState]);

  useEffect(() => {
    const onTrackUpdate = (msg: any) => {
      if (msg.id !== track.id) return
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          tracks: old.tracks.map((t: any) => t.id === track.id ? {
            ...t,
            scheduled: {
              ...t.scheduled,
              track_supervisor: msg.super
            }
          } : t)
        }
      })
    }
    if (!socket) return
    socket.on('trackUpdate', onTrackUpdate)
    return () => {
      socket.off('trackUpdate')
    }
  }, [socket, track.id])

  const trackMutation = useMutation({
    mutationFn: (status: string) => {
      const isScheduled = !!track.scheduled
      if (isScheduled) {
        return axios
          .put(`/api/track-supervision/${scheduleId}/${track.id}`, {
            track_supervisor: status
          })
      } else {
        return axios
          .post(`/api/track-supervision`, {
            track_id: track.id,
            scheduled_range_supervision_id: scheduleId,
            track_supervisor: status,
          })
      }
    },
    onSuccess: (_, status) => {
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          tracks: old.tracks.map((t: any) => t.id === track.id ? {
            ...t,
            scheduled: {
              ...t.scheduled,
              track_supervisor: status
            }
          } : t)
        }
      })
    }
  })

  const onStatusClick = useCallback(() => {
    const newStateIndex = (toggleStates.indexOf(supervisionState) + 1) % toggleStates.length
    const nextState = toggleStates[newStateIndex]
    trackMutation.mutate(nextState)
  }, [supervisionState, trackMutation]);

  
  return (
    <div className={classes(css.rangediv)}>
      <div className={classes(css.rangeStyle)}>
        <div className="text-center font-medium text-xl flex flex-col">
          <span>
            {track.name}
          </span>
          <span className="text-sm">
            {track.short_description}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            style={{ backgroundColor: buttonState.color }}
            size="large"
            variant="contained"
            fullWidth
            onClick={onStatusClick}
            data-testid="trackSupervisorButton"
            disabled={disabled || trackMutation.isLoading}
          >
            {i18n._(buttonState.labelMsg)}
          </Button>
          <TrackStatistics track={track} disabled={disabled} />
        </div>
      </div>
    </div>
  )


}
