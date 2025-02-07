import React from "react";
import "./styles/animate.css";
import "./styles/all.min.css";
import "./styles/animate.min.css";
import "./styles/owl.carrousel.min.css";
import "./styles/style.css";

const BannerBegin = () => {
  return (
    <div>
      <div className="banner">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-6">
              <div className="banner-content">
                <h1 className="title">
                  Bienvenido a <span className="special">Megaloto</span>
                </h1>
                <h4 className="sub-title">Seleccione los números a continuación</h4>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-8 col-sm-9 d-xl-flex d-lg-flex d-block align-items-end">
              <div className="part-img">
                <img
                  className="main-img"
                  src="./navbar/banner-img.png"
                  alt=""
                />
                <img
                  src="./navbar/power-ball.png"
                  alt=""
                  className="power-ball pok-1"
                />
                <img
                  src="./navbar/power-ball2.png"
                  alt=""
                  className="power-ball pok-2"
                />
                <img
                  src="./navbar/power-ball3.png"
                  alt=""
                  className="power-ball pok-3"
                />
                <img
                  src="./navbar/power-ball4.png"
                  alt=""
                  className="power-ball pok-4"
                />
                <img
                  src="./navbar/power-ball5.png"
                  alt=""
                  className="power-ball pok-5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerBegin;
