import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
