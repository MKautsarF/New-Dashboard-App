import services from '.';

export const createUser = async (payload: any) => {
  // try {
  const res = await services.post('/instructor/user', payload);

  return res.data;
  // } catch (e) {
  //   const msg =
  //     'Username/Email sudah terdaftar di database, mohon coba inputan yang berbeda';
  //   return new Error(msg);
  // }
};

export const getUsers = async (
  page: number = 1,
  size: number = 5,
  nip_query: string = ''
) => {
  const res = await services.get(
    `/instructor/user?page=${page}&size=${size}&isActive=true${
      nip_query === '' ? '' : `&username:likeLower=${nip_query}`
    }`
  );

  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await services.get(`/instructor/user/${id}`);

  return res.data;
};

export const updateUserById = async (id: string, payload: any) => {
  const res = await services.put(`/instructor/user/${id}`, payload);

  return res.data;
};

//
/// FOR ADMIN

export const createUserAsAdmin = async (payload: any) => {
  const res = await services.post('/admin/user', payload);

  return res.data;
};

// TRAINEE LIST
export const getUsersAsAdmin = async (
  page: number = 1,
  size: number = 5,
  nip_query: string = ''
) => {
  const res = await services.get(
    `/admin/user/by-scope/trainee?page=${page}&size=${size}&isActive=true${
      nip_query === '' ? '' : `&bio.officialCode=${nip_query}`
    }`
  );

  return res.data;
};

// INSTRUCTOR LIST
export const getInstructorList = async (
  page: number = 1,
  size: number = 5,
  nip_query: string = ''
) => {
  const res = await services.get(
    `/admin/user/by-scope/instructor?page=${page}&size=${size}&isActive=true${
      nip_query === '' ? '' : `&bio.officialCode=${nip_query}`
    }`
  );

  return res.data;
};

export const getUserByIdAsAdmin = async (id: string) => {
  const res = await services.get(`/admin/user/${id}`);

  return res.data;
};

export const updateUserByIdAsAdmin = async (id: string, payload: any) => {
  const res = await services.put(`/admin/user/${id}`, payload);

  return res.data;
};

export const deactivateUserById = async (id: string) => {
  const res = await services.put(`/admin/user/${id}/change-status`, {
    isActive: false,
  });

  return res.data;
};

export const activateUserById = async (id: string) => {
  const res = await services.put(`/admin/user/${id}/change-status`, {
    isActive: true,
  });

  return res.data;
};

export const updateUserPasswordById = async (id: string, password: string) => {
  const payload = { newPassword: password };

  const res = await services.put(`/admin/user/${id}/change-password`, payload);

  return res.data;
};
