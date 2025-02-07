// import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StaticsService } from "../services/StaticsService";
import { UserService } from "../services/UserService";
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import FormDate from "../components/FormDate";
import { useLoader } from "../context/Loader";
import Swal from "sweetalert2";

const userService = new UserService();
const staticsService = new StaticsService();

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [historicalStatics, setHistoricalStatics] = useState({});
  const [pieGraph, setPieGraph] = useState({});
  const [barGraph, setBarGraph] = useState({});
  const [historicalBarGraph, setHistoricalBarGraph] = useState({});
  const [ticketsWithDates, setTicketsWithDates] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [idReseller, setIdReseller] = useState(null);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  const pageSizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const changeTableSize = (event) => {
    getTicketsWithDateRangeAndTrader(
      fechaDesde,
      fechaHasta,
      null,
      null,
      event.target.value
    );
  };

  const fechaActualHora0 = () => {
    const fechaActual = new Date();
    fechaActual.setHours(0, 1, 1, 1);
    fechaActual.setHours(fechaActual.getHours() - 5);
    const formatoFecha = fechaActual.toISOString().slice(0, 19);
    setFechaDesde(formatoFecha);
    return formatoFecha;
  };

  const fechaActualHoraFin = () => {
    const fechaActual = new Date();
    fechaActual.setHours(23, 59, 59, 999);
    fechaActual.setHours(fechaActual.getHours() - 5);
    const formatoFecha = fechaActual.toISOString().slice(0, 19);
    setFechaHasta(formatoFecha);
    return formatoFecha;
  };

  const getBagdeClass = (status) => {
    switch (status) {
      case "sold":
        return "text-bg-primary";
      case "won":
        return "text-bg-success";
      case "canceled":
        return "text-bg-danger";
      default:
        return "text-bg-secondary";
    }
  };

  const getLoggedUserProfile = () => {
    // showLoader();
    userService
      .getLoggedUserInfo()
      .then((res) => {
        if (res) {
          const date_register = new Date(res.date_register);
          const day =
            date_register.getDate() < 10
              ? `0${date_register.getDate()}`
              : date_register.getDate();
          const month =
            parseInt(date_register.getMonth() + 1) < 10
              ? `0${parseInt(date_register.getMonth()) + 1}`
              : parseInt(date_register.getMonth() + 1);
          const year = date_register.getFullYear();
          res.date_register_formatted = `${day}/${month}/${year}`;

          setUserData(res);
          hideLoader();
          getTicketsWithDateRangeAndTrader(
            fechaActualHora0(),
            fechaActualHoraFin(),
            res.id
          );
          getTotalTicketsWithDateRangeAndTrader(
            fechaActualHora0(),
            fechaActualHoraFin(),
            res.id
          );
          getTicketsWithDateRangeByDayAndTrader(
            fechaActualHora0(),
            fechaActualHoraFin(),
            res.id
          );
        }
      })
      .catch((err) => {
        console.error("Ha ocurrido un error: ", err);
        hideLoader();
      });
  };

  const getLoggedUserStatics = () => {
    staticsService.getLoggedUserStatics().then((res) => {
      if (res) {
        setHistoricalStatics(res.results);
        setHistoricalBarGraphOptions(res.results);
      }
    });
  };

  const getResellerProfile = async (idReseller) => {
    userService.getUserInfo(idReseller).then((res) => {
      if (res) {
        const date_register = new Date(res.date_register);
        const day =
          date_register.getDate() < 10
            ? `0${date_register.getDate()}`
            : date_register.getDate();
        const month =
          parseInt(date_register.getMonth() + 1) < 10
            ? `0${parseInt(date_register.getMonth()) + 1}`
            : parseInt(date_register.getMonth() + 1);
        const year = date_register.getFullYear();
        res.date_register_formatted = `${day}/${month}/${year}`;

        setUserData(res);
        setIdReseller(res.id);
        getTicketsWithDateRangeAndTrader(
          fechaActualHora0(),
          fechaActualHoraFin(),
          res.id
        );
        getTotalTicketsWithDateRangeAndTrader(
          fechaActualHora0(),
          fechaActualHoraFin(),
          res.id
        );
        getTicketsWithDateRangeByDayAndTrader(
          fechaActualHora0(),
          fechaActualHoraFin(),
          res.id
        );
      }
    });
  };

  const getResellerStatics = async (idReseller) => {
    staticsService.getResellerStatics(idReseller).then((res) => {
      if (res) {
        setHistoricalBarGraphOptions(res.results);
        setHistoricalStatics(res.results);
      }
    });
  };

  const setPieGraphOptions = (datos) => {
    if (datos.sold <= 0 && datos.won <= 0 && datos.canceled <= 0) return;
    const data = {
      labels: ["Vendidos", "Ganadores", "Cancelados"],
      datasets: [
        {
          data: [datos.sold, datos.won, datos.canceled],
          backgroundColor: ["#1C4B29", "#88B24E", "#C6E4B8"],
          hoverBackgroundColor: ["#1C5c29", "#88BF4E", "#C6FAB8"],
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Total tickets vendidos",
        },
      },
    };
    setPieGraph({ data, options });
  };

  const setBarGraphOptions = (datos) => {
    const { mappedData, mappedLabels } = mapBarGraphData(datos);
    const data = {
      labels: mappedLabels,
      datasets: [
        {
          label: ["Total"],
          data: mappedData.total,
          backgroundColor: ["#333"],
          hoverBackgroundColor: ["#555"],
        },
        {
          label: "Vendidos",
          data: mappedData.sold,
          backgroundColor: ["#1C4B29"],
          hoverBackgroundColor: ["#1C5c29"],
        },
        {
          label: "Ganadores",
          data: mappedData.won,
          backgroundColor: ["#88B24E"],
          hoverBackgroundColor: ["#88BF4E"],
        },
        {
          label: "Cancelados",
          data: mappedData.canceled,
          backgroundColor: ["#C6E4B8"],
          hoverBackgroundColor: ["#C6FAB8"],
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Tickets vendidos por día",
        },
      },
    };
    setBarGraph({ data, options });
  };

  const setHistoricalBarGraphOptions = (datos) => {
    const data = {
      labels: [""],
      datasets: [
        {
          label: "Total",
          data: [datos.total],
          backgroundColor: ["#333"],
          hoverBackgroundColor: ["#555"],
        },
        {
          label: "Vendidos",
          data: [datos.sold],
          backgroundColor: ["#1C4B29"],
          hoverBackgroundColor: ["#1C5c29"],
        },
        {
          label: "Ganadores",
          data: [datos.won],
          backgroundColor: ["#88B24E"],
          hoverBackgroundColor: ["#88BF4E"],
        },
        {
          label: "Cancelados",
          data: [datos.canceled],
          backgroundColor: ["#C6E4B8"],
          hoverBackgroundColor: ["#C6FAB8"],
        },
      ],
    };

    const options = {
      responsive: true,
      width: 100,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Total historico",
        },
      },
    };
    setHistoricalBarGraph({ data, options });
  };

  useEffect(() => {
    // showLoader();
    const urlParams = new URLSearchParams(window.location.search);
    const idReseller = urlParams.get("idReseller");

    if (idReseller) {
      getResellerProfile(idReseller);
      getResellerStatics(idReseller);
    } else {
      getLoggedUserProfile();
      getLoggedUserStatics();
    }
  }, []); // Este efecto se ejecutará solo una vez al montar el componente

  const filterStatics = async (event) => {
    const fechaDesde = event.fechaDesde;
    setFechaDesde(fechaDesde);
    const fechaHasta = event.fechaHasta;
    setFechaHasta(fechaHasta);
    getTicketsWithDateRangeAndTrader(fechaDesde, fechaHasta);
    getTotalTicketsWithDateRangeAndTrader(fechaDesde, fechaHasta);
    getTicketsWithDateRangeByDayAndTrader(fechaDesde, fechaHasta);
  };

  const getTicketsWithDateRangeAndTrader = (
    fechaDesde,
    fechaHasta,
    id_trader = userData.id,
    urlSearch = null,
    pageSize = 10
  ) => {
    // showLoader();
    staticsService
      .getTicketsWithDateRangeAndTrader(
        id_trader,
        fechaDesde,
        fechaHasta,
        urlSearch,
        pageSize
      )
      .then((res) => {
        if (res?.results) {
          setTicketsWithDates(res);
          hideLoader();
        }
      })
      .catch((err) => {
        console.error("Ha ocurrido un error: ", err);
        hideLoader();
      });
  };

  const getTotalTicketsWithDateRangeAndTrader = (
    fechaDesde,
    fechaHasta,
    id_trader = userData.id
  ) => {
    // showLoader();
    staticsService
      .getTotalTicketsWithDateRangeAndTrader(id_trader, fechaDesde, fechaHasta)
      .then((res) => {
        if (res?.results) {
          setPieGraphOptions(res.results);
        }
        hideLoader();
      })
      .catch((err) => {
        console.error("Ha ocurrido un error: ", err);
        hideLoader();
      });
  };

  const getTicketsWithDateRangeByDayAndTrader = (
    fechaDesde,
    fechaHasta,
    id_trader = userData.id
  ) => {
    // showLoader();
    staticsService
      .getTicketsWithDateRangeByDayAndTrader(id_trader, fechaDesde, fechaHasta)
      .then((res) => {
        if (res?.results) {
          setBarGraphOptions(res.results);
          hideLoader();
        }
      })
      .catch((err) => {
        console.error("Ha ocurrido un error: ", err);
        hideLoader();
      });
  };

  const mapBarGraphData = (datos) => {
    let totalArray = [];
    let wonArray = [];
    let soldArray = [];
    let canceledArray = [];
    let mappedLabels = [];

    datos.forEach((dato) => {
      totalArray.push(dato.total);
      wonArray.push(dato.won);
      soldArray.push(dato.sold);
      canceledArray.push(dato.canceled);
      mappedLabels.push(dato.timestamps.toString().split("T")[0]);
    });

    let mappedData = {
      total: totalArray,
      won: wonArray,
      sold: soldArray,
      canceled: canceledArray,
    };

    return { mappedData, mappedLabels };
  };

  const showGraphs = () => {
    return (
      barGraph?.data && barGraph?.options && pieGraph?.data && pieGraph?.options
    );
  };

  const changePassword = () => {
    Swal.fire({
      title: "Cambiar contraseña",
      html: `<div class="default-column gap-10">
      <input required id="actual_password" type="password" class="swal2-input" placeholder="Digite la contraseña actual">
      <div class="hoz-divider"></div>
      <input required id="new_password" type="password" class="swal2-input" placeholder="Digite la nueva contraseña">
      <input required id="confirm_new_password" type="password" class="swal2-input" placeholder="Confirme la nueva contraseña">
      </div>`,
      icon: "warning",
      confirmButtonColor: "#1c4b29",
      confirmButtonText: "Cambiar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return new Promise(function (resolve) {
          resolve([
            document.getElementById("actual_password").value,
            document.getElementById("new_password").value,
            document.getElementById("confirm_new_password").value,
          ]);
        });
      },
    }).then(async (result) => {
      console.log(result);
      if (result.isConfirmed) {
        if (
          result.value[0] === "" ||
          result.value[1] === "" ||
          result.value[2] === ""
        ) {
          await Swal.fire({
            title: "Error",
            text: "Por favor complete todos los campos",
            icon: "error",
            confirmButtonColor: "#1c4b29",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            changePassword();
            return;
          });
        } else if (result.value[1] !== result.value[2]) {
          await Swal.fire({
            title: "Error",
            text: "Las contraseñas no coinciden",
            icon: "error",
            confirmButtonColor: "#1c4b29",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            changePassword();
            return;
          });
        } else if (result.value[1].length < 8 || result.value[2].length < 8) {
          await Swal.fire({
            title: "Error",
            text: "La contraseña debe tener mínimo 8 caracteres",
            icon: "error",
            confirmButtonColor: "#1c4b29",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            changePassword();
            return;
          });
        } else {
          // showLoader();
          const [currentPassword, newPassword] = result.value;
          userService
            .changePassword(currentPassword, newPassword)
            .then((res) => {
              if (res.status) {
                Swal.fire({
                  title: "Éxito",
                  text: "Contraseña cambiada exitosamente",
                  icon: "success",
                  confirmButtonColor: "#1c4b29",
                });
                hideLoader();
              } else {
                Swal.fire({
                  title: "Error",
                  text:
                    res.detail ??
                    "No se pudo cambiar la contraseña. Por favor, inténtelo nuevamente",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
                hideLoader();
              }
            })
            .catch((err) => {
              console.error("Ha ocurrido un error: ", err);
              Swal.fire({
                title: "Error",
                text:
                  err.response.data.detail ??
                  "No se pudo cambiar la contraseña. Por favor, inténtelo nuevamente",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
              hideLoader();
            });
        }
      }
    });
  };

  return (
    <div className="default-column">
      <div className="default-row lt-lg-column">
        <div style={{ flex: 1 }}>
          <img
            className="profile_img"
            src={userData.photo}
            alt="Imagen del vendedor"
          />
        </div>
        <div
          className="profile_info_section default-column gap-10"
          style={{ flex: 3 }}
        >
          <h2 className="profile_name">{`${userData?.first_name} ${userData?.last_name}`}</h2>
          <div className="hoz-divider"></div>
          {/* Info básica */}
          <div className="default-row gap-10 lt-md-column">
            <div className="default-column gap-5px" style={{ flex: 2 }}>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">CC:</div>
                <div className="w100 profile_item_content">
                  {userData?.id_number}
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">E-mail:</div>
                <div className="w100 profile_item_content">
                  {userData?.email}
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">Teléfono:</div>
                <div className="w100 profile_item_content">
                  {userData?.phone}
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">Ciudad:</div>
                <div className="w100 profile_item_content">
                  {userData?.place?.city}, {userData?.place?.state}
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">Fecha ingreso:</div>
                <div className="w100 profile_item_content">
                  {userData?.date_register_formatted}
                </div>
              </div>
            </div>
            <div className="default-column gap-5px" style={{ flex: 2 }}>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">Tickets vendidos:</div>
                <div className="w100 profile_item_content">
                  <span className="badge text-bg-primary">
                    {historicalStatics?.sold}
                  </span>
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">
                  Tickets ganadores:
                </div>
                <div className="w100 profile_item_content">
                  <span className="badge text-bg-success">
                    {historicalStatics?.won}
                  </span>
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">
                  Tickets cancelados:
                </div>
                <div className="w100 profile_item_content">
                  <span className="badge text-bg-danger">
                    {historicalStatics?.canceled}
                  </span>
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">Ventas:</div>
                <div className="w100 profile_item_content">
                  {historicalStatics?.total_money}
                </div>
              </div>
              <div className="default-row gap-10 justify-space-between">
                <div className="w100 profile_item_title">Ganancias:</div>
                <div className="w100 profile_item_content">
                  {historicalStatics?.earnings_trader}
                </div>
              </div>
            </div>
            <div
              className="default-column gap-10 justify-center"
              style={{ flex: 1 }}
            >
              <div className="w100">
                <Link
                  className="w100"
                  to={
                    idReseller
                      ? `/register?idReseller=${idReseller}`
                      : "/edit_profile"
                  }
                >
                  <button className="w100 btn btn-success">
                    Editar perfil
                  </button>
                </Link>
              </div>
              {idReseller ? (
                ""
              ) : (
                <div className="w100">
                  <button
                    className="w100 btn btn-warning"
                    onClick={() => changePassword()}
                  >
                    Cambiar contraseña
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="hoz-divider"></div>
          {/* Historical graph */}
          <div
            className="default-column gap-10 align-center justify-center"
            style={{ marginTop: "20px" }}
          >
            <FormDate formDates={filterStatics} />
            {!pieGraph?.data || !barGraph?.data ? (
              <div className="container empty-div w100 default-row justify-center align-center">
                <b>
                  No hay información disponible, por favor realice la consulta
                  de arriba
                </b>
              </div>
            ) : (
              ""
            )}
          </div>
          {showGraphs() ? (
            <div className="default-row gap-10 lt-lg-column">
              <div
                className="default-column gap-10"
                style={{ flex: 5, height: "100%" }}
              >
                {historicalBarGraph?.data && historicalBarGraph?.options ? (
                  <div className="w100" style={{ flex: 2, height: "100%" }}>
                    <Bar
                      height={100}
                      data={historicalBarGraph?.data}
                      options={historicalBarGraph?.options}
                    />
                  </div>
                ) : (
                  ""
                )}
                {barGraph?.data && barGraph?.options ? (
                  <div className="w100" style={{ flex: 2, height: "100%" }}>
                    <Bar
                      height={100}
                      data={barGraph.data}
                      options={barGraph.options}
                    />
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="vertical-divider"></div>
              {pieGraph?.data && pieGraph?.options ? (
                <div
                  className="w100 default-row align-center"
                  style={{ flex: 3, height: "100%" }}
                >
                  <Pie data={pieGraph.data} options={pieGraph.options} />
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="hoz-divider"></div>
      {/* Estadisticas */}
      <div
        className="default-column gap-10 align-center justify-center"
        style={{ marginTop: "20px" }}
      >
        {ticketsWithDates?.results?.length === 0 ? (
          <div className="container empty-div w100 default-row justify-center align-center">
            <b>
              No hay información disponible, por favor realice la consulta de
              arriba
            </b>
          </div>
        ) : (
          ""
        )}
        <div
          className="container w100 default-column gap-10 align-center justify-center"
          style={{ marginBottom: "25px" }}
        >
          {ticketsWithDates?.results?.length > 0 ? (
            <div className="w100 default-card default-column align-center">
              <table className="default-table table table-striped">
                <thead>
                  <tr className="tr-head-table">
                    <th scope="col">#</th>
                    <th scope="col">Código</th>
                    <th scope="col">Sorteo</th>
                    <th scope="col">Números</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsWithDates?.results?.map((ticket, index) => (
                    <tr className="tr-table" key={index}>
                      <th scope="row">
                        <b className="th-aux">#:</b>
                        {` ${index}`}
                      </th>
                      <td scope="row">
                        <b className="td-aux">ID:</b>
                        {` ${ticket.id}`}
                      </td>
                      <td>
                        <b className="td-aux">Sorteo:</b>
                        {` ${ticket.giveaway}`}
                      </td>
                      <td>
                        <b className="td-aux">Números:</b>
                        {` ${ticket.value?.replaceAll(",", " - ")}`}
                      </td>
                      <td>
                        <b className="td-aux">Fecha:</b>
                        {` ${ticket.time}`}
                      </td>
                      <td>
                        <b className="td-aux">Estado:</b>
                        <span
                          className={`badge ${getBagdeClass(
                            ticket.status_alias
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className="table-footer default-row justify-space-between gap-10"
                style={{ width: "100%", padding: "0px 10px" }}
              >
                <div className="table-footer-arrows gap-10">
                  {ticketsWithDates?.previous ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        getTicketsWithDateRangeAndTrader(
                          null,
                          null,
                          null,
                          ticketsWithDates?.previous
                        )
                      }
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                  ) : (
                    ""
                  )}
                  {ticketsWithDates?.next ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        getTicketsWithDateRangeAndTrader(
                          null,
                          null,
                          null,
                          ticketsWithDates?.next
                        )
                      }
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
                    de {ticketsWithDates?.count}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
