import './tracks.css'
import React, { useState, useEffect } from 'react'
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline'
import Container from '@material-ui/core/Container'
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from '@material-ui/core/Button'
import Alert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import MaterialTable from 'material-table'

import * as l10nLines from './texts/texts.json'

import lodash from 'lodash'
import axios from 'axios'



// Icon setup
import { forwardRef } from 'react'
import AddBox from '@material-ui/icons/AddBox'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Check from '@material-ui/icons/Check'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Clear from '@material-ui/icons/Clear'
import DeleteOutline from '@material-ui/icons/DeleteOutline'
import Edit from '@material-ui/icons/Edit'
import FilterList from '@material-ui/icons/FilterList'
import FirstPage from '@material-ui/icons/FirstPage'
import LastPage from '@material-ui/icons/LastPage'
import Remove from '@material-ui/icons/Remove'
import SaveAlt from '@material-ui/icons/SaveAlt'
import Search from '@material-ui/icons/Search'
import ViewColumn from '@material-ui/icons/ViewColumn'

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
}



const l10n = l10nLines.tracks
const lang = localStorage.getItem("language")

/* Get first element of an array */

const RequestStatusAlert = ({statusSetter, requestStatus, text}) => {
  if(requestStatus === null)
  {
    return <></>
  }
  return (
    <Snackbar open={requestStatus} onClose={() => statusSetter(null)}>
      <Alert severity={requestStatus}>
        {text}
      </Alert>
    </Snackbar>
  )
}

const MaybeProgress = ({finished}) => finished
      ? <></>
      : <LinearProgress variant="query" />

const TrackTable = ({setTrackData, trackData, setRequestStatus, setRequestText, opts}) => {
  return (
    <MaterialTable
      localization={{
        pagination: {
          nextTooltip: l10n.nextTooltip[lang],
          previousTooltip: l10n.previousTooltip[lang],
          firstTooltip: l10n.firstTooltip[lang],
          lastTooltip: l10n.lastTooltip[lang],
          labelDisplayedRows: l10n.pagination[lang],
          labelRowsSelect: l10n.labelRowsSelect[lang]
        }
        , header: {
          actions: l10n.tableHeaderActions[lang]
        }
        , toolbar: {
          searchPlaceholder: l10n.searchPlaceholder[lang]
        }
        , body: {
          emptyDataSourceMessage: l10n.emptyDataSourceMessage[lang],
          editTooltip: l10n.editTooltip[lang],
          editRow: {
            saveTooltip: l10n.saveTooltip[lang],
            cancelTooltip: l10n.cancelTooltip[lang]
          }
        }
      }}
      // Other views only support viewing 7 tracks, so no adding or deleting
      // tracks.
      editable={{
        // onRowAdd: ({name, description}) => {
        //   return new Promise(async (resolve, reject) => {
        //     try
        //     {
        //       const response = await axios.post(
        //         '/api/track'
        //         , {name: name
        //            , description: description
        //            , range_id: trackData[0].range_id
        //           }, opts)
        //       setTrackData(trackData.concat(response.data))
        //       setRequestStatus('success')
        //       setRequestText('Rata lisätty')
        //       resolve()
        //     }
        //     catch(e)
        //     {
        //       setRequestStatus('error')
        //       setRequestText('Radan lisäys epäonnistui')
        //       reject()
        //     }
        //   })
        // }
        onRowUpdate: (newData, oldData) => {
          return new Promise(async (resolve, reject) => {
            resolve()
            const trackInfo = trackData
                  .filter(track => track.name === oldData.name
                          && track.description === oldData.description)[0]

            if(trackInfo === undefined)
            {
              setRequestStatus('error')
              setRequestText(l10n.rowUpdateFail[lang])
              reject()
            }

            try
            {
              const response = await axios.put(
                `/api/track/${trackInfo.id}`
                , newData
                , opts)
              const modified = trackData.filter(track => track.id !== trackInfo.id)
                    .concat(Object.assign({}, trackInfo, newData))
              setTrackData(modified)
              setRequestStatus('success')
              setRequestText(l10n.rowUpdateSuccess[lang])
            }
            catch(e)
            {
              setRequestStatus('error')
              setRequestText(l10n.rowUpdateFail[lang])
              reject()
            }
            resolve()
          })
        }
        // , onRowDelete: ({name, description}) => {
        //   return new Promise(async (resolve, reject) => {

        //     const trackInfo = trackData
        //           .filter(track => track.name === name
        //                   && track.description === description)
        //           .head()

        //     // Should never happen
        //     if(trackInfo === undefined)
        //     {
        //       setRequestStatus('error')
        //       setRequestText('Radan poisto epäonnistui')
        //       reject()
        //     }

        //     try
        //     {
        //       const response = await axios.delete(`/api/track/${trackInfo.id}`, opts)
        //       setTrackData(trackData.filter(track => track.id !== trackInfo.id))
        //       setRequestStatus('success')
        //       setRequestText('Rata poistettu')
        //       resolve()
        //     }
        //     catch(e)
        //     {
        //       setRequestStatus('error')
        //       setRequestText('Radan poisto epäonnistui')
        //       reject()
        //     }

        //   })
        // }
      }}
      options={{
        pageSize: 10
      }}
      icons={tableIcons}
      columns={[
        { title: l10n.tableHeaderName[lang], field: 'name' }
        , { title: l10n.tableHeaderDescription[lang], field: 'description' },
      ]}
      data={trackData}
      title={ l10n.tableTitle[lang] }
    />
  )
}
const TrackCRUD = () => {
  const [trackData, setTrackData] = useState([])
  const [initFinished, setInitFinished] = useState(false)
  const [requestStatus, setRequestStatus] = useState(null)
  const [requestText, setRequestText] = useState(null)
  const [rangeData, setRangeData] = useState([])

  const partialFetch = lodash.partial(fetch, '/api/track')

  const isSuperuser = localStorage.getItem('role') === 'superuser'
  const token = localStorage.getItem('token')

  const opts = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  useEffect(() => {
    (async () => {
      try
      {
        const response = await axios.get('/api/track')
        setTrackData(response.data.sort((a, b) => a.name > b.name))
      }
      catch(e)
      {
        // /api/track returns 404 when no tracks are set, should be fixed in
        // server code
        setTrackData([])
      }
      setInitFinished(true)
    })()
  }, [initFinished])

  return (
    <ScopedCssBaseline>
      <Container>
        <MaybeProgress finished={initFinished} />
        <TrackTable
          setTrackData={setTrackData}
          trackData={trackData}
          setRequestStatus={setRequestStatus}
          setRequestText={setRequestText}
          opts={opts} />
        <RequestStatusAlert
          statusSetter={setRequestStatus}
          requestStatus={requestStatus}
          text={requestText}
          textSetter={setRequestText} />
      </Container>
    </ScopedCssBaseline>)
}

export default TrackCRUD
