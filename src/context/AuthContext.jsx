import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("idRol") === "1");

  return (
    <AuthContext.Provider
      value={{ isLogged, isAdmin, setIsLogged, setIsAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const authUse = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("authUse debe usarse dentro de un AuthProvider");
  }
  return context;
};
