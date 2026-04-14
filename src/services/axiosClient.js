import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api/v1`,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth')
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/v1/auth/refresh-token`,
          { refreshToken }
        );

        const newToken = res.data;

        localStorage.setItem("token", newToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        localStorage.clear();
        const errorCode = err.response?.data?.code || err.response?.data?.errorCode;
        const redirectUrl = errorCode ? `/login?error=${errorCode}` : "/login";
        if (window.location.pathname !== '/login') {
          window.location.href = redirectUrl;
        }
      }
    }

    // Handle 409 (Conflict) - typically used for USER_BLOCK (banned)
    if (error.response && error.response.status === 409) {
      const errorCode = error.response.data?.code || error.response.data?.errorCode;
      if (errorCode === 'USER_BLOCK') {
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?error=${errorCode}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;