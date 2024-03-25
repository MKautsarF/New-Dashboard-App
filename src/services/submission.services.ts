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

export const finishSubmissionById = async (id: number) => {
  const res = await services.put(`/instructor/submission/${id}/finish`);

  return res.data;
};

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
