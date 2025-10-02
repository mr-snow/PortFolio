import {
  userLoginApi,
  userGetApi,
  usersGetApi,
  deleteUserApi,
  updateUserApi,
} from '../Slice/userSlice';

export const userLoginHook = async (data, login) => {
  const response = await userLoginApi(data, login);
  return response;
};

export const getUserHook = async id => {
  const response = await userGetApi(id);

  return response;
};

export const getUsersHook = async () => {
  const response = await usersGetApi();
  return response;
};

export const deleteUserHook = async id => {
  const response = await deleteUserApi(id);
  return response;
};

export const updateUserHook = async (postData, userId) => {
  const response = await updateUserApi(postData, userId);
  return response;
};
