import services from ".";

export const createSubmission = async (payload: any) => {
  const res = await services.post("/instructor/submission", payload);

  return res.data;
};

export const getSubmissionList = async (
  user_query: string = "",
  date_sort_query: string = "",
  train_filter_query: string = ""
) => {
  const res = await services.get(
    `/instructor/submission?owner:eq=${user_query}${
      date_sort_query === ""
        ? ""
        : `&orderBy=createdAt&order=${date_sort_query}`
    }${train_filter_query === "" ? "" : `&objectType:eq=${train_filter_query}`}`
  );

  return res.data;
};

export const getSubmissionListAdmin = async (
  user_query: string = "",
  date_sort_query: string = "",
  train_filter_query: string = ""
) => {
  const res = await services.get(
    `/admin/submission?owner:eq=${user_query}${
      date_sort_query === ""
        ? ""
        : `&orderBy=createdAt&order=${date_sort_query}`
    }${train_filter_query === "" ? "" : `&objectType:eq=${train_filter_query}`}`
  );

  return res.data;
};

export const getAllSubmissionByInstructor = async (
  page: number,
  size: number,
  nip_query: string = "",
  date_sort_query: string = "",
  train_filter_query: string = "",
  pageExclusions: { [page: number]: Set<number> } = {}
) => {
  try {
    let pageExclusion = pageExclusions;
    let filteredData: any[] = [];
    let total = 0;
    let fetchpage = page;
    // Fetch data from the server
    while (filteredData.length < size) {
      const res = await services.get(
        `/instructor/submission?page=${page}&size=${size}${
          nip_query == "" ? "" : `&owner:eq=${nip_query}`
        }${
          date_sort_query === ""
            ? ""
            : `&orderBy=createdAt&order=${date_sort_query}`
        }${
          train_filter_query === ""
            ? ""
            : `&objectType:eq=${train_filter_query}`
        }`
      );
      total = res.data.total;

      // Initialize exclusions for the current page if not already done
      pageExclusion[page] = new Set();
      const data = res.data.results.filter(
        (item: any) =>
          item.status == "active" && !pageExclusion[page - 1].has(item.id)
      );

      // Filter out unwanted items and items that have already been excluded for this page
      const newData = res.data.results.filter(
        (item: any) =>
          item.status !== "active" && !pageExclusion[page - 1].has(item.id)
      );

      // Add new filtered items to the list
      filteredData = filteredData.concat(newData);
      if (newData.length === 0) {
        break;
      }
      if (filteredData.length == res.data.total) {
        break;
      }

      // Increase the page count for the next iteration
      fetchpage += 1;
    }

    // If there are more items than needed, slice the array to the requested size
    const results = filteredData.slice(0, size);

    // Track excluded IDs for this page
    results.forEach((item) => pageExclusion[page].add(item.id));

    // Return the correctly filtered data
    return { results, total, pageExclusion };
  } catch (error) {
    console.error(`Error fetching submission list:`, error);
    throw error;
  }
};

export const getActiveSubmissionCount = async () => {
  try {
    const res = await services.get("instructor/submission?status=active");
    return res.data.total;
  } catch (error) {
    console.error("Error fetching count:", error);
  }
};

export const getSubmissionById = async (id: number) => {
  const res = await services.get(`/instructor/submission/${id}`);

  return res.data;
};

export const getSubmissionByIdAdmin = async (id: number) => {
  const res = await services.get(`/admin/submission/${id}`);

  return res.data;
};

export const deleteSubmissionById = async (id: number) => {
  const res = await services.delete(`/instructor/submission/${id}`);

  return res.data;
};

export const finishSubmissionById = async (id: number, payload: any) => {
  try {
    const res = await services.put(
      `/instructor/submission/${id}/finish`,
      payload
    );
    return res;
  } catch (error) {
    console.error(
      "Upload failed:",
      error.response ? error.response.data : error.message
    );
  }
};

export const cancelSubmissionById = async (id: number, payload: any) => {
  try {
    const res = await services.put(
      `/instructor/submission/${id}/cancel`,
      payload
    );
    return res;
  } catch (error) {
    console.error(
      "Upload failed:",
      error.response ? error.response.data : error.message
    );
  }
};

export const uploadLogSubmission = async (id: number, formData: FormData) => {
  try {
    const response = await services.post(
      `/instructor/submission/${id}/log`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Upload failed:",
      error.response ? error.response.data : error.message
    );
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
  }
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
) => {
  const res = await services.get(
    `/instructor/submission/${id}/log/${fileIndex}`,
    { responseType: "blob" }
  );
  return res.data;
};

export const getSubmissionLogByFileIndexAdmin = async (
  id: number,
  fileIndex: number
) => {
  const res = await services.get(
    `/admin/submission/${id}/log/${fileIndex}`,
    { responseType: "blob" }
  );
  return res.data;
};

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

export const getSubmissionLogByTagAdmin = async (
  id: number,
  tag: string,
  page: number = 1,
  size: number = 1
) => {
  const res = await services.get(
    `/admin/submission/${id}/log?tag=${tag}&page=${page}&size=${size}`
  );

  return res.data;
};
