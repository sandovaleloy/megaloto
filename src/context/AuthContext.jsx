import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(!!sessionStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(
    sessionStorage.getItem("idRol") === "1"
  );

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLogged(!!token);
    setIsAdmin(sessionStorage.getItem("idRol") === "1");
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLogged, isAdmin, setIsLogged, setIsAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const authUse = () => {
  return useContext(AuthContext);
};
