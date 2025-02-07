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
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
export class UserService {
  async create(body) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api-auth/register/`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        // Vendedor creado exitosamente
        return { exito: true, mensaje: "Vendedor creado con éxito" };
      } else {
        // Manejar errores de la API
        return { exito: false, mensaje: response.data.mensaje };
      }
    } catch (error) {
      // Manejar errores de red u otros errores
      return { exito: false, mensaje: "Error al conectar con el servidor" };
    }
  }

  async getUsers(urlSearch = null, pageSize = 10) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    const url = urlSearch ? urlSearch : `${URLBase}/api-auth/user/`;

    try {
      const response = await axiosInstance.get(url, {
        params: !urlSearch
          ? {
              page_size: pageSize,
            }
          : {},
        headers: headers,
      });

      if (response.status !== 200) {
        console.error(
          `Error ${response.status} al obtener usuarios: ${response.data}`
        );
        throw new Error(`Error al obtener usuarios: ${response.data}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error en getUsers:", error);
      throw error;
    }
  }

  async getUserById(id) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.get(
        `${URLBase}/api-auth/user/${id}/`,
        {
          headers: headers,
        }
      );

      if (response.status !== 200) {
        const errorMessage =
          response.data || "Error desconocido al obtener detalles del usuario";
        console.error(
          `Error ${response.status} al obtener detalles del usuario: ${errorMessage}`
        );
        throw new Error(
          `Error al obtener detalles del usuario: ${errorMessage}`
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error en getUserById:", error);
      throw error;
    }
  }

  async getUserInfo(id_number) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.get(`${URLBase}/api-auth/me/`, {
        params: { id_number: id_number },
        headers: headers,
      });

      if (response.status !== 200) {
        const errorMessage =
          response.data || "Error desconocido al obtener detalles del usuario";
        console.error(
          `Error ${response.status} al obtener detalles del usuario: ${errorMessage}`
        );
        throw new Error(
          `Error al obtener detalles del usuario: ${errorMessage}`
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error en getUserInfo:", error);
      throw error;
    }
  }

  async getLoggedUserInfo() {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.get(`${URLBase}/api-auth/me/`, {
        headers: headers,
      });

      if (response.status !== 200) {
        const errorMessage =
          response.data || "Error desconocido al obtener detalles del usuario";
        console.error(
          `Error ${response.status} al obtener detalles del usuario: ${errorMessage}`
        );
        throw new Error(
          `Error al obtener detalles del usuario: ${errorMessage}`
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error en getLoggedUserInfo:", error);
      throw error;
    }
  }

  async postInactiveUser(id) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.post(
        `${URLBase}/api-auth/activate-user/`,
        { id_number: id },
        {
          headers: headers,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }

  async getAllGenders() {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.get(`${URLBase}/api-auth/gender/`, {
        headers: headers,
      });

      return response.data;
    } catch (error) {
      console.error("Error al obtener los géneros:", error);
      throw error;
    }
  }

  async getAllIDTypes() {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.get(`${URLBase}/api-auth/id-type/`, {
        headers: headers,
      });

      return response.data;
    } catch (error) {
      console.error("Error al obtener los tipos de documentos:", error);
      throw error;
    }
  }

  async getAllAvailablePlaces() {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const response = await axiosInstance.get(`${URLBase}/api-auth/place/`, {
        headers: headers,
      });

      return response.data;
    } catch (error) {
      console.error("Error al obtener las ciudades disponibles:", error);
      throw error;
    }
  }

  async updateUser(id_user, updatedData) {
    try {
      console.log("Datos actualizados:", updatedData);
      const response = await axiosInstance.patch(
        `${URLBase}/api-auth/user/${id_user}/`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error al actualizar el usuario ${id_user}:`,
        error.response.data
      );
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api-auth/change-password/`,
        {
          password_current: currentPassword,
          password_new: newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      // Puedes personalizar el manejo de errores según tus necesidades
      console.error("Error en la función changePassword del servicio:", error);
      throw error;
    }
  }

  async changePasswordId(resellerId, newPassword) {
    try {
      const response = await axiosInstance.post(
        `${URLBase}/api-auth/change-password-admin/`,
        {
          id_user: resellerId,
          password_new: newPassword,
        },
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
}
