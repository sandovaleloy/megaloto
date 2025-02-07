// import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import SectionOne from "./registerSection/SectionOne";
import "./registerSection/styles/Register.css";
import { UserService } from "../services/UserService";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLoader } from "../context/Loader";

const userService = new UserService();

const Register = ({ formData, location }) => {
  const [editingVendor, setEditingVendor] = useState(null);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  const { showLoader, hideLoader } = useLoader();
  const [localFormData, setLocalFormData] = useState(formData);
  const [btnActualizar, setBtnActualizar] = useState(false);
  const [resellerId, setResellerId] = useState(null);

  const queryParams = location ? new URLSearchParams(location.search) : null;
  const editModeParam = queryParams ? queryParams.get("editMode") : null;
  const [initialFormData, setInitialFormData] = useState(formData);

  const [editMode, setEditMode] = useState(
    !!Object.values(formData).some((value) => !!value) && !editModeParam
  );

  const handleChange = (e) => {
    setLocalFormData({
      ...localFormData,
      [e.target.name]: e.target.value,
    });
  };

  const editResellers = async (e, userData) => {
    e.preventDefault();
    showLoader();
    try {
      if (localFormData && initialFormData && resellerId) {
        const changedFields = Object.keys(localFormData).reduce(
          (result, key) => {
            if (
              key !== "id_type" &&
              key !== "id_number" &&
              localFormData[key] !== initialFormData[key]
            ) {
              result[key] = localFormData[key];
            }
            return result;
          },
          {}
        );

        if (Object.keys(changedFields).length > 0) {
          const resultado = await userService.updateUser(
            resellerId,
            changedFields
          );

          setEditingVendor(null);
          if (resultado.status) {
            hideLoader();
            Swal.fire({
              title: "Usuario actualizado exitosamente",
              icon: "success",
              showCancelButton: false,
              confirmButtonColor: "#1c4b29",
              confirmButtonText: "Aceptar",
            }).then((result) => {
              if (result.isConfirmed) {
                const pathname = window.location.pathname;
                const urlParams = new URLSearchParams(window.location.search);
                const idReseller = urlParams.get("idReseller");
                if (pathname === "/edit_profile") {
                  navigate("/profile");
                } else if (pathname === "/register") {
                  if (idReseller) {
                    navigate(`/profile?idReseller=${localFormData.id_number}`);
                  } else {
                    navigate("/resellers");
                  }
                }
              }
            });
          } else {
            hideLoader();
            Swal.fire({
              title: "Error al actualizar el usuario",
              icon: "error",
              showCancelButton: false,
              confirmButtonColor: "#1c4b29",
              confirmButtonText: "Aceptar",
            });
          }
        }
      } else {
        hideLoader();
        Swal.fire({
          title: "No se han realizado cambios",
          icon: "warning",
          showCancelButton: false,
          confirmButtonColor: "#1c4b29",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      hideLoader();
      Swal.fire({
        title: "Error al actualizar el usuario",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#1c4b29",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const mapSubmitData = (data) => {
    const photoHTMLElement = document.getElementById("imagenSeleccionada");
    if (photoHTMLElement) data["photo"] = photoHTMLElement.src;
    data.gender = parseInt(data.gender, 10);
    data.id_type = parseInt(data.id_type, 10);
    data.place = parseInt(data.place, 10);
    data.id_number = parseInt(data.id_number, 10);
    data.phone = parseInt(data.phone, 10);
    return data;
  };

  const submit = (data) => {
    mapSubmitData(data);
    Swal.fire({
      title: `¿Está seguro de crear al usuario ${data.first_name} ${data.last_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        showLoader();
        const resultado = await userService.create(data);

        if (resultado.exito) {
          Swal.fire({
            icon: "success",
            title: "Usuario creado exitosamente",
            showConfirmButton: false,
            timer: 1500,
          });
          setTimeout(() => {
            hideLoader();
            navigate("/resellers");
          }, 1500);
        } else {
          hideLoader();
          Swal.fire({
            icon: "error",
            title: "Error al crear el usuario",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    });
  };

  const handleBack = () => {
    const pathname = window.location.pathname;
    if (pathname === "/edit_profile") {
      navigate("/profile");
      return;
    }
    if (pathname === "/register") {
      navigate("/resellers");
      return;
    }
    window.history.back();
  };

  const getResellerInfo = (id) => {
    showLoader();
    userService.getUserById(id).then((res) => {
      const formDataTmp = {
        photo: res.photo,
        id_number: res.id_number || "",
        id_type: res.id_type || "",
        first_name: res.first_name || "",
        last_name: res.last_name || "",
        email: res.email || "",
        birth_date: res.birth_date || "",
        gender: res.gender || "",
        place: res.place || "",
        phone: res.phone || "",
        address: res.address || "",
      };
      setLocalFormData(formDataTmp);
      hideLoader();
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idReseller = urlParams.get("idReseller");

    if (idReseller && window.location.pathname === "/register") {
      getResellerInfo(idReseller);
      setResellerId(idReseller);
      setEditMode(true);
    } else if (window.location.pathname === "/edit_profile") {
      const user = JSON.parse(localStorage.getItem("idTrader"));
      if (user) {
        getResellerInfo(user);
        setResellerId(user);
        setEditMode(true);
      }
    }
  }, []);

  return (
    <div>
      {/* // <!-- sign-up begin --> */}
      <div className="sign-up">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10">
              {/* <div className="poklotto-form edit-card" id="poklotto_register_form"> */}
              <div
                className={`poklotto-form ${
                  editMode ? "edit-card default-card" : "default-card"
                }`}
                id="poklotto_register_form"
                style={{ padding: "0px" }}
              >
                <h3 className="steps-heading-title title">
                  {editMode ? "Editar usuario" : "Registro de nuevo usuario"}
                </h3>
                <div className="part-form">
                  <form
                    onSubmit={handleSubmit(submit)}
                    encType="multipart/form-data"
                  >
                    <div className="formulario-container">
                      <div className="seccion">
                        <SectionOne
                          register={register}
                          initialValues={editingVendor}
                          formData={localFormData}
                          handleChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-controller botones-navegacion">
                      {editMode ? (
                        <>
                          <div className="part-btn default-row gap-10 lt-sm-column">
                            <button
                              className="btn-pok-2"
                              onClick={() => handleBack()}
                            >
                              <i className="fa-solid fa-close"></i> Salir del
                              modo edición
                            </button>
                            <button
                              type="submit"
                              className="btn-pok"
                              id="nxt-stp-btn"
                              onClick={editResellers}
                            >
                              Actualizar{" "}
                              <i className="fa-solid fa-angles-right"></i>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="part-btn default-row gap-10 lt-sm-column">
                          <button
                            className="btn-pok-2"
                            onClick={() => handleBack()}
                          >
                            <i className="fa-solid fa-close"></i> Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn-pok"
                            id="nxt-stp-btn"
                          >
                            Confirmar{" "}
                            <i className="fa-solid fa-angles-right"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
