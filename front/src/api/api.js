import axios from 'axios';
import moment from 'moment';

const dateToString = (date) => moment(date).format('YYYY-MM-DD');

const getSchedulingDate = async (date) => {
  const response = await axios.get(`/api/datesupreme/${dateToString(date)}`);
  return response.data;
};

const getSchedulingWeek = async (date) => {
  const response = await axios.get(`/api/daterange/week/${dateToString(date)}`);
  return response.data;
};

const getSchedulingFreeform = async (begin, end) => {
  const response = await axios.get(
    `/api/daterange/freeform/${dateToString(begin)}/${dateToString(end)}`,
  );
  return response.data;
};

const validateLogin = () => axios.get('/api/validate');

const patchReservation = (reservationId, data) =>
  axios.put(`/api/reservation/${reservationId}`, data);

const addRangeSupervision = (
  scheduledRangeSupervisionId,
  rangeSupervisor,
  supervisor,
) =>
  axios.post('/api/range-supervision', {
    scheduled_range_supervision_id: scheduledRangeSupervisionId,
    range_supervisor: rangeSupervisor,
    supervisor,
  });

const patchRangeSupervision = (id, rangeSupervisor) =>
  axios.put(`api/range-supervision/${id}`, {
    range_supervisor: rangeSupervisor,
  });

export default {
  getSchedulingDate,
  getSchedulingWeek,
  getSchedulingFreeform,
  validateLogin,
  patchReservation,
  addRangeSupervision,
  patchRangeSupervision,
};
