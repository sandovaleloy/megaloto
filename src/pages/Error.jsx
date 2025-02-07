import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div>
      {/* <!-- error begin --> */}
      <div className="error">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-7 col-xl-8 col-lg-9 col-md-10">
              <div className="part-img">
                <img src="../../public/errorImage/error-image.png" alt="" />
              </div>
              <div className="part-text">
                <div className="section-title">
                  <h3 className="sub-title">Error 404</h3>
                  <h2 className="title">
                    La página que estás buscando ya no está a nuestro alcance.
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- error end --> */}
    </div>
  );
};

export default Error;
