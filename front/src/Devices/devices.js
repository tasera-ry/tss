import React, { useState } from 'react';
import './devices.module.scss';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import Container from '@material-ui/core/Container';
import MaterialTable from 'material-table';
import Switch from '@material-ui/core/Switch';

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


const Devices = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Labradar', status: 'free' },
    { id: 2, name: 'Timer 1', status: 'free' },
    { id: 3, name: 'Timer 2', status: 'free' }
  ]);

  const handleStatusChange = (rowData) => {
    const data = [...devices];
    const index = data.findIndex((item) => item.id === rowData.id);
    data[index].status = rowData.status === 'free' ? 'reserved' : 'free';
    setDevices(data);
  };

  const columns = [
    { title: 'Name', field: 'name' },
    {
      title: 'Status (free/reserved)',
      field: 'status',
      render: (rowData) => (
        <Switch
          checked={rowData.status === 'free' ? false : true}
          onChange={() => handleStatusChange(rowData)}
          color="primary"
          name="status-switch"
          inputProps={{ 'aria-label': 'status-switch' }}
        />
      )
    }
  ];

  return (
    <ScopedCssBaseline>
      <Container style={{ maxWidth: '900px', padding: '10px'  }}> 
        <MaterialTable
          title="Device List"
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
            ViewColumn: ViewColumn
          }}
          editable={{
            onRowAdd: newData =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  setDevices([...devices, { ...newData, status: 'free' }]);
                  resolve();
                }, 600);
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const data = [...devices];
                  data[data.indexOf(oldData)] = newData;
                  setDevices(data);
                  resolve();
                }, 600);
              }),
            onRowDelete: oldData =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const data = [...devices];
                  data.splice(data.indexOf(oldData), 1);
                  setDevices(data);
                  resolve();
                }, 600);
              })
          }}
          options={{
            search: true,
            paging: false,
            sorting: false
          }}
        />
      </Container>
    </ScopedCssBaseline>
  );
};

export default Devices;