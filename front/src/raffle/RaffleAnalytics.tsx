import React, { useEffect, useState } from "react";
import axios from "axios";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';
import 'moment/locale/fi';
import Button from '@mui/material/Button';
import styles from "./table.module.scss";

interface AnalyticsData {
  id: number;
  name: string;
  card_count: number;
  shifts: number;
  shifts_per_card: number;
  diff_from_avg: number;
}

export default function RaffleAnalytics() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [tempStartDate, setTempStartDate] = useState<Moment>(moment().startOf('year'));
  const [tempEndDate, setTempEndDate] = useState<Moment>(moment());
  const [confirmedDates, setConfirmedDates] = useState<{
    start: Moment;
    end: Moment;
  }>({
    start: moment().startOf('year'),
    end: moment(),
  });

  const fetchData = async (start: Moment, end: Moment) => {
    const startStr = start.format('YYYY-MM-DD');
    const endStr = end.format('YYYY-MM-DD');
    
    try {
      const response = await axios.get(`/api/raffle-analytics?startDate=${startStr}&endDate=${endStr}`);
      const rows = response.data.map((row: any) => ({
        ...row,
        shifts_per_card: row.card_count ? row.shifts / row.card_count : 0,
      }));

      const average = rows.reduce((sum: number, r: any) => sum + r.shifts_per_card, 0) / rows.length;
      const finalData = rows.map((row: any) => ({
        ...row,
        diff_from_avg: row.shifts_per_card - average,
      }));

      setData(finalData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleConfirmDates = () => {
    setConfirmedDates({
      start: tempStartDate,
      end: tempEndDate,
    });
    fetchData(tempStartDate, tempEndDate);
  };

  useEffect(() => {
    fetchData(confirmedDates.start, confirmedDates.end);
  }, []); // Hakee alustusdatan komponentin latautuessa

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "3rem", marginBottom: "2rem" }}>
        Valvojavuorojen jakauma
      </h2>

      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <p style={{ fontSize: "1rem", color: "#444" }}>
          Valitse katseltava aikaväli (oletuksena kuluvan vuoden alku - tänään)
        </p>
      </div>

      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fi">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <DatePicker
            label="Alkupäivä"
            value={tempStartDate}
            onChange={(newValue) => newValue && setTempStartDate(newValue)}
            format="DD.MM.YYYY"
            maxDate={tempEndDate}
          />
          <DatePicker
            label="Loppupäivä"
            value={tempEndDate}
            onChange={(newValue) => newValue && setTempEndDate(newValue)}
            format="DD.MM.YYYY"
            minDate={tempStartDate}
          />
        </div>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmDates}
          >
            Vahvista päivämäärät
          </Button>
        </div>
      </LocalizationProvider>

      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ padding: "0.5rem" }}>Yhdistys</th>
            <th style={{ padding: "0.5rem" }}>Kortilliset</th>
            <th style={{ padding: "0.5rem" }}>Jaetut vuorot</th>
            <th style={{ padding: "0.5rem" }}>Vuoroja per kortti</th>
            <th style={{ padding: "0.5rem" }}>Erotus keskiarvosta</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td style={{ padding: "0.5rem" }}>{row.name}</td>
              <td style={{ padding: "0.5rem" }}>{row.card_count}</td>
              <td style={{ padding: "0.5rem" }}>{row.shifts}</td>
              <td style={{ padding: "0.5rem" }}>{row.shifts_per_card.toFixed(2)}</td>
              <td style={{ padding: "0.5rem" }}>
                {row.diff_from_avg >= 0 ? "+" : ""}
                {row.diff_from_avg.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}