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

export class StaticsService {
  async getLoggedUserStatics() {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/me/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalles del usuario: ${error.message}`);
      throw error;
    }
  }

  async getResellerStatics(id_number) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/me/`,
        {
          params: {
            id_number: id_number,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalles del usuario: ${error.message}`);
      throw error;
    }
  }

  async getTicketsWithDateRangeAndTrader(
    id_trader,
    start_date,
    end_date,
    urlSearch = null,
    pageSize = 10
  ) {
    const url = urlSearch ? urlSearch : `${URLBase}/api/v1/ticket/`;
    try {
      const response = await axiosInstance.get(url, {
        params: !urlSearch
          ? {
              start: start_date,
              end: end_date,
              id_trader: id_trader,
              page_size: pageSize,
            }
          : {},
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRange(
    start_date,
    end_date,
    is_paginated = true,
    urlSearch = null,
    pageSize = 10
  ) {
    const url = urlSearch ? urlSearch : `${URLBase}/api/v1/ticket/`;
    try {
      const response = await axiosInstance.get(url, {
        params: !urlSearch
          ? {
              start: start_date,
              end: end_date,
              is_paginated: is_paginated,
              page_size: pageSize,
            }
          : {},
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTotalTicketsWithDateRangeAndTrader(id_trader, start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/`,
        {
          params: {
            start: start_date,
            end: end_date,
            id_trader: id_trader,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTotalTicketsWithDateRange(start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/`,
        {
          params: {
            start: start_date,
            end: end_date,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRangeByDayAndTrader(id_trader, start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/time-series/`,
        {
          params: {
            start: start_date,
            end: end_date,
            id_trader: id_trader,
            group_by_time: "day",
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRangeByDay(start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/time-series/`,
        {
          params: {
            start: start_date,
            end: end_date,
            group_by_time: "day",
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRangeByDayAndGiveAway(start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/group-by/giveaway/`,
        {
          params: {
            start: start_date,
            end: end_date,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRangeByDayAndGiveAwayAndTrader(
    id_trader,
    start_date,
    end_date
  ) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/group-by/giveaway/`,
        {
          params: {
            start: start_date,
            end: end_date,
            id_trader: id_trader,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTotalProfitsWithDateRange(start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/business/`,
        {
          params: {
            start: start_date,
            end: end_date,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTotalProfitsWithDateRangeAndTrader(id_trader, start_date, end_date) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/business/`,
        {
          params: {
            start: start_date,
            end: end_date,
            id_trader: id_trader,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Giveaways result page

  async getTicketsWithDateRangeAndGiveaway(
    id_giveaway,
    start_date,
    end_date,
    is_paginated = true,
    urlSearch = null,
    pageSize = 10
  ) {
    const url = urlSearch ? urlSearch : `${URLBase}/api/v1/ticket/`;
    try {
      const response = await axiosInstance.get(url, {
        params: {
          id_giveaway: id_giveaway,
          start: start_date,
          end: end_date,
          is_paginated: is_paginated,
          page_size: pageSize,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRangeByGiveawayGroupByDay(
    id_giveaway,
    start_date,
    end_date
  ) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/time-series/`,
        {
          params: {
            id_giveaway: id_giveaway,
            start: start_date,
            end: end_date,
            group_by_time: "day",
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTotalTicketsWithDateRangeAndGiveaway(
    id_giveaway,
    start_date,
    end_date
  ) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/`,
        {
          params: {
            id_giveaway: id_giveaway,
            start: start_date,
            end: end_date,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTicketsWithDateRangeByGiveAwayGroupByTrader(
    id_giveaway,
    start_date,
    end_date
  ) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/group-by/trader/`,
        {
          params: {
            id_giveaway: id_giveaway,
            start: start_date,
            end: end_date,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTotalProfitsWithDateRangeByGiveaway(
    id_giveaway,
    start_date,
    end_date
  ) {
    try {
      const response = await axiosInstance.get(
        `${URLBase}/api/v1/statistics/total/business/`,
        {
          params: {
            id_giveaway: id_giveaway,
            start: start_date,
            end: end_date,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
