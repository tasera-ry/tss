import { useCallback, useMemo, useState } from 'react';

import { Alert } from '@mui/lab';
import {
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
} from '@mui/material';

import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import api from '../../api/api';
import css from './ChangePassword.module.scss';
import { useMutation, useQuery } from 'react-query';

const classes = classNames.bind(css);

/**
 * Component for displaying association supervisions in a table
 * @param {number} cookies - User cookies
 */
export default function Supervisions({ cookies }) {
  const { t } = useLingui();
  const [notification, setNotification] = useState(null);

  const query = useQuery({
    queryKey: ['supervisions'],
    queryFn: async () => {
      if (cookies.role === 'association') {
        // If the user in an association, get a list of their officers
        const officerResponse = await api.getRangeOfficers(cookies.id);
        const supervisionResponse = await api.getSupervisions(cookies.id);

        return {
          supervisions: supervisionResponse,
          rangeOfficerList: officerResponse,
        };
      }
      if (cookies.role === 'rangeofficer') {
        // If the user is a rangeofficer, get the association they are associated with
        const response = await api.getAssociation(cookies.id);
        const associationId = response[0].association_id;

        // Get all supervisions for the association
        const supervisionResponse = await api.getSupervisions(associationId);

        // Filter supervisions available for the range officer,
        // or ones where they have been already assigned
        const availableSupervisions = supervisionResponse.filter(
          (supervision) =>
            supervision.rangeofficer_id === null ||
            supervision.rangeofficer_id === Number(cookies.id),
        );

        return {
          supervisions: availableSupervisions,
          rangeOfficerList: [],
        };
      }
    },
  });

  const supervisions = useMemo(() => {
    return query.data?.supervisions ?? [];
  }, [query.data]);

  const rangeOfficerList = useMemo(() => {
    return query.data?.rangeOfficerList ?? [];
  }, [query.data]);

  const createNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold">{t`Confirm supervisions`}</h1>

      <p className="text-sm text-gray-700">
        {cookies.role === 'association'
          ? t`Association's upcoming supervisions`
          : t`Your association's free supervisions. If the status is confirmed, the association has set the shift for you`}
      </p>

      {notification && (
        <Alert severity={notification.type}>{notification.message}</Alert>
      )}

      <Table data-testid="supervisions-table">
        <TableHead>
          <TableRow>
            <TableCell>{t`Date`}</TableCell>
            <TableCell>{t`Status`}</TableCell>
            <TableCell>{t`Assigned officer`}</TableCell>
            <TableCell>{t`ETA`}</TableCell>
            <TableCell>{t`Actions`}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {supervisions?.map((supervision) => (
            <SupervisionRow
              key={supervision.id}
              supervision={supervision}
              officers={rangeOfficerList}
              createNotification={createNotification}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SupervisionRow({ supervision, officers, createNotification }) {
  const { t, i18n } = useLingui();

  const [status, _setStatus] = useState(supervision.range_supervisor);
  const [officer, setOfficer] = useState(supervision.rangeofficer_id);
  const [time, setTime] = useState(supervision.arriving_at);

  const setStatus = useCallback((status) => {
    _setStatus(status);
    if (status !== 'confirmed') {
      setOfficer(null);
      setTime(null);
    }
  }, []);

  const formatedDate = useMemo(() => {
    return i18n.date(supervision.date, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  }, [supervision.date, i18n]);

  const resetMutation = useMutation({
    mutationFn: async () => {
      await api.putSupervision(supervision.id, {
        range_supervisor: 'not confirmed',
        rangeofficer_id: null,
        arriving_at: null,
      });
    },
    onSuccess: () => {
      setStatus('not confirmed');
      setOfficer(null);
      setTime(null);
      createNotification('success', t`Supervision cleared for ${formatedDate}`);
    },
    onError: () => {
      createNotification('error', t`Something went wrong`);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await api.putSupervision(supervision.id, {
        range_supervisor: status,
        rangeofficer_id: officer,
        arriving_at: time,
      });
    },
    onSuccess: () => {
      createNotification('success', t`Supervision set for ${formatedDate}`);
    },
    onError: () => {
      createNotification('error', t`Something went wrong`);
    },
  });

  return (
    <TableRow key={supervision.id} data-testid="supervisions-row">
      <TableCell>{formatedDate}</TableCell>
      <StatusCell status={status} setStatus={setStatus} />
      <OfficerCell
        officer={officer}
        setOfficer={setOfficer}
        officers={officers}
        disabled={status !== 'confirmed'}
      />
      <TableCell data-testid="time-cell">
        <TextField
          id="time"
          type="time"
          value={time || ''}
          onChange={(event) => setTime(event.target.value)}
          disabled={status !== 'confirmed'}
        />
      </TableCell>

      <TableCell data-testid="actions-cell">
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className={classes(css.acceptButton)}
          onClick={() => submitMutation.mutate()}
          data-testid="submit-button"
        >
          {t`Set`}
        </Button>
      </TableCell>
      <TableCell>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className={classes(css.removeButton)}
          onClick={() => resetMutation.mutate()}
          data-testid="reset-button"
        >
          {t`Reset`}
        </Button>
      </TableCell>
    </TableRow>
  );
}

const statusColors = {
  'not confirmed': '',
  confirmed: 'bg-green-light',
  absent: 'bg-red-light',
};

function StatusCell({ status, setStatus }) {
  const { t } = useLingui();
  return (
    <TableCell data-testid="status-cell" className="w-full">
      <Select
        className={`w-full ${statusColors[status]}`}
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <MenuItem value="not confirmed">{t`Confirm date`}</MenuItem>
        <MenuItem value="confirmed">{t`Confirmed`}</MenuItem>
        <MenuItem value="absent">{t`Absent`}</MenuItem>
      </Select>
    </TableCell>
  );
}

function OfficerCell({ officer, setOfficer, officers, disabled }) {
  const { t } = useLingui();
  return (
    <TableCell data-testid="officer-cell">
      <Select
        className="w-full"
        value={officer ?? 'not selected'}
        onChange={(event) => setOfficer(event.target.value)}
        disabled={disabled}
      >
        <MenuItem value="not selected" disabled hidden>
          {t`Not selected`}
        </MenuItem>
        {officers.map((officer) => (
          <MenuItem key={officer.id} value={officer.id}>
            {officer.name}
          </MenuItem>
        ))}
      </Select>
    </TableCell>
  );
}
