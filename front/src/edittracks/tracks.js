import React, { useState, useEffect, forwardRef } from 'react';
import './tracks.css';

// Material UI components
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import MaterialTable from 'material-table';

// Icon setup
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import * as l10nLines from '../texts/texts.json';

import api from '../api/api';
import { validateLogin } from '../utils/Utils';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const tableStyle = {
  backgroundColor: '#f2f0eb',
};
const headerStyle = {
  backgroundColor: '#ebe7df',
};

/* Get first element of an array */

const RequestStatusAlert = ({ statusSetter, requestStatus, text }) => {
  if (requestStatus === null) {
    return <></>;
  }
  return (
    <Snackbar open={requestStatus !== null} onClose={() => statusSetter(null)}>
      <Alert severity={requestStatus}>{text}</Alert>
    </Snackbar>
  );
};

/* eslint-disable-next-line */
const MaybeProgress = ({ finished }) =>
  finished ? <></> : <LinearProgress variant="query" />;

/*
  Main table for showing track information
  Parts commented out = adding or removing tracks.
*/
const TrackTable = ({
  setTrackData,
  trackData,
  setRequestStatus,
  setRequestText,
  l10n,
  lang,
}) => (
  <MaterialTable
    style={tableStyle}
    localization={{
      pagination: {
        nextTooltip: l10n.nextTooltip[lang],
        previousTooltip: l10n.previousTooltip[lang],
        firstTooltip: l10n.firstTooltip[lang],
        lastTooltip: l10n.lastTooltip[lang],
        // labelDisplayedRows: l10n.pagination[lang],
        labelRowsSelect: l10n.labelRowsSelect[lang],
      },
      header: {
        actions: l10n.tableHeaderActions[lang],
        cellStyle: { backgroundColor: '#f2f0eb' },
      },
      toolbar: {
        searchPlaceholder: l10n.searchPlaceholder[lang],
      },
      body: {
        emptyDataSourceMessage: l10n.emptyDataSourceMessage[lang],
        editTooltip: l10n.editTooltip[lang],
        editRow: {
          saveTooltip: l10n.saveTooltip[lang],
          cancelTooltip: l10n.cancelTooltip[lang],
        },
      },
    }}
    // Editing tracks
    editable={{
      /* eslint-disable-next-line */
      onRowAdd: async ({ name, description, short_description }) => {
        try {
          const data = await api.addTrack({
            name,
            description,
            short_description,
            range_id: trackData[0].range_id,
          });
          setTrackData(trackData.concat(data));
          setRequestStatus('success');
          setRequestText('Rata lisätty');
        } catch (e) {
          setRequestStatus('error');
          setRequestText('Radan lisäys epäonnistui');
        }
      },
      onRowUpdate: async (newData, oldData) => {
        const trackInfo = trackData.filter(
          (track) =>
            track.name === oldData.name &&
            track.short_description === oldData.short_description &&
            track.description === oldData.description,
        )[0];

        try {
          await api.patchTrack(trackInfo.id, newData);
          const modified = trackData
            .filter((track) => track.id !== trackInfo.id)
            .concat({ ...trackInfo, ...newData });
          setTrackData(modified);
          setRequestStatus('success');
          setRequestText(l10n.rowUpdateSuccess[lang]);
        } catch (err) {
          setRequestStatus('error');
          setRequestText(l10n.rowUpdateFail[lang]);
        }
      },
      onRowDelete: async ({ name, description }) => {
        const trackInfo = trackData.filter(
          (track) => track.name === name && track.description === description,
        )[0];

        try {
          await api.deleteTrack(trackInfo.id);
          setTrackData(trackData.filter((track) => track.id !== trackInfo.id));
          setRequestStatus('success');
          setRequestText('Rata poistettu');
        } catch (err) {
          setRequestStatus('error');
          setRequestText('Radan poisto epäonnistui');
        }
      },
    }}
    options={{
      pageSize: 10,
      headerStyle,
    }}
    icons={tableIcons}
    columns={[
      {
        title: l10n.tableHeaderName[lang],
        field: 'name',
        headerStyle,
      },
      {
        title: l10n.tableHeaderDescription[lang],
        field: 'description',
        headerStyle,
      },
      {
        title: l10n.tableHeaderShort[lang],
        field: 'short_description',
        headerStyle,
      },
    ]}
    data={trackData}
    title={l10n.tableTitle[lang]}
  />
);

const TrackCRUD = () => {
  const [trackData, setTrackData] = useState([]);
  const [initFinished, setInitFinished] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestText, setRequestText] = useState(null);

  // TODO: this needs to be centralized for best effect
  /* eslint-disable-next-line */
  const RedirectToWeekview = () => (window.location.href = '/');

  useEffect(() => {
    (async () => {
      const logInSuccess = await validateLogin();
      if (logInSuccess) {
        try {
          setTrackData(await api.getTracks());
        } catch (e) {
          // /api/track returns 404 when no tracks are set, should be fixed in
          // server code
          setTrackData([]);
        }
        setInitFinished(true);
      } else {
        RedirectToWeekview();
      }
    })();
  }, [initFinished]);

  // Translations
  const l10n = l10nLines.tracks;
  const lang = localStorage.getItem('language');

  return (
    <ScopedCssBaseline>
      <Container>
        <MaybeProgress finished={initFinished} />
        <TrackTable
          setTrackData={setTrackData}
          trackData={trackData}
          setRequestStatus={setRequestStatus}
          setRequestText={setRequestText}
          l10n={l10n}
          lang={lang}
        />
        <RequestStatusAlert
          statusSetter={setRequestStatus}
          requestStatus={requestStatus}
          text={requestText}
          textSetter={setRequestText}
        />
      </Container>
    </ScopedCssBaseline>
  );
};

export default TrackCRUD;
