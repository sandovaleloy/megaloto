import React, { createContext, useState, useContext, useEffect } from "react";
import "ldrs/trefoil";

const LoaderContext = createContext();

const Loader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false); // Comienza como cargando

  useEffect(() => {
    // Ocultar el loader después de 3 segundos (puedes ajustarlo a lo que desees)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3000 ms = 3 segundos

    // Limpiar el timer si el componente se desmonta o se vuelve a ejecutar
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading }}>
      {isLoading && <LoaderComponent />}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

const LoaderComponent = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 52,
      }}
    >
      <l-trefoil
        size="50"
        stroke="4"
        stroke-length="0.15"
        bg-opacity="0.1"
        speed="1.4"
        color="black"
      ></l-trefoil>
    </div>
  );
};

export default Loader;
