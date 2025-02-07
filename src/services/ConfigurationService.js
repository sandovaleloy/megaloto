/* eslint-disable no-useless-catch */
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
        localStorage.removeItem("idRol");
        localStorage.removeItem("idTrader");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export class ConfigurationService {
  // Lugares disponibles
  async getJSONColombia() {
    try {
      const response = await axiosInstance.get("../colombia.json", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error en getJSONColombia:", error);
      throw error;
    }
  }

  async getAvailablePlaces(urlSearch = null) {
    const url = urlSearch ? urlSearch : `${URLBase}/api-auth/place/`;
    try {
      const response = await axiosInstance.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async postAvailablePlace(body) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api-auth/place/`,
        body,
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
        return { error: true, response: await response.data };
      }
    } catch (error) {
      throw error;
    }
  }

  async putAvailablePlace(body) {
    try {
      const response = await axiosInstance.put(
        `${URLBase}/api-auth/place/`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAvailablePlace(id) {
    try {
      const response = await axiosInstance.delete(
        `${URLBase}/api-auth/place/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Precios
  async getHistoricalPrices(urlSearch = null) {
    const url = urlSearch ? urlSearch : `${URLBase}/api/v1/value-ticket/`;
    try {
      const response = await axiosInstance.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async postPrice(body) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api/v1/value-ticket/`,
        body,
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
        return { error: true, response: await response.data };
      }
    } catch (error) {
      throw error;
    }
  }

  async patchPrice(body) {
    try {
      const response = await axiosInstance.patch(
        `${URLBase}/api/v1/value-ticket/`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePrice(id) {
    try {
      const response = await axiosInstance.delete(
        `${URLBase}/api/v1/value-ticket/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Parametros para ganar
  async getParametersToWin(urlSearch = null) {
    const url = urlSearch ? urlSearch : `${URLBase}/api/v1/parameter-win/`;
    try {
      const response = await axiosInstance.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async postParametersToWin(body) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api/v1/parameter-win/`,
        body,
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
        return { error: true, response: await response.data };
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteParametersToWin(id) {
    try {
      const response = await axiosInstance.delete(
        `${URLBase}/api/v1/parameter-win/${id}/`,
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
        return { error: true, response: await response.data };
      }
    } catch (error) {
      throw error;
    }
  }
}
