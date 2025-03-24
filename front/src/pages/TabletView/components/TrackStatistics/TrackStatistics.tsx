import { useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { useCallback, useState } from 'react';
import { useMutation } from 'react-query';
import api from '../../../../api/api';

interface TrackStatisticsProps {
  track: any;
  disabled: boolean;
}

export function TrackStatistics({ track, disabled }: TrackStatisticsProps) {
  const { t } = useLingui();

  const { scheduled, id } = track;

  const scheduled_range_supervision_id = scheduled
    ? scheduled.scheduled_range_supervision_id
    : null;

  const [open, setOpen] = useState(false);

  const [visitors, setVisitors] = useState<number>(scheduled?.visitors ?? 0);

  const mutateTrackVisitors = useMutation({
    mutationFn: (newVisitors: number) => {
      return api.patchScheduledSupervisionTrack(
        scheduled_range_supervision_id,
        id,
        { visitors: newVisitors },
      );
    },
    onSuccess: (_, newVisitors) => {
      setVisitors(newVisitors);
    },
  });

  const onDecrease = useCallback(() => {
    if (visitors <= 0) return;
    setOpen(true);
  }, [visitors]);

  const onConfirmDecrease = useCallback(() => {
    mutateTrackVisitors.mutate(visitors - 1);
    setOpen(false);
  }, [visitors, mutateTrackVisitors]);

  const onIncrease = useCallback(() => {
    mutateTrackVisitors.mutate(visitors + 1);
  }, [visitors, mutateTrackVisitors]);

  const isDisabled =
    track.trackSupervision === 'absent' ||
    disabled ||
    mutateTrackVisitors.isLoading;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        name="decrease-visitors"
        disabled={isDisabled}
        variant="contained"
        className="text-2xl! rounded-2xl! bg-[#d1ccc2]!"
        onClick={onDecrease}
      >
        -
      </Button>
      <span className="text-2xl flex items-center justify-center">
        {visitors}
      </span>
      <Button
        name="increase-visitors"
        disabled={isDisabled}
        variant="contained"
        className="text-2xl! rounded-2xl! bg-[#d1ccc2]!"
        onClick={onIncrease}
      >
        +
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="absolute top-0 left-0 w-full h-full bg-black/50">
          <div className="absolute max-w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-4 flex flex-col gap-4 shadow-lg">
            <h2 id="simple-modal-title" className="font-bold text-2xl">
              {t`Warning!`}
            </h2>
            <p id="simple-modal-description">
              {t`Users should not be reduced, Do you really want to reduce the number of users?`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="contained"
                className="bg-[#d1ccc2] text-black hover:bg-[#b3afa6]"
                onClick={onConfirmDecrease}
              >
                {t`Yes`}
              </Button>
              <Button
                variant="contained"
                className="bg-[#4caf50] text-black hover:bg-[#388e3c]"
                onClick={() => setOpen(false)}
              >
                {t`No`}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
