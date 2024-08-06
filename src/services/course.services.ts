import internal from "stream";
import services from ".";

// INSTRUCTOR

export const getCourseByInstructor = async () => {
  const res = await services.get(`/instructor/course`);

  return res.data;
};

export const getPayloadFromCourse = async (id: string) => {
  const res = await services.get(`/instructor/course/${id}/download`);

  return res.data;
};

// ADMIN

export const getCourseListbyAdmin = async (page: number, size: number) => {
  try {
    const res = await services.get(`/admin/course?page=${page}&size=${size}`);

    return res.data;
  } catch (error) {
    console.error(`Error fetching course list:`, error);
    throw error;
  }
};

export const createCourseAsAdmin = async (payload: any) => {
  console.log("payload", payload)
  const res = await services.post('/admin/course', payload);

  return res.data;
};

// PUBLIC

export const downloadCourse = async (id: number) => {
  try {
    console.log(id);
    const res = await services.get(`/public/course/${id}/download`);

    return res.data;
  } catch (error) {
    console.error(`Error fetching course list:`, error);
    throw error;
  }
};
