import axios from "axios";

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

export default {
  getMembers,
  patchMembers,
  raffleSupervisors,
  saveRaffledSupervisors,
};
