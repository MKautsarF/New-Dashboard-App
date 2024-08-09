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

export const getScoringListbyAdmin = async (page: number, size: number) => {
  try {
    const res = await services.get(`/admin/course-exam?page=${page}&size=${size}`);

    return res.data;
  } catch (error) {
    console.error(`Error fetching course list:`, error);
    throw error;
  }
};

export const createCourseAsAdmin = async (formData: FormData) => {
  try {
    const response = await services.post('/admin/course', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating course", error);
    throw error;
  }
};

export const publishCourseAsAdmin = async (id: string) => {
  try {
    const res = await services.put(`/admin/course/${id}/publish`);
    return res.data;
  } catch (error) {
    console.error("Error publishing the course:", error);
    throw error;
  }
};

export const deleteCourseAsAdmin = async (id: string) => {
  const res = await services.delete(`/admin/course/${id}`, {
  });

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
