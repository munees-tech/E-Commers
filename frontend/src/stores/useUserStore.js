import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    isLoading: false,
    checkingAuth: false,

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ isLoading: true });
        if (password !== confirmPassword) {
            set({ isLoading: false });
            return toast.error("Passwords don't match");
        }
        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            set({ user: res.data });
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    login: async ({ email, password }) => {
        set({ isLoading: true });
        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data });
            toast.success("Login successful");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await axios.post("/auth/logout");
            set({ user: null });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get("/auth/profile");
            set({ user: res.data, checkingAuth: false });
        } catch (error) {
            set({ checkingAuth: false, user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return;
        set({ checkingAuth: true });
        try {
            const res = await axios.get("/auth/refresh-token");
            set({ user: res.data.user, checkingAuth: false });
            return res.data;
        } catch (error) {
            console.log("Error in refreshToken:", error);
            set({ user: null, checkingAuth: false });
            throw error;
        }
    }


}));


let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    })