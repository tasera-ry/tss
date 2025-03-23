import { NewTrackRow } from '@/pages/EditTracksView/components/NewTrackRow';
import { TrackRow } from '@/pages/EditTracksView/components/TrackRow';
import { validateLogin } from '@/utils/Utils';
import { useLingui } from '@lingui/react/macro';
import {
  Alert,
  type AlertColor,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

export function EditTracksView() {
  const { t } = useLingui();

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    validateLogin().then((res) => {
      if (!res) window.location.href = '/';
    });
  }, []);

  const trackQuery = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await axios.get('/api/track');
      return response.data;
    },
    onError: () => {
      setToast({
        open: true,
        message: t`Error fetching tracks`,
        severity: 'error',
      });
    },
    initialData: [],
  });

  const rangeId = useMemo(() => {
    return trackQuery?.data?.[0]?.range_id ?? -1;
  }, [trackQuery.data]);

  return (
    <ScopedCssBaseline>
      {trackQuery.isLoading && <LinearProgress variant="query" />}
      <div className="p-4 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-center">{t`Tracks`}</h1>
        <div className="max-w-screen-lg rounded-lg border border-gray-300 bg-white shadow-md">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t`Name`}</TableCell>
                <TableCell>{t`Description`}</TableCell>
                <TableCell>{t`Short description`}</TableCell>
                <TableCell className="text-center!">{t`Actions`}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackQuery.data.map((row) => (
                <TrackRow key={row.id} track={row} setToast={setToast} />
              ))}
              <NewTrackRow rangeId={rangeId} setToast={setToast} />
            </TableBody>
          </Table>
        </div>
        <Snackbar
          open={toast.open}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          autoHideDuration={3000}
        >
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </div>
    </ScopedCssBaseline>
  );
}
