import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_INTERNAL_API_URL

let isRefreshing = false;
let queue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (error: unknown) => {
  queue.forEach(({resolve, reject}) =>
    error ? reject(error) : resolve(),
  );
  queue = [];
};

const createInstance = () => {
  const instance = axios.create({
    withCredentials: true,
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (typeof window !== "undefined") {
    instance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;

        if (error.response?.status !== 401 || original._retry) {
          return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push({
              resolve: () => {
                // original.headers.Authorization = `Bearer ${token}`;
                resolve(instance(original));
              },
              reject,
            });
          });
        }

        isRefreshing = true;

        try {
          const {data} = await axios.post<{ accessToken: string }>(
            "/api/auth/refresh",
            null,
            {withCredentials: true},
          );

          // instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          // original.headers.Authorization = `Bearer ${newToken}`;

          flushQueue(null);
          return instance(original);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          flushQueue(refreshError);
          window.location.href = "/auth/(.)auth";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );
  }

  return instance;
};

export default createInstance;
