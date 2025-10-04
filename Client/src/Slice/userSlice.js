import axiosInstance from './axiosInstance';

export const userLoginApi = async (data, login) => {
  if (login) {
    const response = await axiosInstance.post(`/api/user/login`, data);
    return response;
  } else {
    const response = await axiosInstance.post(`/api/user/signup`, data);
    return response;
  }
};

export const userGetApi = async id => {
  const response = await axiosInstance.get(`/api/user/${id}`);
  return response;
};

export const usersGetApi = async () => {
  const response = await axiosInstance.get(`/api/user/`);
  return response;
};

export const deleteUserApi = async id => {
  const response = await axiosInstance.delete(`/api/user/${id}`);
  return response;
};
export const updateUserApi = async (postData, userId) => {
  const response = await axiosInstance.patch(`/api/user/${userId}`, postData);
  return response;
};
