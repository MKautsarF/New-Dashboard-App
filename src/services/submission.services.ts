import services from ".";

export const createSubmission = async (payload: any) => {
  const res = await services.post("/instructor/submission", payload);

  return res.data;
};

export const getSubmissionList = async (
  page: number = 1,
  size: number = 5,
  user_query: string = ""
) => {
  const res = await services.get(
    `/instructor/submission?page=${page}&size=${size}${
      user_query === "" ? "" : `&owner:eq=${user_query}`
    }`
  );

  return res.data;
};

export const getSubmissionById = async (id: number) => {
  const res = await services.get(`/instructor/submission/${id}`);

  return res.data;
};

export const deleteSubmissionById = async (id: number) => {
  const res = await services.delete(`/instructor/submission/${id}`);

  return res.data;
};

export const finishSubmissionById = async (id: number, payload: any) => {
  console.log("payload", payload);
  console.log("id", id);
  const res = await services.put(`/instructor/submission/${id}/finish`, payload);
  console.log("res", res);

  return res;
};
export const uploadLogSubmission = async (id: number, formData: FormData) => {
  const response = await services.post(`/instructor/submission/${id}/log`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export const uploadSubmission = async (
  url: string,
  file: File,
  fileKey: string,
  data: object = {}
) => {
  const formData = new FormData();
  console.log("formData created");

  formData.append(fileKey, file);
  console.log("append file to formData");

  for (const key in data) {
    formData.append(key, data[key as keyof typeof data]);
  }
  console.log("end of loop");

  return await services.post(url, formData);
};

// export const uploadSubmissionById = async (id: number, payload: any) => {
//   const res = await services.post(`/instructor/submission/${id}/log`, payload);

//   return res.data;
// };

export const getSubmissionLogById = async (
  id: number,
  page: number = 1,
  size: number = 5,
  tag_query: string = ""
) => {
  const res = await services.get(
    `/instructor/submission/${id}/log?page=${page}&size=${size}${
      tag_query === "" ? "" : `&username:likeLower=${tag_query}`
    }`
  );

  return res.data;
};

export const getSubmissionLogByFileIndex = async (
  id: number,
  fileIndex: number
) => await services.get(`/instructor/submission/${id}/log/${fileIndex}`);

export const getSubmissionLogByTag = async (
  id: number,
  tag: string,
  page: number = 1,
  size: number = 1
) => {
  const res = await services.get(
    `/instructor/submission/${id}/log?tag=${tag}&page=${page}&size=${size}`
  );

  return res.data;
};


