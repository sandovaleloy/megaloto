import { Link } from "react-router-dom";
import { UserService } from "../services/UserService";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLoader } from "../context/Loader";

const userService = new UserService();

const Resellers = () => {
  const { showLoader, hideLoader } = useLoader();
  const [resellers, setResellers] = useState([]);
  const pageSizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const changeTableSize = (event) => {
    getUsers(null, event.target.value);
  };

  const getUsers = async (urlSearch = null, pageSize = 10) => {
    showLoader();
    setResellers([]);
    userService.getUsers(urlSearch, pageSize).then((res) => {
      setResellers(res);
      hideLoader();
    });
  };

  const deleteReseller = (reseller) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este vendedor?",
      html: `<p>Esta acción eliminará el vendedor <b>${reseller.first_name} ${reseller.last_name}</b> de la base de datos.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        userService.postInactiveUser(reseller.id_number).then((res) => {
          if (res) {
            getUsers();
            Swal.fire({
              icon: "success",
              title: "Eliminado exitosamente",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        });
      }
    });
  };

  const changePassword = (reseller) => {
    Swal.fire({
      title: "Cambiar contraseña",
      html: `<div class="default-column gap-10">
      <p>Ingrese la nueva contraseña para el usuario <b>${reseller.first_name} ${reseller.last_name}</b></p>
      <input required id="new_password" type="password" class="swal2-input" placeholder="Digite la nueva contraseña">
      </div>`,
      icon: "warning",
      confirmButtonColor: "#1c4b29",
      confirmButtonText: "Cambiar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return new Promise(function (resolve) {
          resolve([document.getElementById("new_password").value]);
        });
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (result.value[0] === "") {
          await Swal.fire({
            title: "Error",
            text: "Por favor complete todos los campos",
            icon: "error",
            confirmButtonColor: "#1c4b29",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            changePassword(reseller);
            return;
          });
        } else if (result.value[0].length < 8) {
          await Swal.fire({
            title: "Error",
            text: "La contraseña debe tener mínimo 8 caracteres",
            icon: "error",
            confirmButtonColor: "#1c4b29",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            changePassword(reseller);
            return;
          });
        } else {
          showLoader();
          userService
            .changePasswordId(reseller.id, result.value[0])
            .then((res) => {
              console.log("res", res);
              if (res) {
                hideLoader();
                Swal.fire({
                  icon: "success",
                  title: "Contraseña cambiada exitosamente",
                  showConfirmButton: false,
                  timer: 1500,
                });
              }
            })
            .catch((err) => {
              hideLoader();
              Swal.fire({
                icon: "error",
                title: "Error al cambiar la contraseña",
                showConfirmButton: false,
                timer: 1500,
              });
              console.error(
                "Ha ocurrido un error al cambiar la contraseña",
                err
              );
            });
        }
      }
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      {/* <!-- resellers-section begin --> */}
      <div className="container resellers-section">
        {resellers?.results?.length > 0 ? (
          <div className="table-buttons-top">
            <Link className="nav-link" to="/register">
              <button type="button" className="btn btn-primary">
                <i className="fa-solid fa-add"></i>&nbsp;Agregar
              </button>
            </Link>
          </div>
        ) : (
          ""
        )}
        {resellers?.results?.length > 0 ? (
          <div className="default-card row justify-content-center">
            <table className="default-table table table-striped">
              <thead>
                <tr className="tr-head-table">
                  <th scope="col">Identificación</th>
                  <th scope="col">Nombres</th>
                  <th scope="col">Apellidos</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Telefono</th>
                  <th scope="col">Ciudad</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {resellers?.results?.map((reseller) => (
                  <tr className="tr-table" key={reseller.id_number}>
                    <th scope="row">
                      <b className="th-aux">Identificación:</b>
                      {`${reseller.id_type_alias}. ${reseller.id_number}`}
                    </th>
                    <td>
                      <b className="td-aux">Nombres:</b>
                      {` ${reseller.first_name}`}
                    </td>
                    <td>
                      <b className="td-aux">Apellidos:</b>
                      {` ${reseller.last_name}`}
                    </td>
                    <td>
                      <b className="td-aux">Correo:</b>
                      {` ${reseller.email}`}
                    </td>
                    <td>
                      <b className="td-aux">Telefono:</b>
                      {` ${reseller.phone}`}
                    </td>
                    <td>
                      <b className="td-aux">Ciudad:</b>
                      {` ${reseller.city}, ${reseller.state}`}
                    </td>
                    <td className="td-actions-table">
                      <Link
                        to={`/profile?idReseller=${reseller.id_number}`}
                        type="button"
                      >
                        <button type="button" className="btn btn-success">
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </Link>
                      <Link
                        to={`/register?idReseller=${reseller.id}`}
                        type="button"
                      >
                        <button type="button" className="btn btn-secondary">
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                      </Link>
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => changePassword(reseller)}
                      >
                        <i className="fa-solid fa-lock"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => deleteReseller(reseller)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer default-row justify-space-between gap-10">
              <div className="table-footer-arrows gap-10">
                {resellers?.previous ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => getUsers(resellers?.previous)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                ) : (
                  ""
                )}
                {resellers?.next ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => getUsers(resellers?.next)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                ) : (
                  ""
                )}
              </div>
              <div className="table-footer-paginator">
                <span>
                  1-{" "}
                  <select onChange={changeTableSize}>
                    {pageSizes.map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>{" "}
                  de {resellers?.count}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="default-card default-column align-center empty_table">
            <p>
              No hay vendedores registrados, puede agregarlos haciendo uso del
              botón
            </p>
            <Link className="nav-link" to="/register">
              <button type="button" className="btn btn-primary">
                <i className="fa-solid fa-add"></i>&nbsp;Agregar
              </button>
            </Link>
          </div>
        )}
      </div>
      {/* <!-- resellers-section end --> */}
    </div>
  );
};

export default Resellers;
