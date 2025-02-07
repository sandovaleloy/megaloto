import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { StaticsService } from "../services/StaticsService";
import { Bar, Pie } from "react-chartjs-2";
import { useLoader } from "../context/Loader";
import { GiveAwaysService } from "../services/GiveAways";

const staticsService = new StaticsService();
const giveawaysService = new GiveAwaysService();

const GiveawayResult = () => {
  const [giveaway, setGiveaway] = useState({});
  const [tickets, setTickets] = useState([]);
  const [totalTicketsPieGraph, setTotalTicketsPieGraph] = useState(0);
  const [ticketsBarGraph, setTicketsBarGraph] = useState(0);
  const [ticketsByGiveAwayGraph, setTicketsByGiveAwayBarGraph] = useState(0);
  const [profits, setProfits] = useState(0);
  const [pathName] = useState(window.location.pathname);
  const { showLoader, hideLoader } = useLoader();

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

  const pageSizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const changeTableSize = (event) => {
    getTicketsWithDateRange(
      giveaway.id,
      giveaway.date_from.slice(0, 19),
      giveaway.date_to.slice(0, 19),
      null,
      event.target.value
    );
  };

  const getTicketsWithDateRange = (
    idGiveaway,
    fechaDesde,
    fechaHasta,
    urlSearch = null,
    pageSize = 10
  ) => {
    showLoader();
    staticsService
      .getTicketsWithDateRangeAndGiveaway(
        idGiveaway,
        fechaDesde,
        fechaHasta,
        true,
        urlSearch,
        pageSize
      )
      .then((response) => {
        if (response) {
          setTickets(response);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error: ", error);
        hideLoader();
      });
  };

  const getTicketsWithDateRangeByGiveawayGroupByDay = (
    idGiveaway,
    fechaDesde,
    fechaHasta
  ) => {
    showLoader();
    staticsService
      .getTicketsWithDateRangeByGiveawayGroupByDay(
        idGiveaway,
        fechaDesde,
        fechaHasta
      )
      .then((response) => {
        if (response) {
          setTicketsBarGraphOptions(response.results);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error: ", error);
        hideLoader();
      });
  };

  const setTicketsBarGraphOptions = (tickets) => {
    const { mappedData, mappedLabels } = mapBarGraphData(tickets);
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
          text: "Tickets vendidos en el tiempo",
        },
      },
    };
    setTicketsBarGraph({ data, options });
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
      if (dato.timestamps)
        mappedLabels.push(dato.timestamps.toString().split("T")[0]);
      if (dato.first_name)
        mappedLabels.push(`${dato.first_name} ${dato.last_name}`);
      else if (dato.name) mappedLabels.push(dato.name);
    });

    let mappedData = {
      total: totalArray,
      won: wonArray,
      sold: soldArray,
      canceled: canceledArray,
    };

    return { mappedData, mappedLabels };
  };

  const getTotalTicketsWithDateRangeAndGiveaway = (fechaDesde, fechaHasta) => {
    showLoader();
    staticsService
      .getTotalTicketsWithDateRangeAndGiveaway(fechaDesde, fechaHasta)
      .then((response) => {
        if (response) {
          setTotalTicketsPieGraphOptions(response.results);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error: ", error);
        hideLoader();
      });
  };

  const setTotalTicketsPieGraphOptions = (totalTickets) => {
    if (
      totalTickets.sold <= 0 &&
      totalTickets.won <= 0 &&
      totalTickets.canceled <= 0
    )
      return;
    const data = {
      labels: ["Vendidos", "Ganadores", "Cancelados"],
      datasets: [
        {
          data: [totalTickets.sold, totalTickets.won, totalTickets.canceled],
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
    setTotalTicketsPieGraph({ data, options });
  };

  const getTicketsWithDateRangeByGiveAwayGroupByTrader = async (
    idGiveaway,
    fechaDesde,
    fechaHasta
  ) => {
    showLoader();
    staticsService
      .getTicketsWithDateRangeByGiveAwayGroupByTrader(
        idGiveaway,
        fechaDesde,
        fechaHasta
      )
      .then((response) => {
        if (response) {
          setTicketsByGiveAwayGraphOptions(response.results);
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error: ", error);
        hideLoader();
      });
  };

  const setTicketsByGiveAwayGraphOptions = (tickets) => {
    const { mappedData, mappedLabels } = mapBarGraphData(tickets);
    console.log("mappedData", mappedData);
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
          text: "Tickets vendidos por vendedor",
        },
      },
    };
    setTicketsByGiveAwayBarGraph({ data, options });
  };

  const getTotalProfitsWithDateRangeByGiveaway = (
    idGiveaway,
    fechaDesde,
    fechaHasta
  ) => {
    showLoader();
    staticsService
      .getTotalProfitsWithDateRangeByGiveaway(
        idGiveaway,
        fechaDesde,
        fechaHasta
      )
      .then((response) => {
        if (response.results) {
          hideLoader();
          setProfits(response.results);
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error: ", error);
        hideLoader();
      });
  };

  const getGiveawayDetail = (idGiveaway) => {
    showLoader();
    giveawaysService.getGiveAwayById(idGiveaway).then((response) => {
      if (response) {
        setGiveaway(response);
        hideLoader();
        getTicketsWithDateRange(
          idGiveaway,
          response.date_from.slice(0, 19),
          response.date_to.slice(0, 19)
        );
        getTicketsWithDateRangeByGiveawayGroupByDay(
          idGiveaway,
          response.date_from.slice(0, 19),
          response.date_to.slice(0, 19)
        );
        getTotalTicketsWithDateRangeAndGiveaway(
          idGiveaway,
          response.date_from.slice(0, 19),
          response.date_to.slice(0, 19)
        );
        getTicketsWithDateRangeByGiveAwayGroupByTrader(
          idGiveaway,
          response.date_from.slice(0, 19),
          response.date_to.slice(0, 19)
        );
        getTotalProfitsWithDateRangeByGiveaway(
          idGiveaway,
          response.date_from.slice(0, 19),
          response.date_to.slice(0, 19)
        );
      }
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idGiveaway = urlParams.get("idGiveaway");
    getGiveawayDetail(idGiveaway);
  }, []);

  const showGraphs = () => {
    return totalTicketsPieGraph && ticketsBarGraph && ticketsByGiveAwayGraph;
  };

  return (
    <div className="default-column gap-20" style={{ marginTop: "10px" }}>
      <div className="container">
        <div
          className="default-card default-column gap-10"
          style={{ padding: "10px" }}
        >
          <div className="default-column gap-10 justify-center align-center w100">
            <h2>{giveaway?.name ?? ""}</h2>
            <div className="default-row gap-10 w100">
              <div style={{ flex: 1 }}>
                <b>Código baloto:</b>
                {` ${giveaway?.code_lottery}`}
              </div>
              <div style={{ flex: 1 }}>
                <b>Resultado:</b>
                {` ${giveaway?.result?.replaceAll(",", " - ") ?? ""}`}
              </div>
              <div style={{ flex: 1 }}>
                <b>Fecha desde:</b>
                {` ${giveaway?.date_from?.slice(0, 19).split("T")[0]} ${
                  giveaway?.date_from?.slice(0, 19).split("T")[1]
                }`}
              </div>
              <div style={{ flex: 1 }}>
                <b>Fecha hasta:</b>
                {` ${giveaway?.date_to?.slice(0, 19).split("T")[0]} ${
                  giveaway?.date_to?.slice(0, 19).split("T")[1]
                }`}
              </div>
            </div>
          </div>
          <div className="hoz-divider"></div>
          <div className="default-row gap-10 lt-sm-column justify-space-between align-center">
            <div style={{ flex: 1 }}>
              <b>Total:</b>
              {` ${profits?.total ?? 0}`}
            </div>
            <div style={{ flex: 1 }}>
              <b>Vendidos:</b>
              {` ${profits?.sold ?? 0}`}
            </div>
            <div style={{ flex: 1 }}>
              <b>Ganadores:</b>
              {` ${profits?.won ?? 0}`}
            </div>
            <div style={{ flex: 1 }}>
              <b>Cancelados:</b>
              {` ${profits?.canceled ?? 0}`}
            </div>
          </div>
          <div className="default-row gap-10 lt-sm-column justify-space-between align-center">
            <div style={{ flex: 1 }}>
              <b>Ventas:</b>
              {` ${profits?.total_money ?? 0}`}
            </div>
            <div style={{ flex: 1 }}>
              <b>Ganancias:</b>
              {` ${profits?.earnings_business ?? 0}`}
            </div>
            <div style={{ flex: 1 }}>
              <b>Comisión vendedores:</b>
              {` ${profits?.earnings_trader ?? 0}`}
            </div>
            <div style={{ flex: 1 }}>
              <b>Premios entregados:</b>
              {` ${profits?.prizes_awarded ?? 0}`}
            </div>
          </div>
        </div>
      </div>
      {/* Graficas */}
      {showGraphs() ? (
        <div className="container dashboard-section">
          <div className="default-row justify-center">
            <div className="default-card w100">
              <div
                className="default-row gap-20 align-center lt-md-column"
                style={{ height: "100%" }}
              >
                <div className="chart pie-chart">
                  <Pie
                    data={totalTicketsPieGraph.data}
                    options={totalTicketsPieGraph.options}
                  />
                </div>
                <div className="vertical-divider"></div>
                <div className="default-column gap-10 w100">
                  <div className="chart bar-chart">
                    <Bar
                      data={ticketsBarGraph.data}
                      options={ticketsBarGraph.options}
                    />
                  </div>
                  <div className="chart bar-chart">
                    <Bar
                      data={ticketsByGiveAwayGraph.data}
                      options={ticketsByGiveAwayGraph.options}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ marginTop: "20px", marginBottom: "20px" }}
          className="container empty-div w100 default-card default-row justify-center align-center"
        >
          <b>
            No hay información disponible, por favor realice la consulta de
            arriba
          </b>
        </div>
      )}

      {/* Graficas end */}
      {/* Tabla begin */}
      {tickets?.results?.length > 0 ? (
        <div className="container resellers-section">
          <h2 style={{ textAlign: "center" }}>Tickets vendidos</h2>
          <div className="default-card row justify-content-center">
            <table className="default-table table table-striped">
              <thead>
                <tr className="tr-head-table">
                  <th scope="col">Id</th>
                  <th scope="col">Números</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Sorteo</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Premio</th>
                </tr>
              </thead>
              <tbody>
                {tickets?.results?.map((ticket) => (
                  <tr className="tr-table" key={ticket.id}>
                    <th scope="row">
                      <b className="th-aux">Id:</b>
                      {` ${ticket.id}`}
                    </th>
                    <td scope="row">
                      <b className="th-aux">Números:</b>
                      {` ${ticket.value?.replaceAll(",", " - ")}`}
                    </td>
                    <td scope="row">
                      <b className="th-aux">Fecha:</b>
                      {` ${ticket.time}`}
                    </td>
                    <td>
                      <b className="td-aux">Sorteo:</b>
                      {` ${ticket.giveaway}`}
                    </td>
                    <td>
                      <b className="td-aux">Vendedor:</b>
                      {` ${ticket.first_name_trade} ${ticket.last_name_trade}`}
                    </td>
                    <td>
                      <b className="td-aux">Precio:</b>
                      {` ${ticket.price}`}
                    </td>
                    <td>
                      <b className="td-aux">Estado:</b>&nbsp;
                      <span
                        className={`badge ${getBagdeClass(
                          ticket.status_alias
                        )}`}
                      >
                        {` ${ticket.status}`}
                      </span>
                    </td>
                    <td>
                      <b className="td-aux">Premio:</b>
                      {` ${ticket.parameter_win_name ?? "No ganó"}${
                        ticket.parameter_win_prize_value
                          ? "-" + ticket.parameter_win_prize_value
                          : ""
                      }`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer default-row justify-space-between gap-10">
              <div className="table-footer-arrows gap-10">
                {tickets?.previous ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => getTicketsWithDateRange(tickets?.previous)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                ) : (
                  ""
                )}
                {tickets?.next ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => getTicketsWithDateRange(tickets?.next)}
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
                  de {tickets?.count}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {/* Tabla end */}
    </div>
  );
};

export default GiveawayResult;
