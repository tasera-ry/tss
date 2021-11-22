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

const signIn = async (name, password, secure) => {
  const response = await axios.post('api/sign', { name, password, secure });
  return response.data;
};

const signOut = () => axios.post('/api/signout');

const validateLogin = () => axios.get('/api/validate');

const patchPassword = (id, password) =>
  axios.put(`/api/changeownpassword/${id}`, {
    password,
  });

const sendResetPasswordToken = async (email) =>
  axios.post('api/reset', { email });

const resetPassword = async (token) => {
  const response = await axios.get('api/reset', {
    params: { reset_token: token },
  });
  return response.data;
};

const renewPassword = (username, newPassword, resetToken, resetTokenExpire) =>
  axios.put('api/reset', {
    username,
    newPassword,
    reset_token: resetToken,
    reset_token_expire: resetTokenExpire,
  });

const getUser = async (name) => {
  const response = await axios.get(`api/user?name=${name}`);
  return response.data;
};

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

const sendFeedback = (feedback, user) =>
  axios.put('api/range-supervision/feedback', { feedback, user });

const patchScheduledSupervisionTrack = (scheduleId, trackId, data) =>
  axios.put(`/api/track-supervision/${scheduleId}/${trackId}`, data);

export default {
  getSchedulingDate,
  getSchedulingWeek,
  getSchedulingFreeform,
  signIn,
  signOut,
  validateLogin,
  patchPassword,
  sendResetPasswordToken,
  resetPassword,
  renewPassword,
  getUser,
  patchReservation,
  addRangeSupervision,
  patchRangeSupervision,
  sendFeedback,
  patchScheduledSupervisionTrack,
};
