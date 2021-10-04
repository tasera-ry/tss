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

const sendResetPasswordToken = async (email) => {
  const response = await axios.post('api/reset', { email });
  return response.data;
};

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

const getUsers = async () => {
  const response = await axios.get('api/user');
  return response.data;
};

const getRangeSupervisors = async () => {
  const response = await axios.get('/api/user?role=supervisor');
  return response.data;
};

const getUser = async (name) => {
  const response = await axios.get(`api/user?name=${name}`);
  return response.data;
};

const addUser = (name, password, role, email) =>
  axios.post('/api/user/', {
    name,
    password,
    role,
    email,
  });

const deleteUser = (id) => axios.delete(`/api/user/${id}`);

const patchEmail = (id, email) => axios.put(`/api/user/${id}`, { email });

const getEmailSettings = async () => {
  const response = await axios.get('/api/email-settings');
  return response.data;
};

const patchEmailSettings = async (settings) => {
  const response = await axios.put('api/email-settings', settings);
  return response.data;
};

const getTracks = async () => {
  const response = await axios.get('/api/track');
  return response.data;
};

const addTrack = async (data) => {
  const response = await axios.post('/api/track', data);
  return response.data;
};

const patchTrack = (trackId, data) => axios.put(`/api/track/${trackId}`, data);

const deleteTrack = (trackId) => axios.delete(`/api/track/${trackId}`);

const getAvailableReservation = (reservationId) =>
  axios.get(`api/reservation?available=true&id=${reservationId}`);

const patchReservation = (reservationId, data) =>
  axios.put(`/api/reservation/${reservationId}`, data);

const getSupervisorReservations = async (userId) => {
  const response = await axios.get(
    `api/range-supervision/usersupervisions/${userId}`,
  );
  return response.data;
};

const getRangeSupervision = async (id) => {
  const response = await axios.get(`api/range-supervision/${id}`);
  return response.data;
};

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

const sendFeedback = (feedback) =>
  axios.put('api/range-supervision/feedback', feedback);

const postScheduledSupervision = async (data) => {
  const response = await axios.post('/api/track-supervision', data);
  return response.data;
};

const patchScheduledSupervision = async (srsp, data) =>
  axios.put(`/api/track-supervision${srsp}`, data);

const patchScheduledSupervisionTrack = (scheduleId, trackId, data) =>
  axios.put(`/api/track-supervision/${scheduleId}/${trackId}`, data);

const getSupervisorSchedules = async (userId) => {
  const response = await axios.get(`api/schedule?supervisor_id=${userId}`);
  return response.data;
};

const patchSchedule = (scheduleId, open, close) =>
  axios.put(`/api/schedule/${scheduleId}`, {
    open,
    close,
  });

const sendPending = () => axios.get('/api/send-pending');

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
  getUsers,
  getRangeSupervisors,
  getUser,
  addUser,
  deleteUser,
  patchEmail,
  getEmailSettings,
  patchEmailSettings,
  getTracks,
  addTrack,
  patchTrack,
  deleteTrack,
  getAvailableReservation,
  patchReservation,
  getSupervisorReservations,
  getRangeSupervision,
  addRangeSupervision,
  patchRangeSupervision,
  sendFeedback,
  postScheduledSupervision,
  patchScheduledSupervision,
  patchScheduledSupervisionTrack,
  getSupervisorSchedules,
  patchSchedule,
  sendPending,
};
