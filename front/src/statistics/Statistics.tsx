import { useState, useMemo } from 'react';
import classNames from 'classnames';

// Date management
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import VisitorLogging from '../VisitorLogging/VisitorLogging';
import css from './Statistics.module.scss';
import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from 'react-query';
import { DateHeader } from '@/lib/components/DateHeader';
import { useLanguageContext } from '@/i18n';
import { MonthlyVisitorsByTrackChart } from '@/statistics/components/MonthlyVisitorsByTrackChart';
import { VisitorsTodayChart } from '@/statistics/components/VisitorsTodayChart';
import { CurrentDayStatistics } from '@/statistics/components/CurrentDayStatistics';
import { schedulingFreeformQuery } from '@/statistics/components/schedulingFreeformQuery';

const classes = classNames.bind(css);

const Statistics = () => {
  const { t, i18n } = useLingui()
  const [locale] = useLanguageContext()

  const [date, setDate] = useState(moment());
  const [modalOpen, setModalOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastSeverity, setToastSeverity] = useState('success');
  const [toastMessage, setToastMessage] = useState('');

  const handleSnackbarClose = (reason) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  const monthQuery = useQuery(
    ['schedulingFreeformMonth', date],
    schedulingFreeformQuery,
    {
      select: (data) => {
       const monthVisitors = data.map(({ scheduleId, tracks }) => {
          if (!scheduleId) return 0;
          return tracks.reduce((total, { scheduled }) => total + scheduled.visitors, 0)
        })
        const currentDay = moment(date).date()
        return {
          totalVisitors: monthVisitors.reduce((a, b) => a + b, 0),
          totalVisitorsForDay: monthVisitors[currentDay - 1]
        };
      },
    }
  )

  const formatedMonth = useMemo(() => {
    return i18n.date(date.toDate(), { month: 'long', year: 'numeric' })
  }, [date])

  const formatedDay = useMemo(() => {
    return i18n.date(date.toDate(), { day: 'numeric', month: 'numeric', year: 'numeric' })
  }, [date])

  return (
    <div className={classes(css.container)}>
      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={(_, reason) => handleSnackbarClose(reason)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={(_, reason) => handleSnackbarClose(reason)}
          severity={toastSeverity}
        >
          {toastMessage}!
        </MuiAlert>
      </Snackbar>
      {/* Section for selecting date */}
      <div className={classes(css.firstSection)}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={locale}>
            <DatePicker
              closeOnSelect
              label={t`Choose date`}
              value={moment(date)}
              // onChange={(newDate) => setDate(newDate)}
              onAccept={(newDate) => setDate(newDate)}
            />
          </LocalizationProvider>
      </div>
      <hr />
      <div className={classes(css.buttonContainer)}>
        <Button
          className={classes(css.openModal)}
          onClick={() => setModalOpen(true)}
          style={{ backgroundColor: '#d1ccc2' }}
          variant="contained"
        >
          {t`Open user logging`}
        </Button>
      </div>
      <Modal
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div>
          <VisitorLogging
            handleClose={() => setModalOpen(false)}
            setToastSeverity={setToastSeverity}
            setToastMessage={setToastMessage}
            setToastOpen={setToastOpen}
          />
        </div>
      </Modal>
      <DateHeader 
        targetDate={moment(date).format('YYYY-MM-DD')}
        onPrevious={() => setDate(prev => moment(prev.subtract(1, 'day')))}
        onNext={() => setDate(prev => moment(prev.add(1, 'day')))}
      />
      <div className="flex flex-col items-center gap-4">
        <div className='flex flex-col items-center gap-2'>
          <h2>{t`Day`}</h2>
          <span>
            <Trans>
              Visitors in total {formatedDay}: {monthQuery.data?.totalVisitorsForDay ?? 0}
            </Trans>
          </span>
        </div>
        <CurrentDayStatistics date={date} />
        <div className='flex flex-col items-center gap-2'>
          <h2>{t`Month`}</h2>
          <span>
            <Trans>
              Visitors in total {formatedMonth}: {monthQuery.data?.totalVisitors ?? 0}
            </Trans>
          </span>
        </div>
        <VisitorsTodayChart date={date} />
        <MonthlyVisitorsByTrackChart date={date} />
      </div>
    </div>
  );
};

export default Statistics;
