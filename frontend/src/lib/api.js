import axios from "axios";
import store from "@/redux/store";
import { setUser } from "@/redux/authSlice";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    withCredentials: true,
    timeout: 15000,
    headers: { Accept: "application/json" },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        if (status === 401 && code !== "INVALID_CREDENTIALS") {
            store.dispatch(setUser(null));
        }
        return Promise.reject(error);
    },
);

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => (
    error?.response?.data?.message || (error?.code === "ECONNABORTED" ? "The request timed out. Please try again." : fallback)
);

export default api;
