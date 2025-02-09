import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../components/styles/all.min.css";
import "../components/styles/animate.css";
import "../components/styles/animate.min.css";
import "../components/styles/bootstrap.min.css";
import "../components/styles/owl.carrousel.min.css";
import "../components/styles/style.css";
import { authUse } from "../context/AuthContext.jsx";
import { AuthService } from "../services/Auth.js";
import { UserService } from "../services/UserService.js";
import { useEffect, useRef, useState } from "react";
import { useLoader } from "../context/Loader";

const userService = new UserService();
const authServices = new AuthService();

const Navbar = () => {
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const { isAdmin, isLogged, setIsAdmin, setIsLogged } = authUse();
  const [userData, setUserData] = useState();
  const [avatarDefaultPhoto] = useState("/navbar/avatar-default.png");
  const botonMenuRef = useRef(null);

  const handleLogout = () => {
    // showLoader();
    // Lógica para cerrar sesión
    // Por ejemplo, limpiar el token de autenticación
    authServices
      .logout()
      .then((res) => {
        if (navigate("/")) {
          // localStorage.removeItem("idRol");
          // localStorage.removeItem("idTrader");
          // localStorage.removeItem("token");
          // localStorage.removeItem("refresh");
          // setIsLogged(false);
          // setIsAdmin(false);
          // hideLoader();
        }
      })
      .catch((err) => {
        console.error("Ha ocurrido un error al cerrar sesión", err);
        // hideLoader();
      });
  };

  const getLoggedUserProfile = async () => {
    userService.getLoggedUserInfo().then((res) => {
      if (res) setUserData(res);
    });
  };

  const confirmLogout = () => {
    Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Esta acción cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, ejecutar la lógica de cerrar sesión
        handleMenuClick();
        handleLogout();
      }
    });
  };

  const getPathName = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idReseller = urlParams.get("idReseller");

    const routesObject = {
      "/": isAdmin ? "Login" : "Inicio",
      "/home": "Inicio",
      "/dashboard": "Dashboard",
      "/resellers": "Vendedores",
      "/giveaways": "Sorteos",
      "/config": "Configuración",
      "/profile": idReseller ? "Perfíl vendedor" : "Perfíl",
      "/all_tickets": "Consultar ventas",
      "/register": idReseller ? "Editar vendedor" : "Registrar vendedor",
      "/edit_profile": "Editar perfil",
      "/giveaway_results": "Detalle de sorteo",
    };
    return routesObject[window.location.pathname];
  };

  useEffect(() => {
    if (isLogged) {
      getLoggedUserProfile();
    }
  }, []);

  const handleMenuClick = () => {
    // Simula un clic en el botón del menú
    if (botonMenuRef.current) {
      botonMenuRef.current.click();
    }
  };

  return (
    <div className="header">
      <nav className="navbar custom-navbar">
        <div
          className={`container-fluid ${!isLogged ? "justify-center-imp" : ""}`}
        >
          {isLogged ? (
            <button
              ref={botonMenuRef}
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          ) : (
            ""
          )}
          {isLogged ? (
            <div className="breadcrumb-title">{getPathName()}</div>
          ) : (
            ""
          )}
          <div className="logo">
            <Link to="/">
              <img
                src="/logoSvg/MegalotoMesa de trabajo 30.svg"
                alt=""
                style={{ height: "90px" }}
              />
            </Link>
          </div>
          {isLogged ? (
            <div
              className="navbar-background offcanvas offcanvas-start"
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel"
            >
              <div className="offcanvas-header default-column gap-10 justify-center-imp">
                <div className="logo">
                  <Link onClick={handleMenuClick} to="/profile">
                    <img
                      className="navbar-profile-img"
                      src={userData?.photo ?? avatarDefaultPhoto}
                      alt="Foto de perfil"
                    />
                  </Link>
                </div>
                <div className="default-column justify-center align-center">
                  <div style={{ fontSize: "14px" }}>{`${userData?.role}`}</div>
                  <div
                    style={{ fontWeight: "bold" }}
                  >{`${userData?.first_name} ${userData?.last_name}`}</div>
                  <div>CC. {`${userData?.id_number}`}</div>
                  <Link onClick={handleMenuClick} to="/profile">
                    <div style={{ textDecoration: "none" }}>Ir a perfíl</div>
                  </Link>
                </div>
              </div>
              <div className="hoz-divider"></div>
              <div className="offcanvas-body">
                {isAdmin ? (
                  <div
                    className="default-column justify-space-between align-start"
                    style={{ height: "100%" }}
                  >
                    <ul className="w100 gap-10 navbar-nav justify-content-start flex-grow-1 pe-3">
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/home"
                        >
                          <i className="nav-icon fa-solid fa-ticket"></i>
                          &nbsp;Crear ticket
                        </Link>
                      </li>
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/dashboard"
                        >
                          <i className="nav-icon fa-solid fa-chart-simple"></i>
                          &nbsp;Dashboard
                        </Link>
                      </li>
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/resellers"
                        >
                          <i className="nav-icon fa-solid fa-user-group"></i>
                          &nbsp;Vendedores
                        </Link>
                      </li>
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/giveaways"
                        >
                          <i className="nav-icon fa-solid fa-layer-group"></i>
                          &nbsp;Sorteos
                        </Link>
                      </li>
                    </ul>
                    <ul className="w100 gap-10 navbar-nav justify-content-end flex-grow-1 pe-3">
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/config"
                        >
                          <i className="nav-icon fa-solid fa-gear"></i>
                          &nbsp;Configuración
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={confirmLogout}
                          className="btn btn-danger w100"
                        >
                          <i className="fa-solid fa-right-from-bracket"></i>
                          &nbsp;Cerrar sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div
                    className="default-column justify-space-between align-start"
                    style={{ height: "100%" }}
                  >
                    <ul className="w100 gap-10 navbar-nav justify-content-start flex-grow-1 pe-3">
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/home"
                        >
                          <i className="nav-icon fa-solid fa-ticket"></i>
                          &nbsp;Crear ticket
                        </Link>
                      </li>
                      <li className="navbar-custom-item">
                        <Link
                          className="navbar-custom-link"
                          onClick={handleMenuClick}
                          to="/all_tickets"
                        >
                          <i className="nav-icon fa-solid fa-chart-simple"></i>
                          &nbsp;Consultar ventas
                        </Link>
                      </li>
                    </ul>
                    <ul className="w100 gap-10 navbar-nav justify-content-end flex-grow-1 pe-3">
                      <li>
                        <button
                          onClick={confirmLogout}
                          className="btn btn-danger w100"
                        >
                          <i className="fa-solid fa-right-from-bracket"></i>
                          &nbsp;Cerrar sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
