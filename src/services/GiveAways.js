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

export class GiveAwaysService {
  async getGiveAways(urlSearch = null, pageSize = 10) {
    const url = urlSearch ? urlSearch : `${URLBase}/api/v1/giveaway/`;
    try {
      const response = await axiosInstance.get(url, {
        params: !urlSearch
          ? {
              page_size: pageSize,
            }
          : {},
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error during getGiveAways:", error);
      throw error;
    }
  }

  async getGiveAwayById(id_giveaway) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/giveaway/${id_giveaway}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error during getGiveAways:", error);
      throw error;
    }
  }

  async postGiveAway(body) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api/v1/giveaway/`,
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
        return { error: true, response: response.data };
      }
    } catch (error) {
      console.error("Error during postGiveAway:", error);
      throw error;
    }
  }

  async addGiveawayResult(id_giveaway, body) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api/v1/giveaway/${id_giveaway}/result/`,
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
      console.error("Error during patchGiveAway:", error);
      throw error;
    }
  }

  async deleteGiveAway(id_giveaway) {
    try {
      const response = await axiosInstance.delete(
        `${URLBase}/api/v1/giveaway/${id_giveaway}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error during deleteGiveAway:", error);
      throw error;
    }
  }

  async getScrappingResult(id_giveaway) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/giveaway/${id_giveaway}/result/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error during getGiveAways:", error);
      throw error;
    }
  }
}
