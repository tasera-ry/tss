import { updateRangeSupervision } from "@/utils/Utils";
import { t, msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Button } from "@mui/material";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useQueryClient, useMutation } from "react-query";

import css from '../rangeofficer.module.scss';
import colors from '../../colors.module.scss';

const classes = classNames.bind(css);

export function RangeOfficerStatusSection({ rangeSupervision, rangeSupervisionScheduled, reservationId, scheduleId, socket, date, setNotification }) {
  return (
    <>
      <RangeOfficerStatus
        rangeSupervisionStatus={rangeSupervision}
      />

      <span className={classes(css.Text)}>
        {t`Define range officer status by choosing color`}
      </span>

      <RangeOfficerStatusToggle
        rangeSupervisionScheduled={rangeSupervisionScheduled}
        reservationId={reservationId}
        scheduleId={scheduleId}
        socket={socket}
        date={date}
        setNotification={setNotification}
      />
    </>
  )
}

function RangeOfficerStatusToggle({ reservationId, scheduleId, rangeSupervisionScheduled, socket, date, setNotification }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();


  const supervisorMutation = useMutation({
    mutationFn: (status: string) => {
      console.log(reservationId, scheduleId, status, rangeSupervisionScheduled, null)
      return updateRangeSupervision(reservationId, scheduleId, status, rangeSupervisionScheduled, null);
    },
    onSuccess: (_, status) => {
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          rangeSupervision: status,
        }
      })
      socket.emit('rangeUpdate', { status });
    }
  })

  const updateSupervisor = useCallback((status) => {
    supervisorMutation.mutate(status);
  }, [rangeSupervisionScheduled, supervisorMutation, t])

  return (
    <div className={classes(css.rowStyle)}>
      <Button
        className={classes(css.greenButtonStyle)}
        size="large"
        variant="contained"
        onClick={() => updateSupervisor('present')}
        data-testid="tracksupervisorPresent"
        disabled={supervisorMutation.isLoading}
      >
        {t`Present`}
      </Button>
      <Button
        className={classes(css.orangeButtonStyle)}
        size="large"
        variant="contained"
        onClick={() => updateSupervisor('en route')}
        data-testid="tracksupervisorOnWay"
        disabled={supervisorMutation.isLoading}
      >
        {t`On the way`}
      </Button>
      <Button
        className={classes(css.redButtonStyle)}
        size="large"
        variant="contained"
        onClick={() => updateSupervisor('closed')}
        data-testid="tracksupervisorClosed"
        disabled={supervisorMutation.isLoading}
      >
        {t`Closed`}
      </Button>
    </div>
  )
}


const rangeOfficerStates = {
  present: {
    color: colors.green,
    labelMsg: msg`Range officer present`,
  },
  'en route': {
    color: colors.orange,
    labelMsg: msg`Range officer on the way`,
  },
  absent: {
    color: colors.white,
    labelMsg: msg`Range officer undefined`,
  },
  closed: {
    color: colors.redLight,
    labelMsg: msg`Closed`,
  },
  confirmed: {
    color: colors.greenLight,
    labelMsg: msg`Range officer confirmed`,
  },
  'not confirmed': {
    color: colors.turquoise,
    labelMsg: msg`Range officer predefined`,
  },
} as const

function RangeOfficerStatus({ rangeSupervisionStatus }) {
  const { i18n } = useLingui();

  const { color, labelMsg } = useMemo(() => {
    if (!rangeSupervisionStatus) return rangeOfficerStates.absent;
    return rangeOfficerStates[rangeSupervisionStatus]
  }, [rangeSupervisionStatus])

  return (
    <div className={classes(css.rowStyle)}>
      {/* @ts-ignore reason below */}
      <Button
        className={classes(css.statusStyle)}
        style={{ color: colors.black, backgroundColor: color }}
        size="large"
        variant="outlined"
        disabled
        // Should be data-testid, needs to be fixed in cypress/units also
        dataid="rangeOfficerStatus"
      >
        {i18n._(labelMsg)}
      </Button>
    </div>
  )
}
