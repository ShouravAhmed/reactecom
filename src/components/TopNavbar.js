import '../assets/styles/TopNavbar.css'

import React from 'react';
import {useNavigate, useLocation } from 'react-router-dom';

import UserIcon from '../assets/images/user-icon.png';
import BrandLogo from '../assets/images/fabricraft-logo.png';

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const BackButton = () => {
  console.log('Back button loaded');
  const navigate = useNavigate();
  const location = useLocation();

  const isBackButtonVisible = (location.pathname !== '/');

  const goBack = () => {
    console.log('back button clicked');
    navigate(-1);
  };
  
  return (
    isBackButtonVisible &&  
    <div onClick={goBack}>
      <i className="fa fa-chevron-left top-navbar-back-button" aria-hidden="true"></i>
    </div>
  );
};

function TopNavbar() {
  const navigate = useNavigate();

  const {authData} = useContext(AuthContext); 
  const {userProfile} = authData;

  console.log("topnav loaded: user:", userProfile);
  
  return (
    <div>
      <div className="top-navbar">
        <div className="top-navbar-left">
          
          <BackButton />
          
          <div onClick={() => navigate('/')} className="top-navbar-icon-and-brand">
            <img src={BrandLogo} alt="brand" className="top-navbar-brand-icon"/>
            <span className="top-navbar-brand-name">
              <span className="bold">Fabri</span>
              <span className="light">Craft</span>
            </span>
          </div>
        </div>
        <div onClick={() => navigate((userProfile ? "/profile" : "/login"))} className="top-navbar-right">
          {
            userProfile ? (
              <span className="top-navbar-user-username">Hi, {userProfile.full_name ? userProfile.full_name.split(' ')[0].slice(0, 9) : 'User'}</span>
            ) : (
              <span className="top-navbar-login-button">Login</span>
            )
          }
          <img src={UserIcon} alt="User" className="top-navbar-user-icon"/>
        </div>
      </div>
      <div className='navbar-bottom'></div>
    </div>
  )
}

export default React.memo(TopNavbar);
