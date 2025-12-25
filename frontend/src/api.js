import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export const getArticles = () =>
  axios.get(`${API}/articles`).then(res => res.data);
