import React from "react";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Tickets vendidos hoy",
    },
  },
};

const data = {
  labels: ["Vendidos", "Ganadores", "Cancelados"],
  datasets: [
    {
      label: "Vendidos",
      data: [120, 190, 30],
      backgroundColor: ["#003603", "#57F000", "#700F00"],
    },
  ],
};

export const PieChart = () => {
  return (
    <div className="w100">
      <Pie data={data} options={options}/>
    </div>
  );
};
