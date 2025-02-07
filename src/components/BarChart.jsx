import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Tickets ",
    },
  },
};

const data = {
  labels: [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ],
  datasets: [
    {
      label: "Vendidos",
      data: [20, 45, 30, 32, 20, 30, 46],
      backgroundColor: ["#003603"],
    },
    {
      label: "Ganadores",
      data: [10, 21, 13, 5, 2, 3, 9],
      backgroundColor: ["#57F000"],
    },
    {
      label: "Cancelados",
      data: [15, 2, 1, 15, 22, 3, 4],
      backgroundColor: ["#700F00"],
    },
  ],
};
export const BarChart = () => {
  return (
    <div className="w100">
      <Bar data={data} options={options}/>
    </div>
  );
};
