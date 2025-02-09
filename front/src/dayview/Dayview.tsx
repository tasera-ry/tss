import { useMemo } from 'react';
import classNames from 'classnames';

// Material UI components
import { Link, useHistory, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Moment for date handling
import moment from 'moment';
import { dayToString, JumpToCurrent } from '../utils/Utils';
import info from '@/assets/Info.png';
import api from '../api/api';
import InfoBox from '../infoBox/InfoBox';
import translations from '../texts/texts.json';
import css from './Dayview.module.scss';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import { ViewChanger } from '@/lib/components/ViewChanger';
import { useQuery } from 'react-query';
import { DateHeader } from '@/lib/components/DateHeader';

const classes = classNames.bind(css);

function Dayview() {

  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string}>();

  const lang = localStorage.getItem('language');
  const { dayview } = translations;

  const targetDate = useMemo(() => {
    return dateParam ?? moment().format('YYYY-MM-DD');
  }, [dateParam])

  const { data } = useQuery({
    queryKey: ['dayview', targetDate],
    queryFn: () => api.getSchedulingDate(targetDate)
  });

  const previousDayClick = () => {
    history.push(`/dayview/${moment(targetDate).subtract(1, 'day').format('YYYY-MM-DD')}`)
  }; 

  const nextDayClick = () => {
    history.push(`/dayview/${moment(targetDate).add(1, 'day').format('YYYY-MM-DD')}`)
  };

  const openHours = useMemo(() => {
    if (!data) return undefined;
    const opensAt = moment(data.open, 'HH:mm').format('H.mm');
    const closesAt = moment(data.close, 'HH:mm').format('H.mm');
    return `${dayview.OpenHours[lang]}: ${opensAt}-${closesAt}`;
  }, [data])

  return (
    <div>
      <InfoBox tabletMode={true} />
      <div className={classes(css.dayviewContainer)}>
        <DateHeader targetDate={targetDate} onPrevious={previousDayClick} onNext={nextDayClick} />
        {data && <OfficerBanner rangeSupervision={data.rangeSupervision} />}
        {openHours && <h2 className={classes(css.headerText)}>
          {openHours}
        </h2>}
        {/* Whole view */}
        <div className={classes(css.dayviewBigContainer)}>
          <div className={classes(css.viewChanger)}>
            <div className={classes(css.viewChangerCurrent)}>
              <JumpToCurrent />
            </div>
            <ViewChanger />
          </div>
          <div className="flex bg-black-tint-70">
            {!data ? (
              <CircularProgress disableShrink />
            ) : (
              <TrackList tracks={data.tracks} date={targetDate} />
            )}
            <ButtonComponent />
          </div>
        </div>
        <Link
          className="flex items-center gap-1 mt-5 pb-2 pl-2"
          to={`/weekview/${targetDate}`}
        >
          <ArrowBackIcon />
          {dayview.WeekviewLink[lang]}
        </Link>

        <hr />
        <Legends />
      </div>
    </div>
  );
}

export default Dayview;

function TrackList({ tracks, date }) {
  return (
    <div className='flex p-2 gap-2'>
      {tracks.map((track) => (
        <TrackBox
          key={track.id}
          track={track}
          date={date}
        />
      ))}
    </div>
  );
}

function TrackBox({ track, date }) {
  const lang = localStorage.getItem('language');
  const { dayview } = translations;

  const color = useMemo(() => {
    if (track.state === 'present') {
      return css.greenB;
    } else if (track.state === 'absent') {
      return css.whiteB;
    } else if (track.state === 'confirmed') {
      return css.lightGreenB;
    } else if (track.state === 'not confirmed') {
      return css.blueB;
    } else if (track.state === 'en route') {
      return css.yellowB;
    }
    return css.redB;
  }, [track])

  const link = `/trackview/${date}/${track.name}`


  return (
    <Link className="bg-white rounded p-2 flex flex-col justify-start" style={{backgroundColor: color}} to={link}>
      <span className={classes(css.bold)}>{track.name}</span>
      <span className={classes(css.overflowHidden)}>
        {track.short_description}
      </span>
      {track.notice.length > 0 && (
        <img
          className="size-11 self-center mt-auto"
          src={info}
          alt={dayview.Notice[lang]}
        />
      )}
    </Link>
  );
}


function OfficerBanner({ rangeSupervision }) {
  const lang = localStorage.getItem('language');
  const { dayview } = translations;

  const { text, color } = useMemo(() => {
    if (rangeSupervision === 'present') {
      return { text: dayview.Green[lang], color: css.greenB };
    } else if (rangeSupervision === 'absent') {
      return { text: dayview.White[lang], color: css.whiteB };
    } else if (rangeSupervision === 'confirmed') {
      return { text: dayview.Lightgreen[lang], color: css.lightGreenB };
    } else if (rangeSupervision === 'not confirmed') {
      return { text: dayview.Blue[lang], color: css.blueB };
    } else if (rangeSupervision === 'en route') {
      return { text: dayview.Orange[lang], color: css.yellowB };
    }
    return { text: dayview.Red[lang], color: css.redB };
  }, [])

  return <h2 className={classes(css.info, color)}>{text}</h2>;
}

function Legends() {
  const lang = localStorage.getItem('language');
  const { dayview } = translations;

  return (
    <div className='flex justify-center'>
      <div className='grid grid-cols-2 gap-2'>
        <LegendItem label={dayview.Open[lang]} colorClass={css.greenB} />
        <LegendItem label={dayview.Closed[lang]} colorClass={css.redB} />
        <LegendItem label={dayview.NotAvailable[lang]} colorClass={css.whiteB} />
        <div className='flex gap-1 justify-start items-center pl-2.5'>
          <img
            className="size-5"
            src={info}
            alt={dayview.Notice[lang]}
          />
          <p>
            {dayview.Notice[lang]}
          </p>
        </div>
      </div>
    </div>
  )
}


function LegendItem({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <div className='flex gap-1 justify-start items-center pl-2.5'>
      <p className={classNames("size-5 border", colorClass)} />
      <p>{label}</p>
    </div>
  );
}
