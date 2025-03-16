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

const createUser = async (newUser) => {
  const response = await axios.post('/api/user', newUser);
  return response.data;
};

const getUser = async (id) => {
  const response = await axios.get(`api/user/${id}`);
  return response.data;
};

const getUsers = async () => {
  const response = await axios.get(`api/user`);
  return response.data;
};

const deleteUser = async (id) => {
  const response = await axios.delete(`api/user/${id}`);
  return response.data;
};

const getRangeOfficers = async (associationId) => {
  const response = await axios.get(`api/rangeofficers/${associationId}`);
  return response.data;
};

const getAssociation = async (id) => {
  const response = await axios.get(`api/officer-association/${id}`);
  return response.data;
};

const patchReservation = (reservationId, data) =>
  axios.put(`/api/reservation/${reservationId}`, data);

const addRangeSupervision = (
  scheduledRangeSupervisionId,
  rangeSupervisor,
  association,
) => {
  axios.post('/api/range-supervision', {
    scheduled_range_supervision_id:
      scheduledRangeSupervisionId.scheduled_range_supervision_id,
    range_supervisor: rangeSupervisor,
    association,
  });
};

const patchRangeSupervision = (id, rangeSupervisor) => {
  if (rangeSupervisor.association) {
    return axios.put(`api/range-supervision/${id}`, {
      range_supervisor: rangeSupervisor.range_supervisor,
      association: rangeSupervisor.association,
      arriving_at: rangeSupervisor.arriving_at,
    });
  }

  return axios.put(`api/range-supervision/${id}`, {
    range_supervisor: rangeSupervisor.range_supervisor,
    arriving_at: rangeSupervisor.arriving_at,
  });
};

const sendFeedback = (feedback, user) =>
  axios.put('api/range-supervision/feedback', { feedback, user });

const postScheduledSupervisionTrack = (data) =>
  axios.post(`/api/track-supervision`, data);

const patchScheduledSupervisionTrack = (scheduleId, trackId, data) =>
  axios.put(`/api/track-supervision/${scheduleId}/${trackId}`, data);

const getMembers = async () => {
  const response = await axios.get(`/api/members`);
  return response.data;
};

const patchMembers = async (user_id, data) =>
  axios.put(`/api/members/${user_id}`, data);

const raffleSupervisors = async (dates) => {
  const response = await axios.post('api/raffle', { dates });
  return response.data;
};

const saveRaffledSupervisors = async (results) =>
  axios.post('api/set-raffled-supervisors', { results });

const getPublicInfoMessages = async () => {
  const response = await axios.get(`api/infomessage`);
  return response.data;
};

const getRangeMasterInfoMessages = async () => {
  try {
    const response = await axios.get('api/infomessage/tablet');
    return response.data;
  } catch (err) {
    console.error(
      'Error in getting range master info message. User is not logged in.',
    );
    return;
  }
};

const getAllInfoMessages = async () => {
  const response = await axios.get('api/infomessage/all');
  return response.data;
};

const postInfoMessage = async (infoRequest) => {
  await axios.post(`api/infomessage`, infoRequest);
};

const deleteInfoMessage = async (id) => {
  await axios.delete(`api/infomessage/${id}`);
};

/**
 * Device api functions
 */

const getAllDevices = async () => {
  const response = await axios.get('api/devices');
  return response.data;
};

const patchDevice = async (id, updatedDevice) => {
  await axios.put(`api/devices/${id}`, updatedDevice);
};

const createDevice = async (newDevice) => {
  const response = await axios.post('api/devices', newDevice);
  return response.data;
};

const deleteDevice = async (id) => {
  await axios.delete(`api/devices/${id}`);
};

async function getSupervisions(associationId) {
  try {
    const response = await axios.get(
      `api/range-supervision/association/${associationId}`,
    );

    return response.data.map((supervision) => ({
      id: supervision.scheduled_range_supervision_id,
      scheduled_range_supervision_id:
        supervision.scheduled_range_supervision_id,
      date: moment(supervision.date).format('YYYY-MM-DD'),
      range_supervisor: supervision.range_supervisor,
      rangeofficer_id: supervision.rangeofficer_id,
      arriving_at: supervision.arriving_at,
    }));
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function putSupervision(id, data) {
  try {
    const response = await axios.put(`api/range-supervision/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

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
  createUser,
  getUser,
  getUsers,
  deleteUser,
  getRangeOfficers,
  getAssociation,
  patchReservation,
  addRangeSupervision,
  patchRangeSupervision,
  sendFeedback,
  postScheduledSupervisionTrack,
  patchScheduledSupervisionTrack,
  getMembers,
  patchMembers,
  raffleSupervisors,
  saveRaffledSupervisors,
  getPublicInfoMessages,
  getRangeMasterInfoMessages,
  getAllInfoMessages,
  postInfoMessage,
  deleteInfoMessage,
  getAllDevices,
  patchDevice,
  createDevice,
  deleteDevice,
  getSupervisions,
  putSupervision,
};
