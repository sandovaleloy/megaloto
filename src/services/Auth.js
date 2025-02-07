import axios from "axios";
import URLBase from "../Api/api";

export class AuthService {
  constructor() {
    this.authenticated = false;
  }

  async login(id_number, password) {
    try {
      const response = await axios.post(`${URLBase}/api-auth/login/`, {
        id_number,
        password,
      });
      this.authenticated = true;
      if (response.status === 201 || response.status === 200) {
        return response.data;
      } else {
        return { error: true, response: response.data };
      }
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  }

  async logout() {
    try {
      const response = await axios.post(
        `${URLBase}/api-auth/logout/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        this.authenticated = false;
        return response.data;
      } else {
        return { error: true, response: response.data };
      }
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem("token");
    const refresh = localStorage.getItem("refresh");
    if (token && refresh) {
      return true;
    }
    return false;
  }

  async refreshToken() {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      try {
        const response = await axios.post(
          `${URLBase}/api-auth/login/refresh/`,
          {
            refresh,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const data = response.data;
          localStorage.setItem("token", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("idRol", data.role);
          localStorage.setItem("idTrader", data.id);
          this.authenticated = true;
          return true;
        } else {
          this.logout();
        }
      } catch (error) {
        console.error(error);
        this.logout();
      }
    }
  }
}
