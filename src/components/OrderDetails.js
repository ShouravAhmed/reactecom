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

  const [reviewProduct, setReviewProduct] = useState('');
  const [reviewProductRating, setReviewProductRating] = useState(5);
  const [reviewProductReview, setReviewProductReview] = useState('')

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


  const UsersOrders = useQuery(`users-orders`, async () => {
    try{
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      return axiosInstance.get('order', config);
    }
    catch(e) {
      return {'data':[]};
    }
  }, { 
    staleTime: (60) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });

  useEffect(() => {
    try{
      if(UsersOrders.data && UsersOrders.data.data && UsersOrders.data.data.length > 0) {
        localStorage.setItem('LOCAL_ORDER_HISTORY', JSON.stringify(UsersOrders.data.data));
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }, [UsersOrders.data]);

  const updateOrder = async () => {
    try{
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axiosInstance.get(`order/${orderId}`, config);
      setOrder(res.data);
      UsersOrders.refetch();
    }
    catch(e) {
      console.log('=>> order - exception:', e);
    }
  }

  const reviewButtonClicked = async (orderedProduct) => {
    if(reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}`) {
      if(orderedProduct.review_status === 'Approved') {
        showToast("Review edits are no longer allowed.");
        return;
      }
      const review = {
        product: orderedProduct.product,
        order: order,
        size: orderedProduct.product_size,
        rating: reviewProductRating,
        description: reviewProductReview
      }
      try{
        setWorkInProgress(true);
        const token = await getAccessToken();
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axiosInstance.post(`order/ordered-product/review/`, {'review': review}, config);
        console.log('res: ', res);
        
        setWorkInProgress(false);
        if(res.data.status == 'OK') {
          showToast('Thank you for your review!');
          updateOrder();
        }
        else {
          showToast("Review edits are no longer allowed.");
        }
      }
      catch(e) {
        setWorkInProgress(false);
      }
    }
    else {
      setReviewProductRating(orderedProduct.rating);
      setReviewProductReview(orderedProduct.review);
      setReviewProduct(`${orderedProduct.product.product_id}-${orderedProduct.product_size}`);
    }
  }

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
        {order.ordered_products && order.ordered_products.length > 0  && order.ordered_products.map((orderedProduct, index) => 
          <div className={`ordered-product-container ${reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}` ? 'expanded' : ''}`} key={index}>
            <div className="ordered-product" onClick={() => {navigate('/product-page', {'state':orderedProduct.product})}}>
              <div  className="wishlist-product-image" > 
                <Image 
                  imageUrl={orderedProduct.product.profile_image}
                  altText={orderedProduct.product.product_name}
                  blurHash={orderedProduct.product.profile_image_blurhash}
                  width={"100%"}
                  height={"120px"}
                  blurHashWidth={"100%"}
                  blurHashHeight={"120px"}
                  borderRadius={"8px"}
                />
              </div>
              <div className="cart-product-details">
                <div className="cart-product-row">
                  <div className="cart-product-name" style={{fontSize: '1em', marginTop: '5px'}}>{orderedProduct.product.product_name}</div>
                  <div className="cart-delete-button" style={{border: '2px solid black', borderRadius: '7px', padding: '2px 6px', fontWeight: '600', fontSize: '0.8em'}}>
                    x {orderedProduct.product_quantity}
                  </div>
                </div>
                <div className="cart-product-row" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '0.8em'}}>
                  <div className="product-prices" style={{marginBottom: '10px',}}>
                    <span>Size: </span>
                    <span style={{fontWeight: '600'}}>{orderedProduct.product_size}</span>
                  </div>
                  <div className="product-prices" style={{marginBottom: '0px', marginTop: '2px'}}>
                    <span>Price: </span>
                    <span className="discount-price">৳{orderedProduct.product_price}</span>
                    <span className="real-price">৳{orderedProduct.product.product_selling_price}</span>
                    <span className="saving-price">৳{(parseFloat(orderedProduct.product.product_selling_price) - parseFloat(orderedProduct.product_price)).toFixed(2)} saved</span>
                  </div>
                  <div className="product-prices" style={{marginTop: '2px'}}>
                    <div className="cart-product-row" style={{marginTop: '0px'}}>
                      <div>
                        <span>Subtotal: </span>
                        <span style={{fontWeight: '600', color: 'rgb(223, 1, 112)'}}>৳{parseInt(orderedProduct.product_price) * parseInt(orderedProduct.product_quantity)}</span>
                      </div>
                      {order.order_status === 'Delivered' && (
                        <div 
                          className="order-details-review-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            reviewButtonClicked(orderedProduct);
                          }}
                          style={{
                            backgroundColor: (reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}`) 
                              ? 'rgb(223, 1, 112)' 
                              : 'rgb(119, 0, 255)'
                          }}
                        >
                          {reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}` ? 'Submit' : 'Review'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}` && (
              <div className="order-review-section">
                {workInProgress && (<div className="lds-ripple" style={{background: "transparent", height: '10px', margin: '0 auto'}}><div></div><div></div></div>)}
                <div className="order-review-star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fa fa-star ${star <= reviewProductRating ? 'filled' : ''}`}
                      onClick={() => setReviewProductRating(star)}
                    ></i>
                  ))}
                </div>
                
                <textarea placeholder="Write your review here..." onChange={(e) => {
                  setReviewProductReview(e.target.value);
                }} value={reviewProductReview}></textarea>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(OrderDetails);
