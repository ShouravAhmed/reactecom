import React from 'react';
import '../assets/styles/SplashScreen.css';


function SplashScreen({ logo }) {
    return (
    <div className="splash-screen">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        {logo ? <div className="slogan">
          Crafting Satisfaction In Every Stitch
        </div> : ""}
      </div>
    </div>
  );
}

export default SplashScreen;
