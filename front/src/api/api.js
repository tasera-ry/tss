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

const getUser = async (id) => {
  const response = await axios.get(`api/user/${id}`);
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

const patchRangeSupervision = (id, rangeSupervisor) => {
  return axios.put(`api/range-supervision/${id}`, {
    range_supervisor: rangeSupervisor.range_supervisor,
  });
}


const sendFeedback = (feedback, user) =>
  axios.put('api/range-supervision/feedback', { feedback, user });

const patchScheduledSupervisionTrack = (scheduleId, trackId, data) =>
  axios.put(`/api/track-supervision/${scheduleId}/${trackId}`, data);

  
const getMembers = async () => {
  const response = await axios.get(`/api/members`);
  return response.data;
};

const patchMembers = async (user_id, data) =>
  axios.put(`/api/members/${user_id}`, data);

const raffleSupervisors = async (dates) => {
  const response = await axios.post("api/raffle", { dates });
  return response.data;
};

const saveRaffledSupervisors = async (results) =>
  axios.post("api/set-raffled-supervisors", { results });

const getInfoMessage = async () => {
  const response = await axios.get('api/infomessage');
  return response.data;
};

const postInfoMessage = async (infoRequest) => {
  await axios.post('api/infomessage', { message: infoRequest.message, start: infoRequest.start, end: infoRequest.end, show_weekly: infoRequest.show_weekly, show_monthly: infoRequest.show_monthly });
};

const deleteInfoMessage = async (info) => {
  await axios.delete(`api/infomessage/${info.id}`);
};

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
  getMembers,
  patchMembers,
  raffleSupervisors,
  saveRaffledSupervisors,
  getInfoMessage,
  postInfoMessage,
  deleteInfoMessage,
};
