import { useForm } from "react-hook-form";
import { AuthService } from "../services/Auth";
import { Link, useNavigate } from "react-router-dom";
import { authUse } from "../context/AuthContext";
import { useLoader } from "../context/Loader";
import Swal from "sweetalert2";

const authServices = new AuthService();

const SignIn = () => {
  const { showLoader, hideLoader } = useLoader();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { setIsLogged, setIsAdmin } = authUse();

  const submit = async (data) => {
    showLoader();
    try {
      const response = await authServices.login(data.id_number, data.password);
      if (response && response.access) {
        localStorage.setItem("token", response.access);
        localStorage.setItem("refresh", response.refresh);
        localStorage.setItem("idRol", response.role);
        localStorage.setItem("idTrader", response.id);
        setIsLogged(true);
        if (response.role === 1) setIsAdmin(true);
        navigate("/");
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        hideLoader();
        Swal.fire({
          title: "Error!",
          text: "Ha ocurrido un error al tratar de iniciar sesión",
          icon: "error",
          confirmButtonColor: "#1c4b29",
        });
      }
    } catch (error) {
      console.error("Ha ocurrido un error:", error);
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Error!",
          text: "Credenciales incorrectas. Verifica tu nombre de usuario y contraseña.",
          icon: "error",
          confirmButtonColor: "#1c4b29",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Ha ocurrido un error al tratar de iniciar sesión",
          icon: "error",
          confirmButtonColor: "#1c4b29",
        });
      }
      hideLoader();
    }
  };

  // const submit = async (data) => {
  //   showLoader();
  //   authServices
  //     .login(data.id_number, data.password)
  //     .then((response) => {
  //       if(response.error){
  //         Swal.fire({
  //           title: "Error!",
  //           text: "Ha ocurrido un error al tratar de iniciar sesión",
  //           icon: "error",
  //           confirmButtonColor: "#1c4b29",
  //         });
  //         hideLoader();
  //         return;
  //       }
  //       if (response) {
  //         localStorage.setItem("token", response.access);
  //         localStorage.setItem("refresh", response.refresh);
  //         localStorage.setItem("idRol", response.role);
  //         localStorage.setItem("idTrader", response.id);
  //         setIsLogged(true);
  //         if (response.role === 1) setIsAdmin(true);
  //         hideLoader();
  //         navigate("/");
  //         setTimeout(() => {
  //           window.location.reload();
  //         }, 100);
  //       }
  //     })
  //     .catch((error) => {
  //       hideLoader();
  //       console.error('Ha ocurrido un error:', error);
  //     });
  // };

  return (
    <div>
      {/* <!-- sign-in begin --> */}
      <div className="sign-in">
        <div className="container">
          <div className="row justify-content-lg-between justify-content-center ">
            <div className="col-xl-5 col-lg-6">
              <div
                className="poklotto-form default-card"
                style={{ padding: 0 }}
              >
                <h3 className="title">Iniciar sesion</h3>
                <div className="part-form">
                  <form onSubmit={handleSubmit(submit)}>
                    <div className="row">
                      <div className="col-xl-12">
                        <label htmlFor="first_name" className="form-label">
                          Nro. De Documento
                        </label>
                        <input
                          type="number"
                          {...register("id_number")}
                          id="first_name"
                          placeholder="Ej: 123456789"
                        />
                      </div>
                      <div className="col-xl-12">
                        <label htmlFor="last_name" className="form-label">
                          Password
                        </label>
                        <input
                          type="password"
                          {...register("password")}
                          id="last_name"
                          placeholder="**********"
                        />
                      </div>
                    </div>
                    <div className="part-submit">
                      <button type="submit" className="btn-pok">
                        <Link to="/home" className="text-decoration-none">
                          Continuar <i className="fa-solid fa-angle-right"></i>
                        </Link>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-5 col-md-12 col-sm-12 d-xl-flex d-lg-flex d-block align-items-center">
              <div className="part-right">
                <div className="part-img">
                  <img src="./public/sign/sign-in-img.png" alt="" />
                </div>
                <div className="part-text">
                  <div className="section-title">
                    <h3 className="sub-title">Welcome to Megaloto</h3>
                    <h2 className="title">
                      Por favor realiza el inicio de sesion.
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- sign-in end --> */}
    </div>
  );
};

export default SignIn;
