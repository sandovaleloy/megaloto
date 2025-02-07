import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ path, routes }) => {
  const crumbs = path;

  return (
    <div
      className="container breadcrumbs2 justify-start"
      style={{ paddingTop: "20px" }}
    >
      {crumbs.map((crumb, index) => (
        <span key={index}>
          <Link className="breadcrumb_routes" to={routes[index]}>
            {crumb}
            {index < crumbs.length - 1 && <b> &gt; </b>}
          </Link>
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
