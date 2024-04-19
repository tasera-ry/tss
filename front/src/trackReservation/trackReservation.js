import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import classNames from "classnames";

import { Container, CssBaseline, Typography } from "@material-ui/core";

import colors from '../colors.module.scss';

import translations from '../texts/texts.json';
import css from './trackReservation.module.scss';
import { validateLogin } from "../utils/Utils";
import TrackReservationForm from "./trackReservationForm";

const classes = classNames.bind(css);

const TrackReservation = () => {
    const lang = localStorage.getItem('language');
    const [cookies] = useCookies(["username", "id", "role"])

    const [showForm, setShowForm] = useState(true);
    const [emailSent, setEmailSent] = useState(false);

    document.body.style = `background: ${colors.blackTint10};`;

    useEffect(() => {
        const myFunc = async() => {
            const logInSuccess = await validateLogin();
            if(!logInSuccess || 
                (cookies.role != "association" && 
                cookies.role != "superuser")) window.location.href = '/';
        };
        myFunc();
    }, []);

    const sendReservation = async(date, startTime, endTime, trackId, spotCount, reasonText, letOhersIn) => {
        try{
            // make api call with proper info
            setShowForm(false);
            setEmailSent(true);
        }
        catch(err){
            console.log("Failed to send reservation: ", err);
            setShowForm(true);
            setEmailSent(false);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <div className={classes(css.paper)}>
                {showForm && (
                    <TrackReservationForm 
                        onSubmit={sendReservation} 
                        lang={lang}
                    />
                )}

                {emailSent && (
                    <Typography 
                        component="h3"
                        variant="h5"
                        align="center"
                        className={classes(css.success)}
                    >
                        {translations.trackReservations.sendSuccess[lang]}
                    </Typography>
                )}
            </div>
        </Container>
    );
}

export default TrackReservation;
