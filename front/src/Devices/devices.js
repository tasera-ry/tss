import React, { useState, useEffect } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Container from '@mui/material/Container';
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
  Switch,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import Styles from './devices.module.scss';
import api from '../api/api';
import translations from '../texts/texts.json';
import { useCookies } from 'react-cookie';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({ device_name: '', status: 'free' });
  const [cookies] = useCookies(['role']);
  const userRole = cookies.role;

  const sortDevices = (devices) => {
    // Function for sorting devices alphabetically
    return devices.sort((a, b) => a.device_name.localeCompare(b.device_name));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getAllDevices();
        const sortedDevices = sortDevices(response);
        setDevices(sortedDevices);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (rowData) => {
    const data = [...devices];
    const index = data.findIndex((item) => item.id === rowData.id);
    data[index].status = rowData.status === 'free' ? 'reserved' : 'free';

    await api.patchDevice(rowData.id, data[index]);
    const sortedData = sortDevices(data);
    setDevices(sortedData);
  };

  const handleAddRow = async () => {
    if (!newRow.device_name.trim()) {
      alert(translations.devicesList.AddError[lang]);
      return;
    }
    newRow.status = translateStatus(newRow.status);
    if (!newRow.status) {
      alert(translations.devicesList.StatusError[lang]);
      return;
    }
    try {
      const response = await api.createDevice(newRow);
      const newDevice = response[0];
      const updatedDevices = sortDevices([...devices, newDevice]);
      setDevices(updatedDevices);
      setNewRow({ device_name: '', status: 'free' });
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleEditRow = async (index) => {
    const deviceInfo = devices[index];
    try {
      await api.patchDevice(deviceInfo.id, editingRow);
      const updatedData = devices.map((device, i) =>
        i === index ? { ...device, ...editingRow } : device
      );
      setDevices(sortDevices(updatedData));
      setEditingRow(null);
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const handleDeleteRow = async (index) => {
    const deviceInfo = devices[index];
    try {
      await api.deleteDevice(deviceInfo.id);
      setDevices(devices.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const lang = localStorage.getItem('language');
  const { devicesList } = translations;
  const translateStatus = (status) => {
    if (!status || status.trim() === '') {
      return null;
    }
    const statusMap = {};
    translations.devicesList.FreeStatus.forEach((s) => (statusMap[s.toLowerCase()] = 'free'));
    translations.devicesList.ReservedStatus.forEach((s) => (statusMap[s.toLowerCase()] = 'reserved'));
    return statusMap[status.toLowerCase()] || null;
  };

  return (
    <div>
      {devices ? (
        <ScopedCssBaseline>
          <Container style={{ maxWidth: '900px', padding: '10px' }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{devicesList.DeviceName[lang]}</TableCell>
                    <TableCell>{devicesList.DeviceStatus[lang]}</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map((row, index) => (
                    <TableRow key={row.id}>
                      {editingRow && editingRow.index === index ? (
                        <>
                          <TableCell>
                            <TextField
                              value={editingRow.device_name}
                              onChange={(e) =>
                                setEditingRow({ ...editingRow, device_name: e.target.value })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={editingRow.status === 'reserved'}
                              onChange={() =>
                                setEditingRow({
                                  ...editingRow,
                                  status: editingRow.status === 'free' ? 'reserved' : 'free',
                                })
                              }
                              name="status-switch"
                              inputProps={{ 'aria-label': 'status-switch' }}
                              classes={{
                                root: editingRow.status === 'free' ? Styles.freeSwitch : Styles.reservedSwitch,
                                track: Styles.track,
                                thumb: Styles.thumb,
                              }}
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
                          <TableCell>{row.device_name}</TableCell>
                          <TableCell>
                            <Switch
                              checked={row.status === 'reserved'}
                              onChange={() => handleStatusChange(row)}
                              name="status-switch"
                              inputProps={{ 'aria-label': 'status-switch' }}
                              classes={{
                                root: row.status === 'free' ? Styles.freeSwitch : Styles.reservedSwitch,
                                track: Styles.track,
                                thumb: Styles.thumb,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {userRole === 'superuser' && (
                              <>
                                <Tooltip title={translations.tracks.editTooltip[lang]}>
                                  <IconButton onClick={() => setEditingRow({ ...row, index })}>
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={translations.tracks.deleteTooltip[lang]}>
                                  <IconButton onClick={() => handleDeleteRow(index)}>
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  {userRole === 'superuser' && (
                    <TableRow>
                      <TableCell>
                        <TextField
                          value={newRow.device_name}
                          onChange={(e) => setNewRow({ ...newRow, device_name: e.target.value })}
                          placeholder={devicesList.DeviceName[lang]}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={newRow.status === 'reserved'}
                          onChange={() =>
                            setNewRow({ ...newRow, status: newRow.status === 'free' ? 'reserved' : 'free' })
                          }
                          name="status-switch"
                          inputProps={{ 'aria-label': 'status-switch' }}
                          classes={{
                            root: newRow.status === 'free' ? Styles.freeSwitch : Styles.reservedSwitch,
                            track: Styles.track,
                            thumb: Styles.thumb,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={handleAddRow} startIcon={<Add />}>
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </ScopedCssBaseline>
      ) : null}
    </div>
  );
};

export default Devices;
