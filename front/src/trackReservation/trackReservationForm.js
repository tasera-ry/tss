import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import { Button, 
         TextField, 
         Typography, 
         Select, 
         MenuItem, 
         Checkbox,
         FormControlLabel,
         Dialog,
         DialogTitle,
         DialogContent,
         DialogActions,
         Input,
         Grid} from '@material-ui/core';
import { KeyboardDatePicker,
         KeyboardTimePicker, 
         MuiPickersUtilsProvider } from '@material-ui/pickers';

import MomentUtils from '@date-io/moment';

import translations from '../texts/texts.json';
import css from './trackReservation.module.scss';
import api from '../api/api';

const classes = classNames.bind(css);

const TrackReservationForm = ({onSubmit, lang}) => {

    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(moment());
    const [endTime, setEndTime] = useState(moment());
    const [reasonText, setReasonText] = useState("");
    const [trackId, setTrackId] = useState(undefined);
    const [spotCount, setSpotCount] = useState(1);
    const [tracks, setTracks] = useState([]);
    const [letOthersIn, setLetOthersIn] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { trackReservations, manage, sched } = translations;

    useEffect(() => {
        const myFunc = async() => {
            const data = await api.getSchedulingDate(date);
            setTracks(data.tracks);
            setTrackId(data.tracks[0].id);
        }
        myFunc();
    }, [date]);

    return (
        // Confirm Dialog
        dialogOpen ? (
        <Dialog
            open={dialogOpen}
            keepMounted
            onClose={() => setDialogOpen(false)}
        >
            <DialogTitle 
                id="dialog-send-reservation-form" 
                className={classes(css.dialogStyle)}
            >
                {trackReservations.confirmDialog[lang]}
            </DialogTitle>
            <DialogContent className={classes(css.dialogStyle)}>
                {`${trackReservations.date[lang]}: ${date.toDateString()}\n`}
                <br></br>
                {`${trackReservations.time[lang]}: ${moment(startTime).format('LT')} - ${moment(endTime).format('LT')}\n`}
                <br></br>
                {`${trackReservations.track[lang]}: ${tracks.filter((track) => track.id == trackId)[0].name}\n`}
                <br></br>
                {`${trackReservations.attendees[lang]}: ${spotCount}\n`}
                <br></br>
                {`${trackReservations.letOhersIn[lang]}: ${letOthersIn ? trackReservations.messageYes[lang] : trackReservations.messageNo[lang]}\n`}
                <br></br>
                {`${trackReservations.reason[lang]}: ${reasonText}\n`}
            </DialogContent>
            <DialogActions className={classes(css.dialogStyle)}>
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        onSubmit(date, 
                                 startTime, 
                                 endTime, 
                                 trackId, 
                                 spotCount, 
                                 reasonText, 
                                 letOthersIn);
                        setDialogOpen(false);
                    }}
                    className={classes(css.acceptButton)}
                >
                    {manage.Confirm[lang]}
                </Button>
                <Button
                    onClick={() => {
                        setDialogOpen(false);
                    }}
                    className={classes(css.removeButton)}
                >
                    {manage.Cancel[lang]}
                </Button>
            </DialogActions>
        </Dialog>
        ) : (
        // Actual reservation form
        <div>
            <Typography component="h1" variant="h5" align='center'>
                {trackReservations.formTitle[lang]}
            </Typography>
            <form className={classes(css.wideForm)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                         {/* DatePicker */}
                        <MuiPickersUtilsProvider utils={MomentUtils} locale={lang}>
                            <KeyboardDatePicker
                                autoOk
                                margin="normal"
                                name="date"
                                format="DD.MM.YYYY"
                                data-testid="datePicker"
                                value={date}
                                label={sched.Day[lang]}
                                onChange={(newDate) => setDate(new Date(newDate))}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6}>
                        {/* Start TimePicker */}
                        <MuiPickersUtilsProvider utils={MomentUtils} locale={lang}>
                            <KeyboardTimePicker
                                autoOk
                                ampm={false}
                                margin="normal"
                                name="start"
                                label={sched.Start[lang]}
                                value={startTime}
                                onChange={(time) => setStartTime(time)}
                                minutesStep={5}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6}>
                        {/* End TimePicker */}
                        <MuiPickersUtilsProvider utils={MomentUtils} locale={lang}>
                            <KeyboardTimePicker
                                autoOk
                                ampm={false}
                                margin="normal"
                                name="end"
                                label={sched.Stop[lang]}
                                value={endTime}
                                onChange={(time) => setEndTime(time)}
                                minutesStep={5}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6}>
                        {/* TrackSelector */}
                        <Select
                        value={trackId || ''}
                        label={trackReservations.track[lang]}
                        onChange={(e) => setTrackId(e.target.value)}
                        data-testid="trackSelector"
                        >
                            {tracks.map((track) => 
                                <MenuItem key={track.id} value={track.id}>
                                    {track.name}
                                </MenuItem>
                            )}
                        </Select>
                    </Grid>
                    <Grid item xs={6}>
                        {/* Attendee Count */}
                        <Input
                        value={spotCount}
                        size="small"
                        onChange={(e) => setSpotCount(e.target.value)}
                        inputProps={{
                            step: 1,
                            min: 1,
                            max: 60, // change this to accurate later
                            type: 'number'
                        }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {/* Reason TextField */}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="reasonField"
                            label={trackReservations.reason[lang]}
                            name="reason"
                            autoComplete={trackReservations.reasonText[lang]}
                            autoFocus
                            value={reasonText}
                            onInput={(e) => setReasonText(e.target.value)}
                            className={classes(css.text)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        {/* CheckBox */}
                        <FormControlLabel 
                            control={
                            <Checkbox
                                checked={letOthersIn}
                                onClick={() => setLetOthersIn(!letOthersIn)}
                            />}
                            label={trackReservations.letOhersIn[lang]}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        {/* Submit Button */}
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setDialogOpen(true);
                            }}
                            type='submit'
                            variant='contained'
                            className={classes(css.submitButton, css.acceptButton)}
                        >
                            {trackReservations.formSubmit[lang]}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>)
    );
}

export default TrackReservationForm;
