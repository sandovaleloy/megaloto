import { useEffect, useState } from "react";
import { ConfigurationService } from "../services/ConfigurationService";
import { useForm } from "react-hook-form";
import { useLoader } from "../context/Loader";
import Swal from "sweetalert2";

const configurationService = new ConfigurationService();

const Config = () => {
  const { showLoader, hideLoader } = useLoader();
  const [editMode, setEditMode] = useState(false);
  const [priceToEdit, setPriceToEdit] = useState(null);
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [parametersToWin, setParametersToWin] = useState([]);
  const [departaments, setDepartaments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDepartament, setSelectedDepartament] = useState(null);
  const { register, handleSubmit } = useForm();

  const getHistoricalPrices = (urlSearch = null) => {
    configurationService.getHistoricalPrices(urlSearch).then((response) => {
      setHistoricalPrices(response);
    });
  };

  const getAvailablePlaces = (urlSearch = null) => {
    configurationService.getAvailablePlaces(urlSearch).then((response) => {
      setAvailablePlaces(response);
    });
  };

  const getJSONColombia = () => {
    configurationService.getJSONColombia().then((response) => {
      if (response) setDepartaments(response);
    });
  };

  const getParametersToWin = (urlSearch = null) => {
    configurationService.getParametersToWin(urlSearch).then((response) => {
      if (response) setParametersToWin(response);
    });
  };

  const isCitiesEnabled = () => {
    return selectedDepartament;
  };

  const changeDepartament = (e) => {
    if (e.target.value) {
      setSelectedDepartament(e.target.value);
      setCities(
        departaments.filter(
          (departament) => departament.id === parseInt(e.target.value)
        )[0].ciudades
      );
    }
  };

  const submitPricesForm = (data) => {
    const tempData = {
      value: parseInt(data.value),
      seller_commission: parseFloat(data.seller_commission),
      date: data.date,
    };
    Swal.fire({
      title: "¿Estás seguro de cambiar el precio?",
      html: `El nuevo precio será de <b>$${
        data.value
      }</b> y la comisión del vendedor será de <b>${
        data.seller_commission
      }%</b> a partir del <b>${data.date.split("T")[0]}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        showLoader();
        if (editMode) {
          tempData.id = priceToEdit.id;
          configurationService
            .patchPrice(tempData)
            .then((response) => {
              if (response?.error || !response) {
                Swal.fire({
                  title: "Error",
                  text: "No se pudo cambiar el precio",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
                hideLoader();
                return;
              }
              if (response) {
                Swal.fire({
                  title: "Confirmado!",
                  html: `El nuevo precio será de <b>$${
                    data.value
                  }</b> y la comisión del vendedor será de <b>${
                    data.seller_commission
                  }%</b> a partir del <b>${data.date.split("T")[0]}</b>`,
                  icon: "success",
                  confirmButtonColor: "#1c4b29",
                });
                getHistoricalPrices();
                setEditMode(false);
                hideLoader();
              }
            })
            .catch((error) => {
              console.error("Ha ocurrido un error:", error);
              setEditMode(false);
              hideLoader();
              Swal.fire({
                title: "Error",
                text: "No se pudo cambiar el precio",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
            });
        } else {
          configurationService
            .postPrice(tempData)
            .then((response) => {
              if (response?.error || !response) {
                Swal.fire({
                  title: "Error",
                  text: "No se pudo cambiar el precio",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
                hideLoader();
                return;
              }
              if (response) {
                Swal.fire({
                  title: "Confirmado!",
                  html: `El nuevo precio será de <b>$${
                    data.value
                  }</b> y la comisión del vendedor será de <b>${
                    data.seller_commission
                  }%</b> a partir del <b>${data.date.split("T")[0]}</b>`,
                  icon: "success",
                  confirmButtonColor: "#1c4b29",
                });
                getHistoricalPrices();
                hideLoader();
              }
            })
            .catch((error) => {
              console.error("Ha ocurrido un error:", error);
              hideLoader();
              Swal.fire({
                title: "Error",
                text: "No se pudo cambiar el precio",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
            });
        }
      }
    });
  };

  const editPrice = (historicalPrice) => {
    setEditMode(true);
    setPriceToEdit(historicalPrice);
    document.getElementById("value").value = historicalPrice.value;
    document.getElementById("value").focus();
    document.getElementById("value").blur();
    document.getElementById("seller_commission").value =
      historicalPrice.seller_commission;
    document.getElementById("seller_commission").focus();
    document.getElementById("seller_commission").blur();
    document.getElementById("date").value = historicalPrice.date
      .toString()
      .slice(0, 16);
    document.getElementById("date").focus();
    document.getElementById("date").blur();
  };

  const deletePrice = (historicalPrice) => {
    Swal.fire({
      title: "¿Está seguro de eliminar?",
      html: `El precio <b>${
        historicalPrice.value
      }</b> con comisión del vendedor <b>${
        historicalPrice.seller_commission
      }%</b> que iba a partir del <b>${
        historicalPrice.date.split("T")[0]
      }</b> será eliminado`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        configurationService
          .deletePrice(historicalPrice.id)
          .then((response) => {
            if (response?.error || !response) {
              Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el precio",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
              return;
            } else {
              Swal.fire({
                title: "Confirmado!",
                html: `El precio <b>${historicalPrice.value}</b> con comisión del vendedor <b>${historicalPrice.seller_commission}%</b> que iba a partir del <b>${historicalPrice.date}</b> ha sido eliminado`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
              getHistoricalPrices();
            }
          });
      }
    });
  };

  const submitAvailablesPlacesForm = (data) => {
    const tempData = {
      state: departaments.filter(
        (departament) => departament.id === parseInt(data.state)
      )[0].departamento,
      city: data.city,
    };
    Swal.fire({
      title: "¿Está seguro de agregar?",
      html: `La ciudad <b>${tempData.city}</b> del departamento <b>${tempData.state}</b> será habilitada`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        showLoader();
        configurationService
          .postAvailablePlace(tempData)
          .then((response) => {
            if (response?.error || !response) {
              Swal.fire({
                title: "Error",
                text: "No se pudo agregar la ciudad",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
              return;
            }
            if (response) {
              Swal.fire({
                title: "Confirmado!",
                html: `La ciudad <b>${tempData.city}</b> del departamento <b>${tempData.state}</b> ha sido habilitada`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              getAvailablePlaces();
              hideLoader();
            }
          })
          .catch((error) => {
            console.error("Ha ocurrido un error:", error);
            hideLoader();
            Swal.fire({
              title: "Error",
              text: "No se pudo cambiar el precio",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
          });
      }
    });
  };

  const deleteAvailablePlace = (id) => {
    const tempData = availablePlaces?.results?.filter(
      (availablePlace) => availablePlace.id === id
    )[0];
    Swal.fire({
      title: "¿Está seguro de eliminar?",
      html: `La ciudad <b>${tempData.city}</b> del departamento <b>${tempData.state}</b> será eliminada`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        showLoader();
        configurationService.deleteAvailablePlace(id).then((response) => {
          if (response?.error || !response) {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la ciudad",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
            hideLoader();
            return;
          }
          if (response) {
            Swal.fire({
              title: "Confirmado!",
              html: `La ciudad <b>${tempData.city}</b> del departamento <b>${tempData.state}</b> ha sido eliminada`,
              icon: "success",
              confirmButtonColor: "#1c4b29",
            });
            getAvailablePlaces();
            hideLoader();
          }
        });
      }
    });
  };

  const submitParametersToWinForm = (data) => {
    const tempData = {
      date: data.date_pw,
      name: data.name_pw,
      number_hits: parseInt(data.nro_aciertos_pw),
      prize_value: parseInt(data.vlr_premio_pw),
    };
    Swal.fire({
      title: "¿Está seguro de agregar?",
      html: `El premio <b>${tempData.name}</b> con <b>${
        tempData.number_hits
      }</b> aciertos y valor de <b>${
        tempData.prize_value
      }</b> será habilitado a partir del <b>${tempData.date.split("T")[0]}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        showLoader();
        configurationService
          .postParametersToWin(tempData)
          .then((response) => {
            if (response?.error || !response) {
              Swal.fire({
                title: "Error",
                text: "No se pudo agregar el premio",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
              return;
            }
            if (response) {
              Swal.fire({
                title: "Confirmado!",
                html: `El premio <b>${tempData.name}</b> con <b>${tempData.number_hits}</b> aciertos y valor de <b>${tempData.prize_value}</b> ha sido habilitado`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              getParametersToWin();
              hideLoader();
            }
          })
          .catch((error) => {
            console.error("Ha ocurrido un error:", error);
            hideLoader();
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el premio",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
          });
      }
    });
  };

  const deleteParameterToWin = (parameterToWin) => {
    Swal.fire({
      title: "¿Está seguro de eliminar?",
      html: `El premio <b>${parameterToWin.name}</b> con <b>${parameterToWin.number_hits}</b> aciertos y valor de <b>${parameterToWin.prize_value}</b> será eliminado`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        showLoader();
        configurationService
          .deleteParametersToWin(parameterToWin.id)
          .then((response) => {
            if (response?.error || !response) {
              Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el premio",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
              return;
            }
            if (response) {
              Swal.fire({
                title: "Confirmado!",
                html: `El premio <b>${parameterToWin.name}</b> con <b>${parameterToWin.number_hits}</b> aciertos y valor de <b>${parameterToWin.prize_value}</b> ha sido eliminado`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              getParametersToWin();
              hideLoader();
            }
          })
          .catch((error) => {
            console.error("Ha ocurrido un error:", error);
            hideLoader();
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el premio",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
          });
      }
    });
  };

  useEffect(() => {
    getJSONColombia();
    getHistoricalPrices();
    getAvailablePlaces();
    getParametersToWin();
  }, []);

  return (
    <div>
      {/* <!-- sign-in begin --> */}
      <div className="sign-in default-column gap-20">
        <div
          className="default-row justify-center gap-10 lt-md-column"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div style={{ flex: 3 }} className="w100">
            <div className="poklotto-form default-card" style={{ padding: 0 }}>
              <h3 className="title">Precios</h3>
              <div className={`part-form ${editMode ? "edit-card" : ""}`}>
                <div className="default-column gap-10">
                  <form
                    onSubmit={handleSubmit(submitPricesForm)}
                    onReset={() => setEditMode(false)}
                  >
                    <div className="default-row gap-10 justify-space-between">
                      <div style={{ flex: 1 }} className="w100">
                        <label htmlFor="value" className="form-label">
                          Precio <span className="required">*</span>
                        </label>
                        <input
                          {...register("value")}
                          required
                          id="value"
                          type="number"
                          minLength={3}
                          min={0}
                          defaultValue={editMode ? priceToEdit.value : 0}
                          placeholder="Ej: 2000"
                        />
                      </div>
                      <div style={{ flex: 1 }} className="w100">
                        <label
                          htmlFor="seller_commission"
                          className="form-label"
                        >
                          Comisión vendedor <span className="required">*</span>
                        </label>
                        <input
                          {...register("seller_commission")}
                          required
                          id="seller_commission"
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          defaultValue={
                            editMode ? priceToEdit.seller_commission : 30
                          }
                          placeholder="Ej: 2000"
                        />
                      </div>
                      <div style={{ flex: 1 }} className="w100">
                        <label htmlFor="date" className="form-label">
                          Fecha <span className="required">*</span>
                        </label>
                        <div className="birth-date-element">
                          <input
                            {...register("date")}
                            required
                            type="datetime-local"
                            id="date"
                            defaultValue={editMode ? priceToEdit.date : ""}
                            placeholder="Ej: 19/05/98"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="default-row gap-10 justify-space-between">
                      {!editMode ? (
                        <div
                          style={{ flex: 1 }}
                          className="default-column justify-center w100"
                        >
                          <button type="submit" className="btn btn-primary">
                            <i className="fa-solid fa-add"></i>&nbsp;Agregar
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{ flex: 1 }}
                          className="default-row gap-10 justify-center w100"
                        >
                          <button type="reset" className="btn btn-secondary">
                            <i className="fa-solid fa-close"></i>&nbsp;Cancelar
                            modo edición
                          </button>
                          <button type="submit" className="btn btn-success">
                            <i className="fa-solid fa-arrows-rotate"></i>
                            &nbsp;Actualizar
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                  {historicalPrices?.results?.length > 0 && !editMode ? (
                    <div className="default-card default-column gap-10 align-center">
                      <h4 className="subtitle">Historial de precios</h4>
                      <table className="default-table table table-striped">
                        <thead>
                          <tr className="tr-head-table">
                            <th scope="col">Id</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Valor</th>
                            <th scope="col">Comisión vendedor</th>
                            <th scope="col"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicalPrices?.results?.map((historicalPrice) => (
                            <tr className="tr-table" key={historicalPrice.id}>
                              <th scope="row">
                                <b className="th-aux">Id:</b>
                                {`${historicalPrice.id}`}
                              </th>
                              <td>
                                <b className="td-aux">Fecha:</b>
                                {` ${historicalPrice.date}`}
                              </td>
                              <td>
                                <b className="td-aux">Valor:</b>
                                {` ${historicalPrice.value}`}
                              </td>
                              <td>
                                <b className="td-aux">Comisión vendedor:</b>
                                {` ${historicalPrice.seller_commission}%`}
                              </td>
                              <td className="td-actions-table">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => editPrice(historicalPrice)}
                                >
                                  <i className="fa-solid fa-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => deletePrice(historicalPrice)}
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
                          {historicalPrices?.previous ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                getHistoricalPrices(historicalPrices?.previous)
                              }
                            >
                              <i className="fa-solid fa-chevron-left"></i>
                            </button>
                          ) : (
                            ""
                          )}
                          {historicalPrices?.next ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                getHistoricalPrices(historicalPrices?.next)
                              }
                            >
                              <i className="fa-solid fa-chevron-right"></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ marginTop: "20px", marginBottom: "20px" }}
                      className="empty-div w100 default-card default-row justify-center align-center"
                    >
                      <b>
                        No hay información disponible, por favor agregue
                        información
                      </b>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 2 }} className="w100">
            <div className="poklotto-form default-card" style={{ padding: 0 }}>
              <h3 className="title">Ciudades</h3>
              <div className="part-form">
                <div className="default-column gap-10">
                  <form onSubmit={handleSubmit(submitAvailablesPlacesForm)}>
                    <div className="default-row gap-10 justify-space-between">
                      <div style={{ flex: 3 }} className="w100">
                        <label htmlFor="state" className="form-label">
                          Departamento <span className="required">*</span>
                        </label>
                        <select
                          {...register("state")}
                          id="state"
                          className="dropdown-toggle"
                          onChange={(e) => changeDepartament(e)}
                        >
                          <option value="">Seleccionar una opción</option>
                          {departaments?.map((departament) => (
                            <option key={departament.id} value={departament.id}>
                              {departament.departamento}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 3 }} className="w100">
                        <label htmlFor="city" className="form-label">
                          Ciudad <span className="required">*</span>
                        </label>
                        <select
                          {...register("city")}
                          id="city"
                          className="dropdown-toggle"
                          disabled={!isCitiesEnabled()}
                        >
                          <option value="">Seleccionar una opción</option>
                          {cities?.map((citie) => (
                            <option key={citie} value={citie}>
                              {citie}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="default-row gap-10 justify-space-between">
                      <div
                        style={{ flex: 1 }}
                        className="default-column justify-center w100"
                      >
                        <button type="submit" className="btn btn-primary">
                          <i className="fa-solid fa-add"></i>&nbsp;Agregar
                        </button>
                      </div>
                    </div>
                  </form>
                  {availablePlaces?.results?.length > 0 ? (
                    <div className="default-card default-column gap-10 align-center">
                      <h4 className="subtitle">Ciudades habilitadas</h4>
                      <table className="default-table table table-striped">
                        <thead>
                          <tr className="tr-head-table">
                            <th scope="col">Id</th>
                            <th scope="col">Departamento</th>
                            <th scope="col">Ciudad</th>
                            <th scope="col"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {availablePlaces?.results?.map((availablePlace) => (
                            <tr className="tr-table" key={availablePlace.id}>
                              <th scope="row">
                                <b className="th-aux">Id:</b>
                                {`${availablePlace.id}`}
                              </th>
                              <td>
                                <b className="td-aux">Departamento:</b>
                                {` ${availablePlace.state}`}
                              </td>
                              <td>
                                <b className="td-aux">Ciudad:</b>
                                {` ${availablePlace.city}`}
                              </td>
                              <td className="td-actions-table">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() =>
                                    deleteAvailablePlace(availablePlace.id)
                                  }
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
                          {availablePlaces?.previous ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                getAvailablePlaces(availablePlaces?.previous)
                              }
                            >
                              <i className="fa-solid fa-chevron-left"></i>
                            </button>
                          ) : (
                            ""
                          )}
                          {availablePlaces?.next ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                getAvailablePlaces(availablePlaces?.next)
                              }
                            >
                              <i className="fa-solid fa-chevron-right"></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ marginTop: "20px", marginBottom: "20px" }}
                      className="empty-div w100 default-card default-row justify-center align-center"
                    >
                      <b>
                        No hay información disponible, por favor agregue
                        información
                      </b>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="default-row justify-center gap-10 lt-md-column"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div style={{ flex: 3 }} className="w100">
            <div className="poklotto-form default-card" style={{ padding: 0 }}>
              <h3 className="title">Premios</h3>
              <div className={`part-form ${editMode ? "edit-card" : ""}`}>
                <div className="default-column gap-10">
                  <form onSubmit={handleSubmit(submitParametersToWinForm)}>
                    <div className="default-row gap-10 justify-space-between">
                      <div style={{ flex: 1 }} className="w100">
                        <label htmlFor="name_pw" className="form-label">
                          Nombre <span className="required">*</span>
                        </label>
                        <input
                          {...register("name_pw")}
                          required
                          id="name_pw"
                          type="text"
                          minLength={3}
                          placeholder="Ej: Premio mayor"
                        />
                      </div>
                      <div style={{ flex: 1 }} className="w100">
                        <label htmlFor="nro_aciertos_pw" className="form-label">
                          Nro. Aciertos <span className="required">*</span>
                        </label>
                        <input
                          {...register("nro_aciertos_pw")}
                          required
                          id="nro_aciertos_pw"
                          type="number"
                          min={0}
                          max={5}
                          placeholder="Ej: 4"
                        />
                      </div>
                      <div style={{ flex: 1 }} className="w100">
                        <label htmlFor="vlr_premio_pw" className="form-label">
                          Valor premio <span className="required">*</span>
                        </label>
                        <input
                          {...register("vlr_premio_pw")}
                          required
                          id="vlr_premio_pw"
                          type="number"
                          min={0}
                          placeholder="Ej: 20000000"
                        />
                      </div>
                      <div style={{ flex: 1 }} className="w100">
                        <label htmlFor="date_pw" className="form-label">
                          Fecha <span className="required">*</span>
                        </label>
                        <div className="birth-date-element">
                          <input
                            {...register("date_pw")}
                            required
                            type="datetime-local"
                            id="date_pw"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="default-row gap-10 justify-space-between">
                      <div
                        style={{ flex: 1 }}
                        className="default-column justify-center w100"
                      >
                        <button type="submit" className="btn btn-primary">
                          <i className="fa-solid fa-add"></i>&nbsp;Agregar
                        </button>
                      </div>
                    </div>
                  </form>
                  {parametersToWin?.results?.length > 0 ? (
                    <div className="default-card default-column gap-10 align-center">
                      <h4 className="subtitle">Historial de premios</h4>
                      <table className="default-table table table-striped">
                        <thead>
                          <tr className="tr-head-table">
                            <th scope="col">Id</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Nro. Aciertos</th>
                            <th scope="col">Valor premio</th>
                            <th scope="col">Fecha</th>
                            <th scope="col"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parametersToWin?.results?.map((parameterToWin) => (
                            <tr className="tr-table" key={parameterToWin.id}>
                              <th scope="row">
                                <b className="th-aux">Id:</b>
                                {`${parameterToWin.id}`}
                              </th>
                              <td>
                                <b className="td-aux">Nombre:</b>
                                {` ${parameterToWin.name}`}
                              </td>
                              <td>
                                <b className="td-aux">Nro. Aciertos:</b>
                                {` ${parameterToWin.number_hits}`}
                              </td>
                              <td>
                                <b className="td-aux">Valor premio:</b>
                                {` ${parameterToWin.prize_value}`}
                              </td>
                              <td>
                                <b className="td-aux">Fecha:</b>
                                {` ${parameterToWin.date}`}
                              </td>
                              <td className="td-actions-table">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() =>
                                    deleteParameterToWin(parameterToWin)
                                  }
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
                          {parametersToWin?.previous ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                getParametersToWin(parametersToWin?.previous)
                              }
                            >
                              <i className="fa-solid fa-chevron-left"></i>
                            </button>
                          ) : (
                            ""
                          )}
                          {parametersToWin?.next ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                getParametersToWin(parametersToWin?.next)
                              }
                            >
                              <i className="fa-solid fa-chevron-right"></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ marginTop: "20px", marginBottom: "20px" }}
                      className="empty-div w100 default-card default-row justify-center align-center"
                    >
                      <b>
                        No hay información disponible, por favor agregue
                        información
                      </b>
                    </div>
                  )}
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

export default Config;
