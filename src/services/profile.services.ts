import services from '.';

export const getProfile = async (token: string) => {
  const res = await services.get('/my-profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  services.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return res.data;
};

export const updatePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const payload = {
    newPassword,
    oldPassword,
  };

  const res = await services.put('/my-profile/change-password', payload);

  return res.data;
};

export const updateProfile = async (
  newName: string,
  newUsername: string,
  newEmail: string
) => {
  const payload = {
    name: newName,
    email: newEmail,
    username: newUsername,
  };

  const res = await services.put('/my-profile', payload);

  return res.data;
};
