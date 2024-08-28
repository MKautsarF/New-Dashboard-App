import internal from "stream";
import services from ".";

// INSTRUCTOR

export const getCourseByInstructor = async (page: number, size: number, title: string = '') => {  
  const res = await services.get(`/instructor/course?page=${page}&size=${size}${
    title === '' ? '' : `&title:likeLower=${title}`}`);

  return res.data;
};

export const getCourseByID = async (id: string) => {
  const res = await services.get(`/instructor/course/${id}`);

  return res.data;
}

export const getPayloadFromCourse = async (id: string) => {
  const res = await services.get(`/instructor/course/${id}/download`);

  return res.data;
};

export const createCourseAsInstructor = async (formData: FormData) => {
  try {
    const response = await services.post('/instructor/course', formData, {
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


// ADMIN

export const getCourseListbyAdmin = async (page: number, size: number, title: string = '') => {
  try {
    const res = await services.get(`/admin/course?page=${page}&size=${size}${
      title === '' ? '' : `&title:likeLower=${title}`}`);

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

export const editCourseAsAdmin = async (id: string, formData: FormData) => {
  try {
    const response = await services.put(`/admin/course/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing course", error);
    throw error;
  }
}

export const deleteCourseAsAdmin = async (id: string) => {
  const res = await services.delete(`/admin/course/${id}`, {
  });

  return res.data;
};


// PUBLIC

export const getCourseDetail = async (id: string) => {
  try {
    console.log(id);
    const res = await services.get(`/public/course/${id}/download`);

    return res.data;
  } catch (error) {
    console.error(`Error fetching course list:`, error);
    throw error;
  }
};
