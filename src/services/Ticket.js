import URLBase from "../Api/api";
import axios from "axios";
import { AuthService } from "./Auth";

const authService = new AuthService();

const axiosInstance = axios.create({
  baseURL: `${URLBase}`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await authService.refreshToken();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export class TicketService {
  async add(ticket) {
    try {
      const response = await axiosInstance.post(
        URLBase + "/api/v1/ticket/",
        ticket,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        return response.data;
      } else {
        return { error: true, response: response.data };
      }
    } catch (error) {
      console.error("Error during add:", error);
      throw error;
    }
  }

  async getList() {
    try {
      const response = await axiosInstance.get(URLBase + "/api/v1/ticket/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error("Error during getList:", error);
      throw error;
    }
  }

  async getTicketById(id) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/ticket/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error en getTicketById:", error);
      throw error;
    }
  }

  async getTicketByBarcode(barcode) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/ticket/validate/${barcode}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error en getTicketByBarcode:", error);
      throw error;
    }
  }

  async edit(id, value) {
    try {
      const response = await axiosInstance.patch(
        `${URLBase}/api/v1/ticket/${id}/`,
        value,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error en edit:", error);
      throw error;
    }
  }

  async cancelTicket(barcode) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/ticket/cancel/${barcode}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error en cancelTicket:", error);
      throw error;
    }
  }

  async postClaimTicket(id) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api/v1/ticket/${id}/reclaim/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error en postClaimTicket:", error);
      throw error;
    }
  }
}
