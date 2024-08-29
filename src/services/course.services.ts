import internal from "stream";
import services from ".";

// INSTRUCTOR

export const getCourseByInstructor = async (page: number, size: number, title: string = '', description: string = '') => {  
  const res = await services.get(`/instructor/course?page=${page}&size=${size}${
    title === '' ? '' : `&title:likeLower=${title}`}${ description === '' ? '' : `&description:likeLower=${description}`}`);

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

let pageExclusions: { [page: number]: Set<number> } = {};
pageExclusions[0] = new Set();

export const getCourseListbyAdmin = async (
  page: number,
  size: number,
  title: string = '',
  description: string = ''
) => {
  try {
    console.log("pertama", page)
    let filteredData: any[] = [];
    let total=0;
    let fetchpage = page;
    // Fetch data from the server
    while (filteredData.length < size) {
    const res = await services.get(
      `/admin/course?page=${fetchpage}&size=${size}${
        title ? `&title:likeLower=${title}` : ''
      }${description ? `&description:likeLower=${description}` : ''}`
    );
    total = res.data.total;

    // Initialize exclusions for the current page if not already done
    if (!pageExclusions[page]) {
      pageExclusions[page] = new Set();
    }

    // Filter out unwanted items and items that have already been excluded for this page
    const newData = res.data.results.filter(
      (item: any) =>
        item.description !== "Default" &&
        !pageExclusions[page-1].has(item.id)
    );

    // Add new filtered items to the list
    filteredData = filteredData.concat(newData);
    if (newData.length === 0) {break;}

      // Increase the page count for the next iteration
    fetchpage += 1;
  }

    // If there are more items than needed, slice the array to the requested size
    const results = filteredData.slice(0, size);

    // Track excluded IDs for this page
    results.forEach((item) => pageExclusions[page].add(item.id));
    console.log("pageExclusions", page);
    console.log(pageExclusions);

    // Return the correctly filtered data
    return {results, total};
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
