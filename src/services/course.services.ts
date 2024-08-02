import services from '.';

export const getCourseByInstructor = async () => {
    const res = await services.get(`/instructor/course`);
  
    return res.data;
};

export const getPayloadFromCourse = async (id: string) => {
  const res = await services.get(`/instructor/course/${id}/download`);

  return res.data;
};