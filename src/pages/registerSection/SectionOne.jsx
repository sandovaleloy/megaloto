/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { UserService } from "../../services/UserService";
import "./styles/Register.css";
import { useLoader } from "../../context/Loader";

const userService = new UserService();

const SectionOne = ({ register, initialValues, formData, handleChange }) => {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const fileInputRef = useRef(null);

  const [docTypes, setDocTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [availableCitys, setAvailableCitys] = useState([]);

  const getAllIDTypes = () => {
    userService
      .getAllIDTypes()
      .then((response) => {
        if (response) {
          setDocTypes(response.results);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error:", error);
        hideLoader();
      });
  };

  const getAllGenders = () => {
    showLoader();
    userService
      .getAllGenders()
      .then((response) => {
        if (response) {
          setGenders(response.results);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error:", error);
        hideLoader();
      });
  };

  const getAllAvailablePlaces = () => {
    showLoader();
    userService
      .getAllAvailablePlaces()
      .then((response) => {
        if (response) {
          setAvailableCitys(response.results);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error:", error);
        hideLoader();
      });
  };

  useEffect(() => {
    getAllIDTypes();
    getAllGenders();
    getAllAvailablePlaces();
  }, []);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        formData.photo = base64String;
        setImagenSeleccionada(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="first-step-form per-step animate__animated blanked ">
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12">
          <label
            htmlFor="fileInput"
            className="form-label"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Seleccionar foto de perfil <span className="required">*</span>
          </label>
          <input
            {...register("photo")}
            type="file"
            id="fileInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImagenChange}
            value={formData?.photo ?? initialValues ? initialValues?.photo : ""}
            ref={fileInputRef}
            // defaultValue={initialValues ? initialValues.id_number : ""}
          />
          <div className="imagen-preview">
            {imagenSeleccionada || formData?.photo ? (
              <img
                src={formData?.photo ?? imagenSeleccionada}
                alt="Foto de perfil"
                id="imagenSeleccionada"
                className="imagen-seleccionada"
                onClick={() => {
                  formData.photo = null;
                  setImagenSeleccionada(null);
                  document.getElementById("fileInput").click();
                }}
              />
            ) : (
              <i
                className="bx bxs-user-circle icon_user"
                onClick={() => {
                  formData.photo = null;
                  setImagenSeleccionada(null);
                  document.getElementById("fileInput").click();
                }}
              ></i>
            )}
          </div>
        </div>
        {docTypes?.length > 0 ? (
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6">
            <label htmlFor="id_type" className="form-label">
              Tipo de documento <span className="required">*</span>
            </label>
            <select
              id="id_type"
              className="dropdown-toggle"
              {...register("id_type")}
              value={
                formData.id_type || (initialValues ? initialValues.id_type : "")
              }
              onChange={handleChange}
            >
              {docTypes?.map((doc_type) => (
                <option key={doc_type.id} value={doc_type.id}>
                  {doc_type.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          ""
        )}
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6">
          <label htmlFor="id_number" className="form-label">
            Nro. de documento <span className="required">*</span>
          </label>
          <input
            required
            {...register("id_number")}
            onChange={handleChange}
            min={1}
            minLength={5}
            maxLength={11}
            type="number"
            id="id_number"
            placeholder="Ex: 1087945145"
            value={
              formData.id_number ||
              (initialValues ? initialValues.id_number : "")
            }
          />
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6">
          <label htmlFor="first_name" className="form-label">
            Nombres <span className="required">*</span>
          </label>
          <input
            required
            {...register("first_name")}
            minLength={3}
            type="text"
            id="first_name"
            placeholder="Ej: John Andres"
            onChange={handleChange}
            value={
              formData.first_name ||
              (initialValues ? initialValues.first_name : "")
            }
            // defaultValue={initialValues ? initialValues.id_number : ""}
          />
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6">
          <label htmlFor="last_name" className="form-label">
            Apellidos <span className="required">*</span>
          </label>
          <input
            required
            {...register("last_name")}
            minLength={3}
            type="text"
            id="last_name"
            placeholder="Ex: Doe"
            onChange={handleChange}
            value={
              formData.last_name ||
              (initialValues ? initialValues.last_name : "")
            }
            // defaultValue={initialValues ? initialValues.id_number : ""}
          />
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12">
          <label htmlFor="email" className="form-label">
            Correo eléctronico <span className="required">*</span>
          </label>
          <input
            required
            {...register("email")}
            type="email"
            id="email"
            placeholder="Ex: yourmail@address"
            // defaultValue={initialValues ? initialValues.id_number : ""}
            value={formData.email || (initialValues ? initialValues.email : "")}
            onChange={handleChange}
          />
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6">
          <label htmlFor="birth_date" className="form-label">
            Fecha de nacimiento <span className="required">*</span>
          </label>
          <div className="birth-date-element">
            <input
              required
              {...register("birth_date")}
              type="date"
              id="birth_date"
              onChange={handleChange}
              value={
                formData.birth_date ||
                (initialValues ? initialValues.birth_date : "")
              }
              placeholder="Ej: 19/05/98"
              // defaultValue={initialValues ? initialValues.id_number : ""}
            />
          </div>
        </div>
        {genders?.length > 0 ? (
          <div className="col-xl-6 col-lg-6 col-md-6">
            <label htmlFor="gender" className="form-label">
              Sexo <span className="required">*</span>
            </label>
            <select
              id="gender"
              className="dropdown-toggle"
              {...register("gender")}
              onChange={handleChange}
              value={
                formData.gender || (initialValues ? initialValues.gender : "")
              }
            >
              {genders?.map((gender) => (
                <option key={gender.id} value={gender.id}>
                  {gender.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          ""
        )}
        {availableCitys?.length > 0 ? (
          <div className="col-xl-6 col-lg-6 col-md-6">
            <label htmlFor="place" className="form-label">
              Ciudad <span className="required">*</span>
            </label>
            <select
              id="place"
              className="dropdown-toggle"
              {...register("place")}
              value={
                formData.place || (initialValues ? initialValues.place : "")
              }
              onChange={handleChange}
            >
              {availableCitys?.map((available_city) => (
                <option key={available_city.id} value={available_city.id}>
                  {available_city.city}, {available_city.state}
                </option>
              ))}
            </select>
          </div>
        ) : (
          ""
        )}
        <div className="col-xl-6 col-lg-6 col-md-6">
          <label htmlFor="phone" className="form-label">
            Nro. télefono <span className="required">*</span>
          </label>
          <input
            required
            {...register("phone")}
            type="number"
            min={0}
            minLength={10}
            maxLength={10}
            id="phone"
            placeholder="Ej: 312 421 5412"
            onChange={handleChange}
            value={formData.phone || (initialValues ? initialValues.phone : "")}
            defaultValue={initialValues ? initialValues.id_number : ""}
          />
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12">
          <label htmlFor="address" className="form-label">
            Dirección <span className="required">*</span>
          </label>
          <input
            required
            {...register("address")}
            type="text"
            id="address"
            onChange={handleChange}
            value={
              formData.address || (initialValues ? initialValues.address : "")
            }
            placeholder="Ej: Calle 12 # 9 - 23."
            defaultValue={initialValues ? initialValues.id_number : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionOne;
