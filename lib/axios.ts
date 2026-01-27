import axios from "axios";

const api = axios.create({
  //baseURL: "https://op.thanhcom.site/api",
  baseURL: "http://192.168.1.28:8080/api",
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

export default api;
