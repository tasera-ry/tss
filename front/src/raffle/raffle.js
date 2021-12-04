import React, { useState, useEffect } from "react";
import classNames from "classnames";
import api from "../api/api";
import { StylesProvider } from "@material-ui/core/styles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import translations from "../texts/texts.json";
import { UsersTable } from "./usersTable";
import RaffleDatePicker from "./RaffleDatePicker";
import "../App.css";
import css from "./raffle.module.scss";
const classes = classNames.bind(css);

const lang = localStorage.getItem("language");
const { nav } = translations;
const { raffle } = translations;

export const Raffle = () => {
  const [supervisorsOpen, setSupervisorsOpen] = useState(true);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getMembers();
        setSupervisors(res);
      } catch (err) {
        setToast({
          open: true,
          msg: raffle.loadError[lang],
          severity: "error",
        });
      }
    })();
  }, []);

  const handleSubmitUser = async (user_id, data) => {
    if (data.members < 0 || data.supervisors < 0) {
      setToast({ open: true, msg: raffle.valueError[lang], severity: "error" });
      return;
    }
    setIsLoading(true);
    try {
      await api.patchMembers(user_id, data);

      const updatedSupervisors = supervisors.map((user) => {
        if (user.user_id !== user_id) return user;
        return { ...user, ...data };
      });
      setToast({
        open: true,
        msg: raffle.updateSuccess[lang],
        severity: "success",
      });
      setSupervisors(updatedSupervisors);
    } catch (err) {
      setToast({
        open: true,
        msg: raffle.updateError[lang],
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setToast({ ...toast, open: false });
  };

  return (
    <StylesProvider injectFirst>
      <div className={classes(css.members)}>
        <h1>{nav.Raffle[lang]}</h1>
        <div className={classes(css.tableHeader)}>
          {raffle.tableTitle[lang]}
          <IconButton onClick={() => setSupervisorsOpen(!supervisorsOpen)}>
            {supervisorsOpen ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </IconButton>
        </div>
        {supervisorsOpen ? (
          <UsersTable
            supervisors={supervisors}
            onSubmitUser={handleSubmitUser}
            isLoading={isLoading}
          />
        ) : (
          <div className={classes(css.divider)} />
        )}
        <RaffleDatePicker
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
        />
        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={toast.severity}
          >
            {toast.msg}!
          </MuiAlert>
        </Snackbar>
      </div>
    </StylesProvider>
  );
};
