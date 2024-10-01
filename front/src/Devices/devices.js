import React, { useState } from 'react';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import Container from '@material-ui/core/Container';
import MaterialTable from 'material-table';
import Switch from '@material-ui/core/Switch';
import Styles from './devices.module.scss';

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
import api from '../api/api';
import translations from '../texts/texts.json';
import { useCookies } from 'react-cookie';

const Devices = () => {
  const [devices, setDevices] = useState(null);
  const [cookies] = useCookies(['role']);
  const userRole = cookies.role;

  const sortDevices = (devices) => {
    // Function for sorting devices alphabetically
    return devices.sort((a, b) => a.device_name.localeCompare(b.device_name));
  };

  useState(async () => {
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
  
  const lang = localStorage.getItem('language');
  const { devicesList } = translations;
  const translateStatus = (status) => {
    if(!status || status.trim() === ""){
      return null;
    }
    const statusMap = {};
    translations.devicesList.FreeStatus.forEach( s => statusMap[s.toLowerCase()] = 'free');
    translations.devicesList.ReservedStatus.forEach( s => statusMap[s.toLowerCase()] = 'reserved');
    return statusMap[status.toLowerCase()] || null;
  }
  const columns = [
    { title: devicesList.DeviceName[lang], field: 'device_name' },
    {
      title: devicesList.DeviceStatus[lang],
      field: 'status',
      render: (rowData) => (
        <Switch
          key={rowData.status}
          checked={rowData.status === 'free' ? false : true}
          onChange={() => handleStatusChange(rowData)}
          name="status-switch"
          inputProps={{ 'aria-label': 'status-switch' }}
          classes={{
            root: rowData.status === 'free' ? Styles.freeSwitch : Styles.reservedSwitch,
            track: Styles.track,
            thumb: Styles.thumb,
          }}
        />
      ),
    },
  ];
  
  return (
    <div>
      {devices ? (
        <ScopedCssBaseline>
          <Container style={{ maxWidth: '900px', padding: '10px' }}>
            <MaterialTable
              title={devicesList.DeviceList[lang]}
              columns={columns}
              data={devices}
              icons={{
                Add: AddBox,
                Check: Check,
                Clear: Clear,
                Delete: DeleteOutline,
                DetailPanel: ChevronRight,
                Edit: Edit,
                Export: SaveAlt,
                Filter: FilterList,
                FirstPage: FirstPage,
                LastPage: LastPage,
                NextPage: ChevronRight,
                PreviousPage: ChevronLeft,
                ResetSearch: Clear,
                Search: Search,
                SortArrow: ArrowDownward,
                ThirdStateCheck: Remove,
                ViewColumn: ViewColumn,
              }}
              localization={{
                header: {
                  actions: devicesList.DeviceActions[lang]
                }
              }}
              editable={{
                onRowAdd: userRole === 'superuser' ? (newData) =>
                  new Promise((resolve, reject) => {
                    if(!newData.device_name || newData.device_name.trim === "") {
                      alert(devicesList.AddError[lang]);
                      reject();
                      return;
                    }
                    newData.status = translateStatus(newData.status);
                    if (!newData.status) {
                      alert(devicesList.StatusError[lang]);
                      reject();
                      return;
                    }
                      api.createDevice(newData).then((response) => {
                        const newDevice = response[0]
                        const updatedDevices = sortDevices([...devices, newDevice]);
                        setDevices(updatedDevices);
                        resolve();
                      });
                  }) : null,
                onRowUpdate: userRole === 'superuser' ? (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    api.patchDevice(oldData.id, newData).then(() => {
                      const updatedDevices = [...devices];
                      const index = updatedDevices.findIndex(item => item.id === oldData.id);
                      updatedDevices[index] = newData;
                      const sortedUpdatedDevices = sortDevices(updatedDevices);
                      setDevices(sortedUpdatedDevices);
                      resolve();
                    });
                  }) : null,
                onRowDelete: userRole === 'superuser' ? (oldData) =>
                  new Promise((resolve, reject) => {
                    api.deleteDevice(oldData.id).then(() => {
                      const data = [...devices];
                      data.splice(data.indexOf(oldData), 1);
                      setDevices(data);
                      resolve();
                    });
                  }) : null,
              }}
              options={{
                search: true,
                paging: false,
                sorting: false,
              }}
            />
          </Container>
        </ScopedCssBaseline>
      ) : null}
    </div>
  );
};

export default Devices;
