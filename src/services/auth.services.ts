import services from ".";

export const loginInstructor = async (username: string, password: string) => {
  const res = await services.post("/auth/authenticate", {
    username,
    password,
  });

  services.defaults.headers.common["Authorization"] = `Bearer ${res.data}`;

  return res.data;
};
