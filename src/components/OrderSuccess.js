import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { useQuery } from 'react-query';
import Axios from 'axios';

import { Image } from "./Image";

import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function OrderSuccess() {            
  const navigate = useNavigate();

  const { state } = useLocation();
  
  const { authData } = useContext(AuthContext);
  const { showToast, getAccessToken } = authData;

  const UsersOrders = useQuery(`users-orders`, async () => {
    try{
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      return axiosInstance.get('order', config);
    }
    catch(e) {
      return {'data':[]};
    }
  }, { 
    staleTime: (5) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });

  if(!state) {
    navigate('/cart');
  }

  useEffect(() => {
    if(state) {
      UsersOrders.refetch();
    }
  }, []);

  console.log("Order success page loaded.", state);

  return (
    <div className="cart-page-container">

      <div className="success-order-confirmation-container">
        <div className="success-order-status">
            <span className="success-order-icon">
                <i class="fa fa-check" aria-hidden="true"></i>  
            </span>
            <h2 className="success-order-h2">Thank you</h2>
            <p className="success-order-p">Thank you so much for your purchase. You will soon be notified when we process your order.</p>
        </div>

        <div className="success-order-details">
          <h3>Order details</h3>
          <ul>
            <li className="success-order-item">
              <strong>Order ID:</strong>
              <span className="success-order-value">
                <i class="fa fa-copy" aria-hidden="true" style={{marginRight: "5px", cursor: "pointer"}} onClick={() => {
                  navigator.clipboard.writeText(state ? state.order_id : "");
                  showToast("Order ID copied!");
                }}></i>
                {state ? state.order_id : ""}
              </span>
            </li>
            <li className="success-order-item">
              <strong>Order Phone:</strong>
              <span className="success-order-value">{state ? state.customer_phone : ""}</span>
            </li>
            <li className="success-order-item">
              <strong>Order Total:</strong>
              <span className="success-order-value">৳{state ? state.amount_to_collect : ""}</span>
            </li>
            <li className="success-order-item">
              <strong>Order Address:</strong>
            </li>
            <li>
              <span className="success-order-address-value">
                {state ? state.customer_address : ""}
                </span>
            </li>
            <li className="success-order-item">
              <strong>Estimated Time:</strong>
              <span className="success-order-value">3-5 days</span>
            </li>
          </ul>
        </div>


        <div className="success-order-actions">
            <button className="success-track-order-btn" onClick={() => navigate(`/order-history/${state ? state.order_id : ""}`, {state: state})}>Track order</button>
            <button className="success-shop-again-btn" onClick={() => navigate('/')}>Shop again</button>
        </div>
      </div>  
    </div>
  );
}

export default React.memo(OrderSuccess);
