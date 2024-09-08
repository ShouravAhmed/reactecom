import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { useQuery } from 'react-query';
import Axios from 'axios';

import { Image } from "./Image";

import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function OrderDetails() {            
  const navigate = useNavigate();

  const { orderId } = useParams(); 
  const { state } = useLocation();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const [workInProgress, setWorkInProgress] = useState(false);

  const [order, setOrder] = useState({});

  const UsersOrder = useQuery(`users-order-${orderId}`, async () => {
    try{
      setWorkInProgress(true);
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (state) {
        setWorkInProgress(false);
        return { 'data': state };
      }

      if (Object.keys(order).length > 0) {
        setWorkInProgress(false);
        return { 'data': order };
      }

      const data = await axiosInstance.get(`order/${orderId}`, config);
      setWorkInProgress(false);
      return data;
    }
    catch(e) {
      setWorkInProgress(false);
      console.log('=>> order details - exception:', e);
      return {'data':[]};
    }
  });

  useEffect(() => {
    try{
      if(UsersOrder.data && UsersOrder.data.data) {
        console.log("=>> order details - userOrder:", UsersOrder.data.data);
        
        setOrder(UsersOrder.data.data);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }, [UsersOrder.data]);


  return (
    <div className="order-details-page">
      {workInProgress && (<div className="lds-ripple" style={{background: "transparent", marginBottom: "20px"}}><div></div><div></div></div>)}

      <div className="order-details-header">
        <h2>Order ID: <span style={{marginLeft: '5px'}}>#{order.order_id}</span> <i class="fa fa-copy" aria-hidden="true" style={{marginLeft: "5px", cursor: "pointer", fontSize: '0.9em'}} onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(order.order_id);
              showToast("Order ID copied!");
            }}></i>
        </h2>
        <p>{order.created_at}</p>
      </div>

      <div className="order-details-status">
        <div className="order-details-info-block">
          <i className="fa fa-shopping-cart" style={{color: 'rgb(119, 0, 255)'}}></i>
          <div className="order-details-info-container">
            <span className="order-details-info-title">Payment Method</span>
            <span className="order-details-info-value">{order.payment_method}</span>
          </div>
        </div>
        <div className="order-details-info-block">
          <i className="fa fa-heart" style={{color: 'rgb(223, 1, 112)', marginRight: '13px'}}></i>
          <div className="order-details-info-container">
            <span className="order-details-info-title">Status</span>
            <span className="order-details-info-value" style={{
              color: ['Delivery Failed', 'Cancelled', 'Paid Return', 'Return'].includes(order.order_status)
              ? '#F23635'
              : ['Partial Delivery', 'Delivered'].includes(order.order_status)
              ? 'seagreen'
              : 'blue'
            }}>{order.order_status}</span>
          </div>
        </div>
      </div>

      <div className="order-details-section">
        <h3>Order Details</h3>
        <div className="order-details-address">
          <div>
            <i className="fa fa-map-marker"></i>
            <p>{order.customer_address}</p>
          </div>
          <div>
            <i className="fa fa-phone"></i>
            <p>{order.customer_phone}</p>
          </div>
        </div>
      </div>


      <div className="order-details-summary-section">
        <h3>Order Summary</h3>
        <div className="checkout-order-summary">
          <div className="cart-calculation">
            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Price</span>
              <span className="cart-calculation-price">৳{parseFloat(order.products_regular_value).toFixed(2)}</span>
            </div>

            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Discount</span>
              <span className="cart-calculation-price">
                ৳{parseFloat(order.products_discount).toFixed(2)}
              </span>
            </div>
            
            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Products Discount Price</span>
              <span className="cart-calculation-price">
                ৳{(parseFloat(order.products_regular_value) - parseFloat(order.products_discount)).toFixed(2)}
              </span>
            </div>

            {(parseInt(order.flat_discount) > 0) && (
              <>
                <div className="cart-calculation-row">
                  <span className="cart-calculation-name">Flat Discount</span>
                  <span className="cart-calculation-price">৳{parseFloat(order.flat_discount).toFixed(2)}</span>
                </div>
            
                <hr className="cart-calculation-line" />
                <div className="cart-calculation-row">
                  <span className="cart-calculation-name">Sub-total</span>
                  <span className="cart-calculation-price">
                    ৳{((parseFloat(order.products_regular_value) - parseFloat(order.products_discount)) - parseFloat(order.flat_discount)).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {parseInt(order.additional_discount) > 0 ?
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Additional Discount</span>
              <span className="cart-calculation-price">
                ৳{parseFloat(order.additional_discount).toFixed(2)}
              </span>
            </div> : ""}
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Delivery Charge</span>
              <span className="cart-calculation-price">
                ৳{order.customers_delivery_charge}
              </span>
            </div>

            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Total</span>
              <span className="cart-calculation-price">
                ৳{(((((parseFloat(order.products_regular_value) - parseFloat(order.products_discount)) - parseFloat(order.flat_discount))) - parseFloat(order.additional_discount)) + parseFloat(order.customers_delivery_charge)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-details-items-section">
        <h3>Order Items</h3>
        {order.ordered_products && order.ordered_products.length > 0 ? (
          order.ordered_products.map((item, index) => (
          <div className="order-details-item" key={index}>
            <div className="order-details-item-details">
              <span>{item.product.product_name}</span>
              <span className="order-details-item-price">Price: ৳{parseFloat(item.product_price).toFixed(2)}</span>
              <span className="order-details-item-subtotal">Subtotal: ৳{(parseFloat(item.product_price) * parseFloat(item.product_quantity)).toFixed(2)}</span>
            </div>
            <div className="order-details-item-actions">
              <span className="order-details-item-quantity">x {item.product_quantity}</span>
              <button className="order-details-reorder-button">RE-ORDER</button>
            </div>
          </div>
        ))) : ""}
      </div>
    </div>
  );
}

export default React.memo(OrderDetails);
