import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useLoader } from "../context/Loader";
import { TicketService } from "../services/Ticket"; // Asegúrate de importar el servicio correctamente
import "./styles/all.min.css";
import "./styles/animate.css";
import "./styles/animate.min.css";
import "./styles/owl.carrousel.min.css";
import "./styles/style.css";

const ticketService = new TicketService();

const LotterieBegin2 = () => {
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [isAutogen, setAutogen] = useState(false);
  const [ticketData, setTicketData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [idEditTicket, setIdEditTicket] = useState(null);

  const numerosDisponibles = Array.from({ length: 43 }, (_, i) => i + 1);

  const continueHandler = async () => {
    try {
      // Mostrar loader antes de la operación asíncrona

      const numeros = numerosSeleccionados.toString().replaceAll(",", " - ");
      const ticket = {
        value: numerosSeleccionados.toString(),
        is_autogen: isAutogen ? 1 : 0,
      };

      const result = await withReactContent(Swal).fire({
        title: isEditMode
          ? "¿Desea confirmar los nuevos números?"
          : "¿Desea confirmar los números?",
        text: numeros,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1c4b29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,
      });

      if (result.isConfirmed) {
        showLoader();
        // Paso 1: Crear el ticket (operación asíncrona)

        if (isEditMode) {
          ticketService
            .edit(idEditTicket, ticket)
            .then(async (ticketDataResponse) => {
              if (ticketDataResponse?.error) {
                // Manejar error al crear el ticket
                hideLoader();
                Swal.fire({
                  title: "Error!",
                  text:
                    ticketDataResponse?.response?.detail ??
                    "Ha ocurrido un error al editar el ticket",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
                return;
              }

              // Paso 2: Mostrar el mensaje de confirmación (operación asíncrona)
              await Swal.fire({
                title: "Confirmado!",
                html:
                  "<p>Se ha editado el ticket con los números <br/><b>" +
                  numeros +
                  "</b></p>ID: <b>" +
                  ticketDataResponse.id +
                  "</b> - Serial: <b>" +
                  ticketDataResponse.barcode +
                  "</b>",
                icon: "success",
                confirmButtonColor: "#1c4b29",
                confirmButtonText: "Imprimir ticket",
                allowOutsideClick: false,
                allowEscapeKey: false,
              });
              generatePDF(ticketDataResponse);
              // Limpiar números seleccionados después de la confirmación exitosa
              clearNumerosSeleccionados();
              hideLoader();
              setIsEditMode(false);
            })
            .catch((error) => {
              console.error("Ha ocurrido un error:", error);
              setIsEditMode(false);
              hideLoader();
              Swal.fire({
                title: "Error",
                text: "No se pudo editar el ticket",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
            });
        } else
          ticketService
            .add(ticket)
            .then(async (ticketDataResponse) => {
              if (ticketDataResponse?.error) {
                // Manejar error al crear el ticket
                hideLoader();
                Swal.fire({
                  title: "Error!",
                  text:
                    ticketDataResponse?.response?.detail ??
                    "Ha ocurrido un error al crear el ticket",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
                return;
              }

              // Paso 2: Mostrar el mensaje de confirmación (operación asíncrona)
              await Swal.fire({
                title: "Confirmado!",
                html:
                  "<p>Se ha creado el ticket con los números <br/><b>" +
                  numeros +
                  "</b></p>ID: <b>" +
                  ticketDataResponse.id +
                  "</b> - Serial: <b>" +
                  ticketDataResponse.barcode +
                  "</b>",
                icon: "success",
                confirmButtonColor: "#1c4b29",
                confirmButtonText: "Imprimir ticket",
                allowOutsideClick: false,
                allowEscapeKey: false,
              });
              generatePDF(ticketDataResponse);
              // Limpiar números seleccionados después de la confirmación exitosa
              clearNumerosSeleccionados();
              hideLoader();
            })
            .catch((error) => {
              console.error("Ha ocurrido un error:", error);
              hideLoader();
              Swal.fire({
                title: "Error",
                text: "No se pudo crear el ticket",
                icon: "error",
                confirmButtonColor: "#1c4b29",
              });
            });
      }
      // Ocultar loader después de que la operación asíncrona se completa (ya sea con éxito o no)
    } catch (error) {
      // Manejar errores aquí
      console.error("Error:", error);
      // Ocultar loader en caso de error
      hideLoader();
    }
  };

  const generatePDF = (ticketDataResponse) => {
    setTicketData(ticketDataResponse);
    JsBarcode("#ticket-barcode", ticketDataResponse.barcode);

    const htmlElement = document.querySelector("#para_imprimir");
    htmlElement.style.display = "block";
    htmlElement.style.zIndex = "-1";
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [303, 680],
      precision: 20,
    });
    doc.html(htmlElement, {
      async callback(doc) {
        htmlElement.style.display = "none";
        await doc.autoPrint();
        //This is a key for printing
        await doc.output("dataurlnewwindow", { filename: "ticket.pdf" });
      },
    });
  };

  const generarNumerosAleatorios = () => {
    // const { numerosSeleccionados } = state;

    if (numerosSeleccionados.length < 5) {
      const numerosDisponibles = Array.from({ length: 43 }, (_, i) => i + 1);
      const numerosFaltantes = 5 - numerosSeleccionados.length;
      const numerosAleatorios = [];

      while (numerosAleatorios.length < numerosFaltantes) {
        const indice = Math.floor(Math.random() * numerosDisponibles.length);
        const numeroAleatorio = numerosDisponibles.splice(indice, 1)[0];
        if (!numerosSeleccionados.includes(numeroAleatorio)) {
          numerosAleatorios.push(numeroAleatorio);
        }
      }

      setNumerosSeleccionados([...numerosSeleccionados, ...numerosAleatorios]);
    } else {
      const numerosDisponibles = Array.from({ length: 43 }, (_, i) => i + 1);
      const nuevosNumerosSeleccionados = [...numerosSeleccionados];
      for (let i = 0; i < 5; i++) {
        const indice = Math.floor(Math.random() * numerosDisponibles.length);
        const numeroAleatorio = numerosDisponibles.splice(indice, 1)[0];
        nuevosNumerosSeleccionados[i] = numeroAleatorio;
      }
      setAutogen(true);
      setNumerosSeleccionados(nuevosNumerosSeleccionados);
    }
  };

  const seleccionarNumero = (numero) => {
    if (numerosSeleccionados.includes(numero)) {
      // Si el número ya está seleccionado, lo eliminamos de la lista.
      setNumerosSeleccionados(numerosSeleccionados.filter((n) => n !== numero));
    } else if (numerosSeleccionados.length < 5) {
      // Si el número no está seleccionado y aún no hemos seleccionado 6 números, lo agregamos.
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
  };

  const clearNumerosSeleccionados = () => {
    setAutogen(false);
    setNumerosSeleccionados([]);
  };

  const handleCheckTicket = async () => {
    try {
      // Paso 1: Obtener el ID del ticket
      const { value: barcode } = await Swal.fire({
        title: "Ingrese el ID del Ticket a Editar",
        input: "text",
        inputPlaceholder: "ID del Ticket",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#1c4b29",
        cancelButtonColor: "#d33",
        inputValidator: (value) => {
          if (!value) {
            return "Debe ingresar un ID válido";
          }
        },
      });

      if (!barcode) {
        // El usuario canceló la operación
        return;
      }

      // Mostrar loader antes de la operación asíncrona
      showLoader();

      // Paso 2: Obtener la información actual del ticket (operación asíncrona)
      const currentTicket = await ticketService.getTicketByBarcode(barcode);

      if (currentTicket?.valid) {
        const htmlTextWinner = `El ticket con ID <b>${
          currentTicket.data.id
        }</b> y números <b>${currentTicket?.data?.value?.replaceAll(
          ",",
          " - "
        )}</b> ha sido <b>ganador</b> con un premio de <b>${
          currentTicket?.parameter_win?.name
        } - ${currentTicket?.parameter_win?.prize_value}</b>`;
        const htmlTextLooser = `El ticket con ID <b>${
          currentTicket.data.id
        }</b> y números <b>${currentTicket?.data?.value?.replaceAll(
          ",",
          " - "
        )}</b> ha sido <b>perdedor</b>`;
        Swal.fire({
          title: currentTicket?.parameter_win ? "GANADOR" : "PERDEDOR",
          icon: currentTicket?.parameter_win ? "success" : "error",
          html: currentTicket?.parameter_win ? htmlTextWinner : htmlTextLooser,
          confirmButtonColor: "#1c4b29",
          showConfirmButton: !!currentTicket?.parameter_win,
          confirmButtonText: "Reclamar premio",
        }).then((result) => {
          if (result.isConfirmed) {
            showLoader();
            ticketService
              .postClaimTicket(currentTicket?.data?.id)
              .then((response) => {
                hideLoader();
                if (response?.detail) {
                  Swal.fire({
                    title: "Error!",
                    text:
                      response?.detail ??
                      "Ha ocurrido un error al reclamar el premio",
                    icon: "error",
                    confirmButtonColor: "#1c4b29",
                  });
                } else if (response) {
                  Swal.fire({
                    title: "Confirmado!",
                    text: "El premio ha sido reclamado exitosamente",
                    icon: "success",
                    confirmButtonColor: "#1c4b29",
                  });
                }
              })
              .catch((error) => {
                hideLoader();
                console.error("Ha ocurrido un error al reclamar el premio", error);
                Swal.fire({
                  title: "Error!",
                  text: error?.response?.data?.detail ?? "Ha ocurrido un error al reclamar el premio",
                  icon: "error",
                  confirmButtonColor: "#1c4b29",
                });
              });
          }
        });
        hideLoader();
      } else {
        Swal.fire({
          title: "Error!",
          text: currentTicket?.detail ?? "El ticket ha consultar no existe",
          icon: "error",
          confirmButtonColor: "#1c4b29",
        });
        hideLoader();
      }
    } catch (error) {
      console.error("Error:", error);
      hideLoader();
    }
  };

  const handleEditTicket = async () => {
    try {
      // Paso 1: Obtener el ID del ticket
      const { value: barcode } = await Swal.fire({
        title: "Ingrese el ID del Ticket a Editar",
        input: "text",
        inputPlaceholder: "ID del Ticket",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#1c4b29",
        cancelButtonColor: "#d33",
        inputValidator: (value) => {
          if (!value) {
            return "Debe ingresar un ID válido";
          }
        },
      });

      if (!barcode) {
        // El usuario canceló la operación
        return;
      }

      // Mostrar loader antes de la operación asíncrona
      showLoader();

      // Paso 2: Obtener la información actual del ticket (operación asíncrona)
      const currentTicket = await ticketService.getTicketByBarcode(barcode);

      if (currentTicket?.valid) {
        setIsEditMode(true);
        setIdEditTicket(currentTicket.data.id);
        const numerosTmp = currentTicket.data.value
          .split(",")
          .map((n) => parseInt(n));
        setNumerosSeleccionados(numerosTmp);
        hideLoader();
      } else {
        Swal.fire({
          title: "Error!",
          text: currentTicket?.detail ?? "El ticket ha consultar no existe",
          icon: "error",
          confirmButtonColor: "#1c4b29",
        });
        hideLoader();
      }
    } catch (error) {
      console.error("Error:", error);
      hideLoader();
    }
  };

  const handleCancelTicket = async () => {
    // Paso 1: Obtener el ID del ticket
    const { value: barcode } = await Swal.fire({
      title: "Ingrese el ID del Ticket a Cancelar",
      input: "text",
      inputPlaceholder: "ID del Ticket",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1c4b29",
      cancelButtonColor: "#d33",
      inputValidator: (value) => {
        if (!value) {
          return "Debe ingresar un ID válido";
        }
      },
    });

    if (!barcode) {
      // El usuario canceló la operación
      return;
    }

    // Mostrar loader antes de la operación asíncrona
    showLoader();

    // Paso 2: Cancelar el ticket (operación asíncrona)
    ticketService
      .cancelTicket(barcode)
      .then((response) => {
        if (response?.status) {
          Swal.fire({
            title: "Confirmado!",
            text: "El ticket ha sido cancelado exitosamente",
            icon: "success",
            confirmButtonColor: "#1c4b29",
          });
          hideLoader();
        } else {
          Swal.fire({
            title: "Error!",
            text:
              response?.detail ?? "Ha ocurrido un error al cancelar el ticket",
            icon: "error",
            confirmButtonColor: "#1c4b29",
          });
          hideLoader();
        }
      })
      .catch((error) => {
        console.error("Ha ocurrido un error:", error);
        hideLoader();
        Swal.fire({
          title: "Error",
          text: "No se pudo cancelar el ticket",
          icon: "error",
          confirmButtonColor: "#1c4b29",
        });
      });
  };

  const cancelEditMode = () => {
    setTicketData({});
    setIsEditMode(false);
    clearNumerosSeleccionados();
  };

  return (
    <div className="lotteries">
      <div className="bg-shape-2">
        <img src="./bg-shape/bg-shape-2.png" alt="" />
      </div>
      <div className="bg-shape-1">
        <img src="./bg-shape/bg-shape-1.png" alt="" />
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="section-title"></div>
          </div>
        </div>
        <div className="part-picking-number">
          <div className="animation-body animated">
            {!isEditMode ? (
              <div className="picking-number-header">
                <div className="part-btn">
                  <button
                    href="lotteries.html"
                    className="btn-pok"
                    onClick={handleCheckTicket}
                  >
                    Consultar ticket
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
                <div className="part-btn">
                  <Link to="/all_tickets" type="button" className="nav-link">
                    <button href="lotteries.html" className="btn-pok-2">
                      Consultar ventas
                      <i className="fa-solid fa-angle-right"></i>
                    </button>
                  </Link>
                </div>
                <div className="part-btn">
                  <button
                    onClick={handleEditTicket}
                    href="lotteries.html"
                    className="btn-pok-2"
                  >
                    Editar ticket <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
                <div className="part-btn">
                  <button
                    onClick={handleCancelTicket}
                    href="lotteries.html"
                    className="btn-pok-2"
                  >
                    Cancelar ticket <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="picking-number-header">
                <h3 style={{ color: "white" }}>
                  <i className="fa-solid fa-pencil"></i> &nbsp;Modo edición
                </h3>
              </div>
            )}
            <div
              className={`picking-number-body ${isEditMode ? "edit-card" : ""}`}
            >
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-numbers"
                  role="tabpanel"
                  aria-labelledby="pills-numbers-tab"
                >
                  <div className="picking-number-palate">
                    <div className="number-box common">
                      {numerosDisponibles.map((numero) => (
                        <button
                          className={`single-number ${
                            numerosSeleccionados.includes(numero)
                              ? "selected"
                              : ""
                          }`}
                          key={numero}
                          onClick={() => seleccionarNumero(numero)}
                        >
                          {numero < 10 ? `0${numero}` : numero}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="picking-number-result">
                    <div className="part-title">
                      <h3 className="title">Números seleccionados:</h3>
                    </div>
                    <div className="result-number-palate">
                      {numerosSeleccionados.map((numero) => (
                        <button
                          className="single-number selected"
                          key={numero}
                          onClick={() => seleccionarNumero(numero)}
                        >
                          {numero < 10 ? `0${numero}` : numero}
                        </button>
                      ))}
                    </div>
                    <div className="picking-number-quick-buttons">
                      <button
                        className="clear-btn"
                        onClick={clearNumerosSeleccionados}
                      >
                        <i className="fa-solid fa-circle-xmark"></i> &nbsp;
                        Limpiar
                      </button>
                      <button
                        className="auto-select-btn"
                        onClick={generarNumerosAleatorios}
                      >
                        <i className="fa-solid fa-shuffle"></i> &nbsp;Automatico
                      </button>
                    </div>
                  </div>
                  {/* Inicio ticket */}
                  {ticketData ? (
                    <div id="para_imprimir">
                      <img
                        className="ticket_background"
                        src="data:image/png;base64,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"
                        alt=""
                      />
                      <div className="ticket_content">
                        <div className="logo_img">
                          <img
                            className="logo_ticket"
                            src="data:image/png;base64,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"
                            alt=""
                          />
                        </div>
                        <div
                          className="default-row justify-space-between"
                          style={{ width: "90%" }}
                        >
                          <div style={{ fontSize: "3mm", fontWeight: 500 }}>
                            Fecha venta: {ticketData?.time}
                          </div>
                          <div style={{ fontSize: "3mm", fontWeight: 500 }}>
                            Fecha sorteo: {ticketData?.date_to_giveaway}
                          </div>
                        </div>
                        <div className="number-section">
                          {ticketData?.value?.length > 0
                            ? ticketData?.value
                                .toString()
                                .split(",")
                                .map((numero, index) => (
                                  <div key={index} className="number-item">
                                    {numero}
                                  </div>
                                ))
                            : ""}
                        </div>
                        <div
                          className="default-row justify-space-between"
                          style={{ width: "90%" }}
                        >
                          <div style={{ fontSize: "3.5mm", fontWeight: 700 }}>
                            Ticket N°: {ticketData?.id_formatted}
                          </div>
                          <div style={{ fontSize: "3.5mm", fontWeight: 700 }}>
                            Valor: {ticketData?.value_ticket}
                          </div>
                        </div>
                        <div
                          className="default-row justify-center"
                          style={{ width: "90%" }}
                        >
                          <span style={{ fontWeight: "bold", fontSize: "4mm" }}>
                            PLAN DE PREMIOS
                          </span>
                        </div>
                        <div
                          className="default-column align-center"
                          style={{ width: "90%" }}
                        >
                          {ticketData?.parameters_win?.map(
                            (parameter, index) => (
                              <div
                                key={parameter.number_hits}
                                style={{
                                  fontWeight: index === 0 ? "bold" : "600",
                                  fontSize: "4mm",
                                }}
                              >
                                {parameter.number_hits} aciertos:{" "}
                                {parameter.prize_value}
                              </div>
                            )
                          )}
                        </div>
                        <div
                          className="default-column align-center terms-section"
                          style={{ width: "90%" }}
                        >
                          <div
                            style={{
                              fontStyle: "Italic",
                              textAlign: "center",
                              fontSize: "3.5mm",
                            }}
                          >
                            Recuerde que el premio solo será entregado al
                            portador del ticket
                          </div>
                          <div style={{ fontSize: "3.5mm" }}>
                            Si hay múltiples ganadores con 5 aciertos, el premio
                            se distribuirá equitativamente entre ellos
                          </div>
                          <div
                            style={{ fontSize: "3.5mm", textAlign: "justify" }}
                          >
                            Recuerda jugar <b>MEGALOTO</b> todos los{" "}
                            <b>MIÉRCOLES Y SÁBADO</b> para tener la oportunidad
                            de convertirte en un afortunado ganador
                          </div>
                        </div>
                        <div className="default-row justify-center align-center">
                          <img className="ticket-barcode" id="ticket-barcode" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {/* Fin ticket */}
                  <div
                    className={`picking-number-final-step ${
                      isEditMode ? "gap-10" : ""
                    }`}
                  >
                    {isEditMode ? (
                      <div className="part-btn">
                        <button
                          className="btn-pok-2"
                          onClick={() => cancelEditMode()}
                        >
                          <i className="fa-solid fa-close"></i> Salir del modo
                          edición
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="part-btn">
                      <button
                        disabled={numerosSeleccionados.length < 5}
                        className="btn-pok"
                        onClick={() => continueHandler()}
                      >
                        Continuar <i className="fa-solid fa-angle-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotterieBegin2;
