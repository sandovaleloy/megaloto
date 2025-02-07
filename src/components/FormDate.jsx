/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./styles/bootstrap.min.css";
import "./styles/style.css";

const FormDate = ({ formDates }) => {
  const { handleSubmit } = useForm();

  const fechaActualHora0 = () => {
    const fechaActual = new Date();
    fechaActual.setHours(0, 1, 1, 1);
    fechaActual.setHours(fechaActual.getHours() - 5);
    const formatoFecha = fechaActual.toISOString().slice(0, 19);
    return formatoFecha;
  };

  const fechaActualHoraFin = () => {
    const fechaActual = new Date();
    fechaActual.setHours(23, 59, 59, 999);
    fechaActual.setHours(fechaActual.getHours() - 5);
    const formatoFecha = fechaActual.toISOString().slice(0, 19);
    return formatoFecha;
  };

  const [formulario, setFormulario] = useState({
    fechaDesde: fechaActualHora0(),
    fechaHasta: fechaActualHoraFin(),
  });

  const handleFechaDesdeChange = (event) => {
    const nuevaFechaDesde = event.target.value;
    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      fechaDesde: nuevaFechaDesde,
    }));
  };

  const handleFechaHastaChange = (event) => {
    const nuevaFechasHasta = event.target.value;
    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      fechaHasta: nuevaFechasHasta,
    }));
  };

  const handleSubmit2 = () => {
    formDates(formulario);
  };

  useEffect(() => {}, []);

  return (
    <div className="container">
      <form onSubmit={handleSubmit(handleSubmit2)} className="fecha_form">
        <div className="default-row gap-10 divContainer_form align-end lt-md-column">
          <div className="input_date" style={{ width: "100%" }}>
            <label htmlFor="fechaDesde">
              <b>Desde:</b> <span className="required">*</span>
            </label>
            <input
              required
              className="form-control"
              type="datetime-local"
              id="fechaDesde"
              value={formulario.fechaDesde}
              onChange={handleFechaDesdeChange}
            />
          </div>
          <div className="input_date" style={{ width: "100%" }}>
            <label htmlFor="fechaHasta">
              <b>Hasta:</b> <span className="required">*</span>
            </label>
            <input
              required
              className="form-control "
              type="datetime-local"
              id="fechaHasta"
              max={fechaActualHoraFin()}
              value={formulario.fechaHasta}
              onChange={handleFechaHastaChange}
            />
          </div>
          <div className="btn_div">
            <button
              className="btn btn-success"
              type="submit"
              onClick={handleSubmit2}
              style={{ height: "35px" }}
            >
              Filtrar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormDate;
