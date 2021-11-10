import axios from "axios";

const getMembers = async () => {
  const response = await axios.get(`/api/members`);
  return response.data;
};

const patchMembers = async (user_id, data) =>
  axios.put(`/api/members/${user_id}`, data);

export default {
  getMembers,
  patchMembers,
};
