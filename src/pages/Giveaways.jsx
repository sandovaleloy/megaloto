import { GiveAwaysService } from "../services/GiveAways";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useLoader } from "../context/Loader";
import { Link } from "react-router-dom";

const giveawaysService = new GiveAwaysService();

const Giveaways = () => {
  const { showLoader, hideLoader } = useLoader();

  const [giveaways, setGiveaways] = useState([]);
  const { register, handleSubmit } = useForm();

  const pageSizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const changeTableSize = (event) => {
    getGiveAways(null, event.target.value);
  };

  const getBagdeClass = (status) => {
    switch (status) {
      case "to_start":
        return "text-bg-primary";
      case "in_progress":
        return "text-bg-success";
      case "canceled":
        return "text-bg-danger";
      case "finished":
        return "text-bg-secondary";
      default:
        return "text-bg-primary";
    }
  };

  const getGiveAways = async (urlSearch = null, pageSize = 10) => {
    // showLoader();
    giveawaysService.getGiveAways(urlSearch, pageSize).then((response) => {
      setGiveaways(response);
      hideLoader();
    });
  };

  const submit = (data) => {
    const dateFrom = new Date(data.date_from);
    const dateFromFormatted = `${dateFrom.getDate()}/${dateFrom.getMonth()}/${dateFrom.getFullYear()} - ${dateFrom.getHours()}:${dateFrom.getMinutes()}`;
    const dateTo = new Date(data.date_to);
    const dateToFormatted = `${dateTo.getDate()}/${dateTo.getMonth()}/${dateTo.getFullYear()} - ${dateTo.getHours()}:${dateTo.getMinutes()}`;
    Swal.fire({
      title: `¿Está seguro de crear el sorteo?`,
      html: `<div class="default-column gap-10">
          <div><b>Nombre interno:</b> ${data?.name}</div>
          <div><b>Código baloto:</b> ${data?.code_lottery}</div>
          <div><b>Fecha desde:</b> ${dateFromFormatted}</div>
          <div><b>Fecha hasta:</b> ${dateToFormatted}</div>
      </div>`,
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
        giveawaysService
          .postGiveAway(data)
          .then((response) => {
            if (response?.error || !response) {
              Swal.fire({
                title: "Error",
                text: "No se pudo agregar el sorteo",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
              return;
            }
            if (response) {
              Swal.fire({
                title: "Confirmado!",
                html: `El sorteo <b>${data?.name}</b> desde <b>${dateFromFormatted}</b> hasta <b>${dateToFormatted}</b> ha sido creado exitosamente.`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              getGiveAways();
              hideLoader();
            }
          })
          .catch((error) => {
            console.error("Ha ocurrido un error:", error);
            hideLoader();
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el sorteo",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
          });
      }
    });
  };

  const deleteGiveaway = (giveaway) => {
    Swal.fire({
      title: `¿Está seguro de cancelar el sorteo ${giveaway.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Confirmar",
      html: `<div class="default-column gap-10">
          <div><b>Nombre interno:</b> ${giveaway?.name}</div>
          <div><b>Código baloto:</b> ${giveaway?.code_lottery}</div>
          <div><b>Fecha desde:</b> ${giveaway?.date_from}</div>
          <div><b>Fecha hasta:</b> ${giveaway?.date_to}</div>
          </div>`,
    }).then((result) => {
      if (result.isConfirmed) {
        showLoader();
        giveawaysService
          .deleteGiveAway(giveaway.id)
          .then((response) => {
            if (response.status) {
              hideLoader();
              Swal.fire({
                title: "Confirmado!",
                html: `El sorteo <b>${giveaway.name}</b> desde <b>${giveaway.date_from}</b> hasta <b>${giveaway.date_to}</b> ha sido cancelado exitosamente.`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              getGiveAways();
            } else {
              hideLoader();
              Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el sorteo",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
            }
          })
          .catch((error) => {
            console.error("Ha ocurrido un error:", error);
            hideLoader();
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el sorteo",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
          });
      }
    });
  };

  const addResultGiveaway = (giveaway) => {
    showLoader();
    giveawaysService.getScrappingResult(giveaway.id).then((response) => {
      if (response) {
        console.log(response);
        hideLoader();
        Swal.fire({
          title: "Resultado obtenido",
          html: `El resultado del sorteo <b>${giveaway.name}</b> desde <b>${
            giveaway.date_from
          }</b> hasta <b>${giveaway.date_to}</b> ha sido obtenido exitosamente.
          <br/>
          <strong>${response.result.replaceAll(",", " - ")}</strong>
          <br/>
          <a href="${response?.url}" target="_blank">Verificar resultado</a>
          `,
          icon: "warning",
          confirmButtonColor: "#1c4b29",
          confirmButtonText: "Confirmar",
          showCancelButton: true,
          cancelButtonColor: "#d33",
          cancelButtonText: "Cancelar",
          showDenyButton: true,
          denyButtonColor: "#ffca2c",
          denyButtonText: "Ingresar manualmente",
        }).then((resultado) => {
          if (resultado.isConfirmed) {
            showLoader();
            const data = {
              result: response.result,
            };
            const response2 = giveawaysService.addGiveawayResult(
              giveaway.id,
              data
            );
            Swal.fire({
              title: "Se está procesando la información",
              html: "Por favor espere un momento mientras se procesa la información",
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false,
              showConfirmButton: false,
            });
            response2
              .then((response2) => {
                if (response2) {
                  hideLoader();
                  Swal.fire({
                    title: "Confirmado!",
                    html: `El sorteo <b>${giveaway.name}</b> desde <b>${giveaway.date_from}</b> hasta <b>${giveaway.date_to}</b> ha sido finalizado exitosamente.`,
                    icon: "success",
                    confirmButtonColor: "#1c4b29",
                  });
                  getGiveAways();
                } else {
                  hideLoader();
                  Swal.fire({
                    title: "Error",
                    text: "No se pudo finalizar el sorteo",
                    icon: "error",
                    confirmButtonColor: "#1c4b29",
                  });
                }
              })
              .catch((error) => {
                console.error("Ha ocurrido un error:", error);
                hideLoader();
                Swal.fire({
                  title: "Error",
                  text: "No se pudo finalizar el sorteo",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
              });
          } else if (resultado.isDenied) {
            addResultGiveawayManual(giveaway);
          }
        });
      }
    });
  };

  const addResultGiveawayManual = (giveaway) => {
    Swal.fire({
      title: `¿Está seguro de agregar los resultados del sorteo ${giveaway.name}?`,
      icon: "warning",
      html: `<div class="default-column gap-10">
      <input id="result_1" type="number" min="0" max="43" class="swal2-input" placeholder="Número 1"/>
      <input id="result_2" type="number" min="0" max="43" class="swal2-input" placeholder="Número 2"/>
      <input id="result_3" type="number" min="0" max="43" class="swal2-input" placeholder="Número 3"/>
      <input id="result_4" type="number" min="0" max="43" class="swal2-input" placeholder="Número 4"/>
      <input id="result_5" type="number" min="0" max="43" class="swal2-input" placeholder="Número 5"/>
      </div>`,
      showCancelButton: true,
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      preConfirm: () => {
        return new Promise(function (resolve) {
          resolve([
            document.getElementById("result_1").value,
            document.getElementById("result_2").value,
            document.getElementById("result_3").value,
            document.getElementById("result_4").value,
            document.getElementById("result_5").value,
          ]);
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const value = result.value;
        if (
          value.some((x) => x === "") ||
          value.some((x) => x === null) ||
          value.some((x) => x === undefined) ||
          value.some((x) => x < 0) ||
          value.some((x) => x > 43)
        ) {
          Swal.fire({
            title: "Error",
            text: "Debe ingresar un resultado válido",
            icon: "error",
            confirmButtonColor: "#1c4b29",
          }).then((res2) => {
            if (res2.isConfirmed) {
              addResultGiveaway(giveaway);
            }
          });
          return;
        }
        showLoader();
        const data = {
          result: value.join(","),
        };
        const response = giveawaysService.addGiveawayResult(giveaway.id, data);
        Swal.fire({
          title: "Se está procesando la información",
          html: "Por favor espere un momento mientras se procesa la información",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          showConfirmButton: false,
        });
        response
          .then((response) => {
            if (response) {
              hideLoader();
              Swal.fire({
                title: "Confirmado!",
                html: `El sorteo <b>${giveaway.name}</b> desde <b>${giveaway.date_from}</b> hasta <b>${giveaway.date_to}</b> ha sido finalizado exitosamente.`,
                icon: "success",
                confirmButtonColor: "#1c4b29",
              });
              getGiveAways();
            } else {
              hideLoader();
              Swal.fire({
                title: "Error",
                text: "No se pudo finalizar el sorteo",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
            }
          })
          .catch((error) => {
            console.error("Ha ocurrido un error:", error);
            hideLoader();
            Swal.fire({
              title: "Error",
              text: "No se pudo finalizar el sorteo",
              icon: "error",
              confirmButtonColor: "#1c4b29",
            });
          });
      }
    });
  };

  useEffect(() => {
    getGiveAways();
  }, []);

  return (
    <div>
      {/* <!-- resellers-section begin --> */}
      <div className="resellers-section">
        <div className={`poklotto-form default-card`} style={{ padding: 0 }}>
          <div className="container part-form default-column gap-20">
            <form onSubmit={handleSubmit(submit)}>
              <div className="default-row lt-lg-column gap-10 justify-space-between">
                <div
                  style={{ flex: 4 }}
                  className="default-row lt-sm-column gap-10 justify-space-between"
                >
                  <div style={{ flex: 2 }} className="w100">
                    <label htmlFor="name" className="form-label">
                      Nombre interno <span className="required">*</span>
                    </label>
                    <input
                      {...register("name")}
                      required
                      minLength={3}
                      type="text"
                      id="name"
                      placeholder="Ej: SORTEO-123"
                    />
                  </div>
                  <div style={{ flex: 2 }} className="w100">
                    <label htmlFor="code_lottery" className="form-label">
                      Código baloto <span className="required">*</span>
                    </label>
                    <input
                      {...register("code_lottery")}
                      required
                      minLength={3}
                      min={0}
                      type="number"
                      id="code_lottery"
                      placeholder="Ej: BALOTO-123"
                    />
                  </div>
                </div>
                <div
                  style={{ flex: 4 }}
                  className="default-row lt-sm-column gap-10 justify-space-between"
                >
                  <div style={{ flex: 2 }} className="w100">
                    <label htmlFor="date_from" className="form-label">
                      Fecha desde <span className="required">*</span>
                    </label>
                    <div className="birth-date-element">
                      <input
                        {...register("date_from")}
                        required
                        type="datetime-local"
                        id="date_from"
                        placeholder="Ej: 19/05/98"
                      />
                    </div>
                  </div>
                  <div style={{ flex: 2 }} className="w100">
                    <label htmlFor="date_to" className="form-label">
                      Fecha hasta <span className="required">*</span>
                    </label>
                    <div className="birth-date-element">
                      <input
                        {...register("date_to")}
                        required
                        type="datetime-local"
                        id="date_to"
                        placeholder="Ej: 19/05/98"
                      />
                    </div>
                  </div>
                </div>
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
            {giveaways?.results?.length > 0 ? (
              <div className="default-card row justify-content-center">
                <table className="default-table table table-striped">
                  <thead>
                    <tr className="tr-head-table">
                      <th scope="col">Código</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Código Baloto</th>
                      <th scope="col">Resultado</th>
                      <th scope="col">Fecha desde</th>
                      <th scope="col">Fecha hasta</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Tickets vendidos</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {giveaways?.results?.map((giveaway) => (
                      <tr className="tr-table" key={giveaway.id}>
                        <th scope="row">
                          <b className="th-aux">Código:</b>
                          {` ${giveaway.id}`}
                        </th>
                        <td>
                          <b className="td-aux">Nombre:</b>&nbsp;
                          {` ${giveaway.name}`}
                        </td>
                        <td>
                          <b className="td-aux">Código Baloto:</b>&nbsp;
                          {` ${giveaway.code_lottery}`}
                        </td>
                        <td>
                          <b className="td-aux">Resultado:</b>&nbsp;
                          {` ${
                            giveaway?.result?.replaceAll(",", " - ") ??
                            "No disponible"
                          }`}
                        </td>
                        <td>
                          <b className="td-aux">Fecha desde:</b>&nbsp;
                          {` ${giveaway.date_from}`}
                        </td>
                        <td>
                          <b className="td-aux">Fecha hasta:</b>&nbsp;
                          {` ${giveaway.date_to}`}
                        </td>
                        <td>
                          <b className="td-aux">Estado:</b>&nbsp;
                          <span
                            className={`badge ${getBagdeClass(
                              giveaway.status_alias
                            )}`}
                          >
                            {` ${giveaway.status}`}
                          </span>
                        </td>
                        <td>
                          <b className="td-aux">Tickets vendidos:</b>&nbsp;
                          {` ${giveaway.sold_tickets}`}
                        </td>
                        <td className="td-actions-table">
                          <Link
                            to={`/giveaway_results?idGiveaway=${giveaway.id}`}
                          >
                            <button type="button" className="btn btn-success">
                              <i className="fa-solid fa-eye"></i>
                            </button>
                          </Link>
                          {giveaway.status_alias === "to_start" ? (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => deleteGiveaway(giveaway)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          ) : (
                            ""
                          )}
                          {giveaway.status_alias === "in_progress" ||
                          (giveaway.status_alias === "finished" &&
                            !giveaway.result) ? (
                            <button
                              type="button"
                              className="btn btn-warning"
                              onClick={() => addResultGiveaway(giveaway)}
                            >
                              <i className="fa-solid fa-circle-dollar-to-slot"></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="table-footer default-row justify-space-between gap-10">
                  <div className="table-footer-arrows gap-10">
                    {giveaways?.previous ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => getGiveAways(giveaways?.previous)}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                    ) : (
                      ""
                    )}
                    {giveaways?.next ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => getGiveAways(giveaways?.next)}
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
                      de {giveaways?.count}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{ marginTop: "20px", marginBottom: "20px" }}
                className="container empty-div w100 default-card default-row justify-center align-center"
              >
                <b>
                  No hay información disponible, por favor agregue información
                </b>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <!-- resellers-section end --> */}
    </div>
  );
};

export default Giveaways;
