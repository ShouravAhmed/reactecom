import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { useQuery, useQueryClient } from 'react-query';
import Axios from 'axios';

import { Image } from "./Image";

import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function CheckoutPage() {            
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { state } = useLocation();
  
  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const {dataContextData}  = useContext(DataContext);
  const { setCartItemCount } = dataContextData;

  const [cartProducts, setCartProducts] = useState([]);

  const [couponDiscount, setCouponDiscount] = useState(null);
  const [flatDiscount, setFlatDiscount] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);

  const [selectedPayment, setSelectedPayment] = useState('cod');

  const [checkoutOngoing, setCheckoutOngoing] = useState(false);

  const handlePaymentChange = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
  };
  
  const calculateProductsOriginalPrice = () => {
    console.log("checkout: calculateProductsOriginalPrice");
    return (cartProducts.reduce((acc, cartItem) => acc + (parseFloat(cartItem.product.product_selling_price) * parseInt(cartItem.count)), 0.0)).toFixed(2);
  }

  const calculateProductsDiscount = () => {
    console.log("cart: calculateProductsTotalDiscount");
    return (cartProducts.reduce((acc, cartItem) => acc + ((((parseFloat(cartItem.product.product_selling_price) * parseInt(cartItem.product.product_discount))) / 100) * parseInt(cartItem.count)), 0.0)).toFixed(2);
  }

  const calculateProductsDiscountPrice = () => {
    console.log("cart: calculateProductsDiscountPrice");
    return parseFloat(calculateProductsOriginalPrice() - calculateProductsDiscount()).toFixed(2);
  }

  const calculateCouponDiscount = () => {
    console.log("cart: calculateCouponDiscount");
    if(!couponDiscount || !couponDiscount.is_valid) return parseFloat(0).toFixed(2);
    if (couponDiscount.discount_type === 'FIXED') {
      return parseFloat(couponDiscount.discount_value).toFixed(2);
    }
    const price = calculateProductsDiscountPrice();
    return ((price * parseInt(couponDiscount.discount_value)) / 100.0).toFixed(2);
  }

  const calculateFlatDiscount = () => {
    console.log("cart: calculateFlatDiscount");
    if(!flatDiscount || !flatDiscount.is_available) return parseFloat(0).toFixed(2);
    if (flatDiscount.discount_type === 'FIXED') {
      return parseFloat(flatDiscount.discount_value).toFixed(2);
    }
    const price = calculateProductsDiscountPrice();
    return parseFloat((price * parseFloat(flatDiscount.discount_value)) / 100.0).toFixed(2);
  }

  const calculateSubTotal = () => {
    console.log("cart: calculateSubTotal");
    if (couponDiscount && couponDiscount.is_valid) {
      return parseFloat(calculateProductsDiscountPrice() - calculateCouponDiscount()).toFixed(2);
    } else if (flatDiscount && flatDiscount.is_available) {
      return parseFloat(calculateProductsDiscountPrice() - calculateFlatDiscount()).toFixed(2);
    }
    return parseFloat(calculateProductsDiscountPrice()).toFixed(2);
  }

  const roundingDownDiscount = () => {
    const subtotal = calculateSubTotal();
    return (subtotal - (parseInt(subtotal / 10) * 10));
  }

  const isAdditionalDiscountAvailable = () => {
    const subTotal = calculateSubTotal();
    const discount = (parseInt((subTotal-1000+1)/1000) * 100) + roundingDownDiscount();
    return (discount > 0 ? true : false);
  }

  const calculateAdditionalDiscount = () => {
    console.log("cart: calculateAdditionalDiscount");
    const subTotal = calculateSubTotal();
    const discount = (parseInt((subTotal-1000+1)/1000) * 100) + roundingDownDiscount();
    return discount.toFixed(2);
  }
  
  const calculateDeliveryCharge = () => {
    console.log("cart: calculateDeliveryCharge");
    const productsPrice = parseFloat(calculateSubTotal());
    if (productsPrice >= 999) return parseFloat(0).toFixed(2);
    if (deliveryDetails && deliveryDetails.district == 'Dhaka') return parseFloat(60).toFixed(2);
    return parseFloat(120).toFixed(2);
  }
  
  const calculateTotalPrice = () => {
    console.log("cart: calculateTotalPrice");
    const subTotal = parseFloat(calculateSubTotal());
    const deliveryCharge = parseFloat(calculateDeliveryCharge());
    const additionalDiscount = parseFloat(calculateAdditionalDiscount());
    
    const total = subTotal + deliveryCharge - additionalDiscount;
    
    return parseInt(total).toFixed(2);
  }

  useEffect(() => {
    const localDeliveryDetails = JSON.parse(localStorage.getItem('LOCAL_DELIVERY_DETAILS'));
    if(localDeliveryDetails) {
      setDeliveryDetails(localDeliveryDetails);
    }
    console.log("checkout =>> delivery details: ", localDeliveryDetails);

    const localCartlist = JSON.parse(localStorage.getItem('LOCAL_CARTLIST'));
    if(localCartlist && localCartlist.length > 0) {
      setCartProducts(localCartlist);
    }

    const localCouponDiscount = JSON.parse(localStorage.getItem('LOCAL_COUPON_DISCOUNT'));
    if(localCouponDiscount) {
      setCouponDiscount(localCouponDiscount);
    }

    const localFlatDiscount = JSON.parse(localStorage.getItem('LOCAL_FLAT_DISCOUNT'));
    if(localFlatDiscount) {
      setFlatDiscount(localFlatDiscount);
    }
  }, []);


  if(!state) {
    navigate('/cart');
  }

  const ConfirmOrder =  async () => {
    setCheckoutOngoing(true);
    console.log("checkout =>> Comfirm Order");

    let token = null;
    try { token = await getAccessToken(); }
    catch (e) { console.log("checkout =>> Exception: ", e); }
    
    let res = null;
    const data = {'cart_item_list': cartProducts, 'delivery_details': deliveryDetails, 'applied_coupon': couponDiscount};
    if(token) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      res = await axiosInstance.post('order/confirm/', data, config);  
    }
    else {
      res = await axiosInstance.post('order/confirm/', data);
    }
    
    console.log("checkout =>> response:", res);    

    const orderResponse = await res.data;

    if (orderResponse.status === 'OK') {
      localStorage.removeItem('LOCAL_CARTLIST');
      queryClient.removeQueries('wishlist-products');
      setCartItemCount(0);
      
      showToast('Order placed successfully.');
      setCheckoutOngoing(false);

      window.history.replaceState(null, '', '/order-success');
      navigate('/order-success', { state: orderResponse.data});
    }
    else {
      showToast('Something went wrong, please try again.');
      setCheckoutOngoing(false);
      navigate('/cart');
    }
  }

  console.log("Checkout page is being loaded");

  return (
    <div className="cart-page-container">
      <div className="checkout-container">

        <h3 className="checkout-title">Select Payment method</h3>
        <div className="checkout-payment-options">
          
          <div className={`checkout-payment-option ${selectedPayment === 'cod' ? 'selected' : ''}`}
            onClick={() => handlePaymentChange('cod')}>
            <div className="checkout-icon">💵</div>
            <span>Cash on delivery</span>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={selectedPayment === 'cod'}
              readOnly
            />
          </div>
          <div className={`checkout-payment-option ${selectedPayment === 'card' ? 'selected' : ''} disabled`}
            onClick={() => handlePaymentChange('card')}>
            <div className="checkout-icon">💳</div>
            <span>Card / Mobile Payment</span>
            <input
              type="radio"
              name="payment"
              value="card"
              checked={selectedPayment === 'card'}
              readOnly
            />
          </div>
          
          <div className={`checkout-payment-option ${selectedPayment === 'bkash' ? 'selected' : ''} disabled`}
            onClick={() => handlePaymentChange('bkash')}>
            <div className="checkout-icon">💸</div>
            <span>bKash Payment</span>
            <input
              type="radio"
              name="payment"
              value="bkash"
              checked={selectedPayment === 'bkash'}
              readOnly
            />
          </div>
          <span style={{fontSize: "0.7em", color: "rgb(119, 0, 255)", paddingLeft: "5px"}}>Card / Mobile payment will be available soon.</span>
        </div>

        <h3 style={{marginTop: "35px"}}>Order Summary</h3>
        <div className="checkout-order-summary">
          <div className="cart-calculation">
            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Price</span>
              <span className="cart-calculation-price">৳{calculateProductsOriginalPrice()}</span>
            </div>

            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Discount</span>
              <span className="cart-calculation-price">
                ৳{calculateProductsDiscount()}
              </span>
            </div>
            
            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Products Discount Price</span>
              <span className="cart-calculation-price">
                ৳{calculateProductsDiscountPrice()}
              </span>
            </div>

            {((flatDiscount && flatDiscount.is_available) || (couponDiscount && couponDiscount.is_valid)) && (
              <>
                { (couponDiscount && couponDiscount.is_valid) ? 
                  <div className="cart-calculation-row">
                    <span className="cart-calculation-name">Coupon Discount</span>
                    <span className="cart-calculation-price">৳{calculateCouponDiscount()}</span>
                  </div> : 
                  <div className="cart-calculation-row">
                    <span className="cart-calculation-name">Flat Discount</span>
                    <span className="cart-calculation-price">৳{calculateFlatDiscount()}</span>
                  </div>
                }
                <hr className="cart-calculation-line" />
                <div className="cart-calculation-row">
                  <span className="cart-calculation-name">Sub-total</span>
                  <span className="cart-calculation-price">
                    ৳{calculateSubTotal()}
                  </span>
                </div>
              </>
            )}

            {isAdditionalDiscountAvailable() ?
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Additional Discount</span>
              <span className="cart-calculation-price">
                ৳{calculateAdditionalDiscount()}
              </span>
            </div> : ""}
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Delivery Charge</span>
              <span className="cart-calculation-price">
                ৳{calculateDeliveryCharge()}
              </span>
            </div>

            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Total</span>
              <span className="cart-calculation-price">
                ৳{calculateTotalPrice()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {checkoutOngoing && (<div class="lds-ripple loading-fixed-bar" style={{background: "transparent"}}><div></div><div></div></div>)}

      <div className="cart-fixed-bar-container" style={{fontSize: "1em", cursor: "text"}}>
        <div style={{paddingLeft: "10px", paddingRight: "10px", cursor: "pointer"}} onClick={() => {
          navigate(-1);
        }}>
          <i class="fa fa-chevron-left" aria-hidden="true"></i>
          <span style={{marginLeft: "20px",}}>Back</span>
        </div>
          <span className="divider" style={{marginLeft: "20px", marginRight: "20px", }}>|</span>
        <div style={{paddingLeft: "10px", paddingRight: "10px", cursor: "pointer"}} onClick={() => {
          ConfirmOrder();
        }}>
          <span>Confirm Order</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CheckoutPage);
