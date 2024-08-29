import internal from "stream";
import services from ".";

// INSTRUCTOR

export const getScoringByInstructor = async (description: string = '') => {
  const res = await services.get(`/instructor/course-exam?${description === '' ? '' : `description:likeLower=${description}`}`);
  console.log(res.data);

  return res.data;
};

export const getScoringByCourseInstructor = async (id: string, page: number, size: number) => {
  const res = await services.get(`/instructor/course-exam?courseId=${id}`);

  return res.data;
}

export const getPayloadFromCourse = async (id: string) => {
  const res = await services.get(`/instructor/course/${id}/download`);

  return res.data;
};

// ADMIN

export const getScoringByCourse = async (id: string, page: number = 1, size: number = 5,) => {
  const res = await services.get(`/admin/course-exam?courseId=${id}&page=${page}&size=${size}`);

  return res.data;
}

export const getScoringListbyAdmin = async (page: number, size: number) => {
  try {
    const res = await services.get(`/admin/course-exam?page=${page}&size=${size}`);

    return res.data;
  } catch (error) {
    console.error(`Error fetching course list:`, error);
    throw error;
  }
};

export const createScoringAsAdmin = async (formData: FormData) => {
  try {
    const response = await services.post('/admin/course-exam', formData, {
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

export const editScoringAsAdmin = async (id: string, formData: FormData) => {
  try {
    const response = await services.put(`/admin/course-exam/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating course", error);
    throw error;
  }
}

export const publishCourseAsAdmin = async (id: string) => {
  try {
    const res = await services.put(`/admin/course/${id}/publish`);
    return res.data;
  } catch (error) {
    console.error("Error publishing the course:", error);
    throw error;
  }
};

export const deleteScoringAsAdmin = async (id: string) => {
  const res = await services.delete(`/admin/course-exam/${id}`, {
  });

  return res.data;
};


// PUBLIC

export const getScoringDetail = async (id: string) => {
  try {
    const res = await services.get(`/public/course-exam/${id}/download`);

    return res.data;
  } catch (error) {
    console.error(`Error fetching course list:`, error);
    throw error;
  }
};
