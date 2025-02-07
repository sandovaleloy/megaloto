import { useEffect, useState } from "react";
import FormDate from "../components/FormDate";
import Chart from "chart.js/auto";
import { StaticsService } from "../services/StaticsService";
import { Bar, Pie } from "react-chartjs-2";
import { useLoader } from "../context/Loader";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const staticsService = new StaticsService();

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [totalTicketsPieGraph, setTotalTicketsPieGraph] = useState(0);
  const [ticketsBarGraph, setTicketsBarGraph] = useState(0);
  const [ticketsByGiveAwayGraph, setTicketsByGiveAwayBarGraph] = useState(0);
  const [profits, setProfits] = useState(0);
  const [pathName] = useState(window.location.pathname);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
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

  const pageSizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const changeTableSize = (event) => {
    getTicketsWithDateRange(fechaDesde, fechaHasta, null, event.target.value);
    // TODO: Implementar paginación
  };

  const filterStatics = async (event) => {
    const fechaDesde = event.fechaDesde;
    setFechaDesde(fechaDesde);
    const fechaHasta = event.fechaHasta;
    setFechaHasta(fechaHasta);
    getTicketsWithDateRange(fechaDesde, fechaHasta);
    getTicketsWithDateRangeByDay(fechaDesde, fechaHasta);
    getTotalTicketsWithDateRange(fechaDesde, fechaHasta);
    getTicketsWithDateRangeByDayAndGiveAway(fechaDesde, fechaHasta);
    getTotalProfitsWithDateRange(fechaDesde, fechaHasta);
  };

  const getTicketsWithDateRange = (
    fechaDesde,
    fechaHasta,
    urlSearch = null,
    pageSize = 10
  ) => {
    // showLoader();
    const idTrader = localStorage.getItem("idTrader");
    if (idTrader && pathName === "/all_tickets")
      staticsService
        .getTicketsWithDateRangeAndTrader(
          idTrader,
          fechaDesde,
          fechaHasta,
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
    else
      staticsService
        .getTicketsWithDateRange(
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

  const getTicketsWithDateRangeByDay = (fechaDesde, fechaHasta) => {
    // showLoader();
    const idTrader = localStorage.getItem("idTrader");
    if (idTrader && pathName === "/all_tickets")
      staticsService
        .getTicketsWithDateRangeByDayAndTrader(idTrader, fechaDesde, fechaHasta)
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
    else
      staticsService
        .getTicketsWithDateRangeByDay(fechaDesde, fechaHasta)
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

  const getTotalTicketsWithDateRange = (fechaDesde, fechaHasta) => {
    // showLoader();
    const idTrader = localStorage.getItem("idTrader");
    if (idTrader && pathName === "/all_tickets")
      staticsService
        .getTotalTicketsWithDateRangeAndTrader(idTrader, fechaDesde, fechaHasta)
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
    else
      staticsService
        .getTotalTicketsWithDateRange(fechaDesde, fechaHasta)
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

  const getTicketsWithDateRangeByDayAndGiveAway = async (
    fechaDesde,
    fechaHasta
  ) => {
    // showLoader();
    const idTrader = localStorage.getItem("idTrader");
    if (idTrader && pathName === "/all_tickets")
      staticsService
        .getTicketsWithDateRangeByDayAndGiveAwayAndTrader(
          idTrader,
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
    else
      staticsService
        .getTicketsWithDateRangeByDayAndGiveAway(fechaDesde, fechaHasta)
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
          text: "Tickets vendidos por sorteo",
        },
      },
    };
    setTicketsByGiveAwayBarGraph({ data, options });
  };

  const getTotalProfitsWithDateRange = (fechaDesde, fechaHasta) => {
    // showLoader();
    const idTrader = localStorage.getItem("idTrader");
    if (idTrader)
      staticsService
        .getTotalProfitsWithDateRangeAndTrader(idTrader, fechaDesde, fechaHasta)
        .then((response) => {
          if (response.results) {
            setProfits(response.results);
            // hideLoader();
          }
        })
        .catch((error) => {
          console.error("Ha ocurrido un error: ", error);
          // hideLoader();
        });
    else
      staticsService
        .getTotalProfitsWithDateRange(fechaDesde, fechaHasta)
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

  useEffect(() => {
    getTicketsWithDateRange(fechaActualHora0(), fechaActualHoraFin());
    getTicketsWithDateRangeByDay(fechaActualHora0(), fechaActualHoraFin());
    getTotalTicketsWithDateRange(fechaActualHora0(), fechaActualHoraFin());
    getTicketsWithDateRangeByDayAndGiveAway(
      fechaActualHora0(),
      fechaActualHoraFin()
    );
    getTotalProfitsWithDateRange(fechaActualHora0(), fechaActualHoraFin());
  }, []);

  const showGraphs = () => {
    return totalTicketsPieGraph && ticketsBarGraph && ticketsByGiveAwayGraph;
  };

  const exportToExcel = () => {
    const { results } = tickets;
    const mappedData = results.map((ticket) => {
      return {
        Id: ticket.id,
        Números: ticket.value?.replaceAll(",", " - "),
        Fecha: ticket.time,
        Sorteo: ticket.giveaway,
        Vendedor: `${ticket.first_name_trade} ${ticket.last_name_trade}`,
        Precio: ticket.price,
        Estado: ticket.status,
        Premio: `${ticket.parameter_win_name ?? "No ganó"} ${
          ticket.parameter_win_prize_value
            ? " - " + ticket.parameter_win_prize_value
            : ""
        }`,
      };
    });

    // Crea un objeto de trabajo de Excel (workbook)
    const workbook = XLSX.utils.book_new();

    // Crea una hoja de trabajo (worksheet) a partir de los datos
    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    console.log(worksheet);

    // Agrega la hoja de trabajo al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "reporte_ventas.xlsx");
  };

  const exportToPDF = () => {
    const { results } = tickets;
    const mappedData = results.map((ticket) => {
      return {
        Id: ticket.id.toString(),
        Números: ticket.value?.replaceAll(",", " - "),
        Fecha: ticket.time,
        Sorteo: ticket.giveaway,
        Vendedor: `${ticket.first_name_trade} ${ticket.last_name_trade}`,
        Precio: ticket.price,
        Estado: ticket.status,
        Premio: `${ticket.parameter_win_name ?? "No ganó"} ${
          ticket.parameter_win_prize_value
            ? " - " + ticket.parameter_win_prize_value
            : ""
        }`,
      };
    });
    // const htmlElement = document.querySelector("#tickets_table");
    const pdfDoc = new jsPDF({
      orientation: "landscape", // Puedes especificar 'landscape' para orientación horizontal
      unit: "mm", // Puedes cambiar la unidad según tus necesidades
      format: "a4", // Puedes cambiar el formato según tus necesidades (a4, letter, etc.)
    });
    const tableOptions = {
      margin: { top: 10, left: 100, right: 10, bottom: 10 },
      styles: { overflow: "ellipsize" },
    };
    const columns = [
      "Id",
      "Números",
      "Fecha",
      "Sorteo",
      "Vendedor",
      "Precio",
      "Estado",
      "Premio",
    ];
    // Agrega la tabla al documento PDF
    pdfDoc.table(0, 0, mappedData, columns, tableOptions);

    // Guarda o descarga el archivo PDF
    pdfDoc.save("reporte_ventas.pdf");
  };

  return (
    <div className="default-column gap-20" style={{ marginTop: "10px" }}>
      <FormDate formDates={filterStatics} />
      <div className="container">
        <div
          className="default-card container default-column gap-10"
          style={{ padding: "10px" }}
        >
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
        <div id="tickets_table" className="container resellers-section">
          <h2 style={{ textAlign: "center" }}>Tickets vendidos últimos días</h2>
          <div className="default-row justify-end align-end gap-10">
            <button className="btn btn-success" onClick={() => exportToExcel()}>
              <i className="fa-solid fa-file-excel"></i>&nbsp; Descargar excel
            </button>
            <button className="btn btn-danger" onClick={() => exportToPDF()}>
              <i className="fa-solid fa-file-pdf"></i>&nbsp; Descargar pdf
            </button>
          </div>
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
                    onClick={() =>
                      getTicketsWithDateRange(null, null, tickets?.previous)
                    }
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
                    onClick={() =>
                      getTicketsWithDateRange(null, null, tickets?.next)
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

export default Dashboard;
