import React from "react";
import "./styles/style.css";
import "./styles/animate.css";
import "./styles/animate.min.css";
import "./styles/all.min.css";
import "./styles/owl.carrousel.min.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-bottom">
        <div className="default-row gap-10 justify-center">
          <div className="footer-bottom-content">
            <p className="copyright-text">
              copyright © 2023. all right reserved by
            </p>
          </div>
          <div className="footerLogo">
            <img src="./public/logoSvg/MegalotoMesa de trabajo 30.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
