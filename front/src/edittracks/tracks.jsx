import React, { useState, useEffect } from 'react';
import './tracks.scss';
// Material UI components
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
// Translations
import lodash from 'lodash';
// Axios for calls to backend
import axios from 'axios';
import l10nLines from '../texts/texts.json';
// Token validation
import { validateLogin } from '../utils/Utils';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';

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

const MaybeProgress = ({ finished }) =>
  finished ? <></> : <LinearProgress variant="query" />;

const TrackTable = ({
  setTrackData,
  trackData,
  setRequestStatus,
  setRequestText,
  setRefresh,
  l10n,
  lang,
}) => {
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({ name: '', description: '', short_description: '' });

  const handleAddRow = async () => {
    try {
      const response = await axios.post('/api/track', {
        ...newRow,
        range_id: trackData[0].range_id,
      });
      setTrackData([...trackData, response.data]);
      setRequestStatus('success');
      setRequestText('Rata lisätty');
      setNewRow({ name: '', description: '', short_description: '' });
      setRefresh(true);
    } catch (e) {
      setRequestStatus('error');
      setRequestText('Radan lisäys epäonnistui.');
    }
  };

  const handleEditRow = async (index) => {
    const trackInfo = trackData[index];
    try {
      await axios.put(`/api/track/${trackInfo.id}`, editingRow);
      const updatedData = trackData.map((track, i) =>
        i === index ? { ...track, ...editingRow } : track
      );
      setTrackData(updatedData);
      setRequestStatus('success');
      setRequestText(l10n.rowUpdateSuccess[lang]);
      setEditingRow(null);
      setRefresh(true);
    } catch (e) {
      setRequestStatus('error');
      setRequestText(l10n.rowUpdateFail[lang]);
    }
  };

  const handleDeleteRow = async (index) => {
    const trackInfo = trackData[index];
    try {
      await axios.delete(`/api/track/${trackInfo.id}`);
      setTrackData(trackData.filter((_, i) => i !== index));
      setRequestStatus('success');
      setRequestText('Rata poistettu');
    } catch (e) {
      setRequestStatus('error');
      setRequestText('Radan poisto epäonnistui');
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{l10n.tableHeaderName[lang]}</TableCell>
            <TableCell>{l10n.tableHeaderDescription[lang]}</TableCell>
            <TableCell>{l10n.tableHeaderShort[lang]}</TableCell>
            <TableCell>{l10n.tableHeaderActions[lang]}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trackData.map((row, index) => (
            <TableRow key={row.id}>
              {editingRow && editingRow.index === index ? (
                <>
                  <TableCell>
                    <TextField
                      value={editingRow.name}
                      onChange={(e) =>
                        setEditingRow({ ...editingRow, name: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editingRow.description}
                      onChange={(e) =>
                        setEditingRow({ ...editingRow, description: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editingRow.short_description}
                      onChange={(e) =>
                        setEditingRow({ ...editingRow, short_description: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditRow(index)}>
                      <Save />
                    </IconButton>
                    <IconButton onClick={() => setEditingRow(null)}>
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.short_description}</TableCell>
                  <TableCell>
                    <Tooltip title={l10n.editTooltip[lang]}>
                      <IconButton onClick={() => setEditingRow({ ...row, index })}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={l10n.deleteTooltip[lang]}>
                      <IconButton onClick={() => handleDeleteRow(index)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <TextField
                value={newRow.name}
                onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                placeholder={l10n.tableHeaderName[lang]}
              />
            </TableCell>
            <TableCell>
              <TextField
                value={newRow.description}
                onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                placeholder={l10n.tableHeaderDescription[lang]}
              />
            </TableCell>
            <TableCell>
              <TextField
                value={newRow.short_description}
                onChange={(e) => setNewRow({ ...newRow, short_description: e.target.value })}
                placeholder={l10n.tableHeaderShort[lang]}
              />
            </TableCell>
            <TableCell>
              <Button onClick={handleAddRow} startIcon={<Add />}>
                {l10n.addButton[lang]}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TrackCRUD = () => {
  const [trackData, setTrackData] = useState([]);
  const [initFinished, setInitFinished] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestText, setRequestText] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // TODO: this needs to be centralized for best effect
  function RedirectToWeekview() {
    window.location.href = '/';
  }

  // run at start
  useEffect(() => {
    (async () => {
      const logInSuccess = await validateLogin();
      if (logInSuccess) {
        updateData();
        setInitFinished(true);
      } else {
        RedirectToWeekview();
      }
    })();
  }, [initFinished]);

  // run if changes to users
  useEffect(() => {
    if(refresh){
      updateData();
    }
  }, [refresh]);

  const updateData = async() => {
    try {
      const response = await axios.get('/api/track');
      setTrackData(response.data);
      setRefresh(false);
    } catch (e) {
      // /api/track returns 404 when no tracks are set, should be fixed in
      // server code
      setTrackData([]);
    }
  }

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
          setRefresh={setRefresh}
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
