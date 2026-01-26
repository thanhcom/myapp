import axios from "axios";

const api = axios.create({
  baseURL: "https://op.thanhcom.site/api",
  timeout: 10000,
});

export default api;
