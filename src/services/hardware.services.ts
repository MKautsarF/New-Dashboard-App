import services from ".";

export const getHardwareStatusByHighestId = async (fileName: string) => {
  const res = await services.get(`/file/${fileName}`);

  return res.data;
};


export const getHardwareStatus = async () => {
  const res = await services.get(`/course-data`);

  return res.data;
};