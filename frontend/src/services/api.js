// src/services/api.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor for unified error shape ──
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

// ── Endpoints ──

/**
 * GET /options
 * Returns: { skills: string[], sub_skills: { [skill]: string[] } }
 */
export const fetchOptions = async () => {
  const { data } = await client.get("/options");
  return data;
};

/**
 * POST /predict
 * Body: { skill: string, sub_skill: string }
 * Returns: { predictions: [{ job, confidence, description }] }
 */
export const postPredict = async (skill, subSkill) => {
  const { data } = await client.post("/predict", {
    skill,
    sub_skill: subSkill,
  });
  return data;
};