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

function OrderHistory() {            
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const [orders, setOrders] = useState(JSON.parse(localStorage.getItem('LOCAL_ORDER_HISTORY')));

  const [workInProgress, setWorkInProgress] = useState(false);
  const [orderHistoryInitiated, setOrderHistoryInitiated] = useState(false);

  const UsersOrders = useQuery(`users-orders`, async () => {
    try{
      setWorkInProgress(true);
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      setWorkInProgress(false);
      setOrderHistoryInitiated(true);
      return axiosInstance.get('order', config);
    }
    catch(e) {
      return {'data':[]};
    }
  }, { 
    staleTime: (5) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });

  useEffect(() => {
    try{
      if(UsersOrders.data && UsersOrders.data.data && UsersOrders.data.data.length > 0) {
        console.log("users orders loaded:", UsersOrders.data.data);
        
        localStorage.setItem('LOCAL_ORDER_HISTORY', JSON.stringify(UsersOrders.data.data));
        setOrders(UsersOrders.data.data);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }, [UsersOrders.data]);

  useEffect(() => {
    const f = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrderHistoryInitiated(true);
    }
    f();
  }, [])

  console.log("Order history page loaded.");

  return (
    <>
    {orderHistoryInitiated && orders && orders.length === 0 && 
      <div className="cart-page-container">

        <span className="empty-cart-icon" style={{color: "rgb(223, 1, 112)"}}>
          <i className="fa fa-smile" aria-hidden="true"></i>
        </span>
        
        <div style={{opacity:"0.7", fontSize:"1.5em"}}>— No Order History —</div>
        <Link to="/" className="start-shopping">Make a order now !!
          <span style={{marginLeft: "20px"}}>
            <i className="fa fa-chevron-right" aria-hidden="true"></i>
            <i className="fa fa-chevron-right" aria-hidden="true"></i>
          </span>
        </Link>
      </div>
    }
    
    {orders && orders.length > 0 &&
      <div className="order-history-container">
        {workInProgress && (<div className="lds-ripple" style={{background: "transparent", marginBottom: "20px"}}><div></div><div></div></div>)}

        <div className="cart-page-title">
          <span className="heart-icon">
            <i className="fa fa-history" aria-hidden="true"></i>
          </span>
          <span>Order History</span>
        </div>

        {orders.map((order, index) => (
          <div className="order-history-card" key={index} onClick={() => navigate(order.order_id, {state: order})}>
            <div className="order-history-header">
                <span className="order-history-title">ORDER ID</span>
                <span className="order-history-id">
                  <i className="fa fa-copy" aria-hidden="true" style={{marginRight: "5px", cursor: "pointer"}} onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(order.order_id);
                    showToast("Order ID copied!");
                  }}></i>
                  <span style={{fontSize: '16px', fontWeight: '600'}}>#</span>
                  {order.order_id}
                </span>
            </div>
            <div className="order-history-body">
                <div className="order-history-row">
                    <span>Order Date:</span>
                    <span>{order.created_at}</span>
                </div>
                <div className="order-history-row">
                    <span>Status:</span>
                    <span style={{
                      fontSize: '14', 
                      paddingLeft: '12px', 
                      paddingRight: '12px', 
                      paddingTop: '5px',
                      paddingBottom: '5px',
                      borderRadius: '15px', 
                      color: '#fff', 
                      fontSize: '14px',
                      backgroundColor: ['Delivery Failed', 'Cancelled', 'Paid Return', 'Return'].includes(order.order_status)
                      ? '#F23635'
                      : ['Partial Delivery', 'Delivered'].includes(order.order_status)
                      ? 'seagreen'
                      : '#a656fc'
                    }}>{order.order_status}</span>
                </div>
                <div className="order-history-row">
                    <span>Payment method:</span>
                    <span>{order.payment_method}</span>
                </div>
                <div className="order-history-row">
                    <span>Grand total:</span>
                    <span>৳{order.amount_to_collect}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    }
    </>
  );
}

export default React.memo(OrderHistory);
