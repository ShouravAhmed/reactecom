import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { useQuery } from 'react-query';
import Axios from 'axios';

import { Image } from "./Image";

import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function CartPage() {            
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, } = authData;

  const {dataContextData}  = useContext(DataContext);
  const { setCartItemCount } = dataContextData;
  
  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
            return false;
        }
    }
    return true;
  }


  
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // Cart Related Operations
  // -----------------------------------------------------------------
  const [cartProducts, setCartProducts] = useState([]);
  const [cartInitiated, setCartInitiated] = useState(false);
  
  const CartProductsResponse = useQuery(`cart-products`, async () => {
    try{
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      return axiosInstance.get('product/cart/', config);
    }
    catch(e) {
      return {'data':[]};
    }
  }, { 
    staleTime: (60) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });
  
  const saveUnsavedCartItems = useCallback(async (cartItems) => {
    console.log('cartItems saveUnsavedCartItems:', cartItems);

    const unsavedCartItems = [];
    for (const item of cartItems) {
      if (!item.id) {
        unsavedCartItems.push(item);
      }
    }
    
    console.log('cartItems unsavedCartItems:', unsavedCartItems);
    if(!unsavedCartItems || unsavedCartItems.length === 0) {
      return;
    }
    
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axiosInstance.post('product/cart/batch-add/',
        {'cart':unsavedCartItems,}, 
        config
      );
      CartProductsResponse.refetch();
    }
    catch(e) {
      console.log("exception:", e);
    }
  }, [getAccessToken, CartProductsResponse]);

  const populateCartProducts = useCallback(async (cartItems) => {
    if (!cartInitiated || isUpdatingCartItem) return;
    
    console.log("populateCartProducts:");
    console.log("candidate cartProducts:", cartItems);
    console.log("cartProducts:", cartProducts);

    const cartProductsMap = {};
    for (const item of cartItems) {
      if (item.product.product_id) {
        cartProductsMap[item.product.product_id + item.size] = true;
      }
    }

    const unsavedItems = [];
    for (const item of cartProducts) {
      if(!item.id) {
        if(!((item.product.product_id + item.size) in cartProductsMap)) {
          unsavedItems.push(item);
        }
      }
    }
    const updatedCartlist = [...cartItems, ...unsavedItems];

    console.log('cartlist unsavedItems:', unsavedItems);
    console.log("cartlist updatedCartlist:", updatedCartlist);

    if (!arraysAreEqual(cartProducts, updatedCartlist)) {
        localStorage.setItem('LOCAL_CARTLIST', JSON.stringify(updatedCartlist));
        setCartProducts(updatedCartlist);
    } 
    else {
        console.log("cartProducts and updatedCartlist are identical.");
    }
    saveUnsavedCartItems(updatedCartlist);
  }, [cartProducts, saveUnsavedCartItems, cartInitiated]);


  const [isUpdatingCartItem, setIsUpdatingCartItem] = useState(false);

  useEffect(() => {
    try{
      if(CartProductsResponse.data && CartProductsResponse.data.data && CartProductsResponse.data.data.length > 0) {
        console.log("remote cartList loaded:", CartProductsResponse.data.data);
        
        populateCartProducts(CartProductsResponse.data.data);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }, [CartProductsResponse, populateCartProducts]);

  useEffect(() => {
    const localCartlist = JSON.parse(localStorage.getItem('LOCAL_CARTLIST'));
    console.log("localCartlist inited:", localCartlist);

    if(localCartlist && localCartlist.length > 0) {
      setCartProducts(localCartlist);
    }
  }, []);

  const removeProductFromRemoteCart = async (cartItem) => {
    console.log("removeProductFromRemoteCart:", cartItem);
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      try{
        const res = await axiosInstance.get(`product/cart/delete/${cartItem.product.product_id}/${cartItem.size}/`, config);
        
        console.log("addProductInRemoteCart response:", res);
        CartProductsResponse.refetch();
      }
      catch(e) {
        console.log("exception:", e);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }

  const removeFromCart = async (cartItem) => { 
    console.log("removeFromCart: ", cartItem);
    
    const updatedCartlist = cartProducts.filter(item => 
        (cartItem.product.product_id !== item.product.product_id || cartItem.size !== item.size)
    );
    setCartProducts(updatedCartlist);

    setIsUpdatingCartItem(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.setItem('LOCAL_CARTLIST', JSON.stringify(updatedCartlist));
    await removeProductFromRemoteCart(cartItem);

    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsUpdatingCartItem(false);
    
    if(CartProductsResponse.data && CartProductsResponse.data.data && CartProductsResponse.data.data.length > 0) {
      populateCartProducts(CartProductsResponse.data.data);
    }
  }

  const updateRemoteCartItemCount = async (cartItem) => {
    console.log("addProductInRemoteCart:", cartItem);
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      try{
        const res = await axiosInstance.get(`product/cart/update/${cartItem.product.product_id}/${cartItem.size}/${cartItem.count}`, config);
        console.log("addProductInRemoteCart response:", res);
      }
      catch(e) {
        console.log("exception:", e);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }

  const updateCartItemCount = async (cartItem, change) => {
    const updatedCartProducts = [...cartProducts];
    
    for(var idx = 0; idx < updatedCartProducts.length; idx += 1) {
      if((updatedCartProducts[idx].product.product_id + updatedCartProducts[idx].size) === (cartItem.product.product_id + cartItem.size)) {
        
        var count = updatedCartProducts[idx].count;
        updatedCartProducts[idx].count = Math.min(Math.max(updatedCartProducts[idx].count + change, 1), 10);
        
        console.log("updateCartItemCount: ", updatedCartProducts);

        if(count !== updatedCartProducts[idx].count) {
          setCartProducts(updatedCartProducts);
          updateRemoteCartItemCount(updatedCartProducts[idx]);
        }
        break;
      }
    }
  }

  useEffect(() => {
    console.log("cart products updated:", cartProducts);
    if(cartProducts && cartProducts.length > 0) {
      setCartInitiated(true);
      setCartItemCount(cartProducts.length);
    }
    if(cartProducts && cartInitiated) {
      setCartItemCount(cartProducts.length);
    }
  }, [cartProducts]);

  useEffect(() => {
    if(CartProductsResponse.data && CartProductsResponse.data.data && CartProductsResponse.data.data.length > 0) {
      console.log("cartInitiated : remote cartList : ", CartProductsResponse.data.data);
      populateCartProducts(CartProductsResponse.data.data);
    }
  }, [cartInitiated]);

  useEffect(() => {
    const f = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCartInitiated(true);
    }
    f();
  }, [])



  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // Cart Calculation
  // -----------------------------------------------------------------

  const [couponDiscount, setCouponDiscount] = useState(null);
  const [flatDiscount, setFlatDiscount] = useState(null);
  const [appliedCoinAmount, setAppliedCoinAmount] = useState(0);

  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [isCoinOpen, setIsCoinOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coinAmount, setCoinAmount] = useState(0);
  

  useEffect(() => {
    const fun = async () => {
      const res = await axiosInstance.get('marketing/offer/flat-discount/');
      setFlatDiscount(res.data);
    }
    fun();
  }, []);

  const applyCoupon = async (coupon) => {
    if((couponDiscount && couponDiscount.is_valid)) {
      setCouponDiscount(null);
      return;
    }

    const res = await axiosInstance.get(`marketing/offer/validate-coupon/${coupon}/`);
    console.log('cart : applyCoupon =>', res.data);
    setCouponDiscount(res.data);
  }

  const applyCoin = (coin) => {
    setAppliedCoinAmount(0);
  }

  const calculateProductsOriginalPrice = () => {
    console.log("cart: calculateProductsOriginalPrice");
    return cartProducts.reduce((acc, cartItem) => acc + (parseInt(cartItem.product.product_selling_price) * parseInt(cartItem.count)), 0);
  }

  const calculateProductsDiscount = () => {
    console.log("cart: calculateProductsTotalDiscount");
    return cartProducts.reduce((acc, cartItem) => acc + (parseInt(((cartItem.product.product_selling_price * cartItem.product.product_discount) / 100)) * parseInt(cartItem.count)), 0);
  }

  const calculateProductsDiscountPrice = () => {
    console.log("cart: calculateProductsDiscountPrice");
    return (calculateProductsOriginalPrice() - calculateProductsDiscount());
  }

  const calculateFlatDiscount = () => {
    console.log("cart: calculateFlatDiscount");
    if(!flatDiscount.is_available) return 0;
    if (flatDiscount.discount_type === 'FIXED') {
      return flatDiscount.discount_value;
    }
    const price = calculateProductsDiscountPrice();
    return parseInt((price * flatDiscount.discount_value) / 100);
  }

  const calculateCouponDiscount = () => {
    console.log("cart: calculateCouponDiscount");
    if(!couponDiscount.is_valid) return 0;
    if (couponDiscount.discount_type === 'FIXED') {
      return couponDiscount.discount_value;
    }
    const price = calculateProductsDiscountPrice();
    return parseInt((price * couponDiscount.discount_value) / 100);
  }

  const calculateSubTotal = () => {
    console.log("cart: calculateSubTotal");
    if (couponDiscount && couponDiscount.is_valid) {
      return (calculateProductsDiscountPrice() - calculateCouponDiscount());
    }
    else if (flatDiscount && flatDiscount.is_available) {
      return (calculateProductsDiscountPrice() - calculateFlatDiscount());
    }
    return calculateProductsDiscountPrice();
  }

  const isFreeDelivery = () => {
    console.log("cart: calculateDeliveryCharge");
    const productsPrice = calculateSubTotal();
    return ((productsPrice >= 999) ? true : false);
  }

  const gamifyPurchase = () => {
    const productsPrice = calculateSubTotal();
    const targetPurchase = (parseInt((productsPrice/1000)) * 1000) + 999;
    const discount = ((targetPurchase - 999) / 1000) * 100;
    return (<span>
      Purchase <span style={{color: "rgb(223, 1, 112)"}}>৳{targetPurchase}</span> or more for {targetPurchase < 1000 ? "free delivery" : <span> <span style={{color: "rgb(223, 1, 112)"}}>৳{discount}</span> discount</span>}
    </span>);
  }

  const calculateAdditionalDiscount = () => {
    console.log("cart: calculateAdditionalDiscount");
    const subTotal = calculateSubTotal();
    if (subTotal < 999) return false;
    return (parseInt((subTotal-1000+1)/1000) * 100);
  }

  const calculateTotalPrice = () => {
    console.log("cart: calculateTotalPrice");
    return (calculateSubTotal() - calculateAdditionalDiscount());
  }

  const handleCouponClick = () => {;
    setIsCoinOpen(false);
    setIsCouponOpen(true)
  };

  const handleCoinClick = () => {
    setIsCouponOpen(false);
    setIsCoinOpen(true);
  };

  const handleCouponChange = (event) => {
    setCouponCode(event.target.value);    
  };

  const handleCoinChange = (event) => {
    setCoinAmount(event.target.value);
  };

  const handleCouponApply = () => {
    applyCoupon(couponCode);
  };

  const handleCoinApply = () => {
    applyCoin(coinAmount);
  };


  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  

  console.log("WishList page is being loaded");

  return (
    <div>
      {cartInitiated && cartProducts && cartProducts.length === 0 && (
        <div className="cart-page-container">
          <Link to="/search" className="search-bar">
            <button className="search-button">
              <i className="fa fa-search" aria-hidden="true"></i>
              Search For Products
            </button>
          </Link>

          <span className="empty-cart-icon">
            <i className="fa fa-shopping-cart" aria-hidden="true"></i>
          </span>
          
          <div style={{opacity:"0.7", fontSize:"1.5em"}}>— Your Cart Is Empty —</div>
          <Link to="/" className="start-shopping">Start Shopping 
            <span style={{marginLeft: "20px"}}>
              <i class="fa fa-chevron-right" aria-hidden="true"></i>
              <i class="fa fa-chevron-right" aria-hidden="true"></i>
            </span>
          </Link>
        </div>
      )}

      {cartProducts && cartProducts.length > 0 &&
      <div className="cart-page-container">

        <Link to="/search" className="search-bar">
          <button className="search-button">
            <i className="fa fa-search" aria-hidden="true"></i>
            Search For Products
          </button>
        </Link>

        <div className="cart-page-title">
          <span className="heart-icon">
            <i className="fa fa-shopping-bag" aria-hidden="true"></i>
          </span>
          <span>My Cart</span>
        </div>
        
        {cartProducts.map((cartItem) => 
          <div key={cartItem.product.product_id+cartItem.size} className="cart-product-container" onClick={() => {navigate('/product-page', {'state':cartItem.product})}}>
            <div  className="cart-product-image" > 
              <Image 
                imageUrl={'http://127.0.0.1:8000/' + cartItem.product.profile_image}
                altText={cartItem.product.product_name}
                blurHash={cartItem.product.profile_image_blurhash}
                width={"100%"}
                height={"140px"}
                blurHashWidth={"100%"}
                blurHashHeight={"140px"}
                borderRadius={"8px"}
              />
            </div>
            <div className="cart-product-details">
              <div className="cart-product-name">{cartItem.product.product_name}</div>
              <div className="cart-product-row">
                <div className="product-prices">
                  <span className="discount-price">৳{cartItem.product.product_selling_price - ((cartItem.product.product_selling_price * cartItem.product.product_discount) / 100)}</span>
                  <span className="real-price">৳{cartItem.product.product_selling_price}</span>
                  <span className="saving-price">saved ৳{parseInt((cartItem.product.product_selling_price) - (cartItem.product.product_selling_price - ((cartItem.product.product_selling_price * cartItem.product.product_discount) / 100)))}</span>
                </div>
                <div className="cart-delete-button" onClick={(event) => {
                    event.stopPropagation();
                    removeFromCart(cartItem);
                  }}>
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </div>
              </div>
              <div className="cart-product-row">
                <div className="cart-product-info">
                  <span>Size: {cartItem.size}</span>
                </div>
                <div className="cart-count-container">
                  <button className="cart-count-button" onClick={(event) => {
                    event.stopPropagation();
                    updateCartItemCount(cartItem, -1);
                  }}>-</button>
                  <span className="cart-count">{cartItem.count}</span>
                  <button className="cart-count-button" onClick={(event) => {
                    event.stopPropagation();
                    updateCartItemCount(cartItem, 1);
                  }}>+</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="coupon-coin-container">
          
          {!isCouponOpen && 
          <button
            className="coupon-coin-button"
            onClick={handleCouponClick}
          >
            Have a coupon?
          </button>}

          {isCouponOpen && (
            <div className="coupon-input-container">
              <button className="coupon-coin-button" onClick={handleCouponApply}>
                {(couponDiscount && couponDiscount.is_valid) ? "Remove Coupon" : "Apply Coupon"}
              </button>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={handleCouponChange}
              />
            </div>
          )}

          {/* {!isCoinOpen && 
          <button
            className={`coupon-coin-button`}
            onClick={handleCoinClick}
          >
            Use Alpona Coin
          </button>}

          {isCoinOpen && (
            <div className="coin-input-container">
              <button className="coupon-coin-button" onClick={handleCoinApply}>
                Apply Coin
              </button>
              <input
                type="number"
                placeholder="Enter coin amount"
                value={coinAmount}
                onChange={handleCoinChange}
              />
            </div>
          )} */}
        </div>

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

          {calculateAdditionalDiscount() ?
          <div className="cart-calculation-row">
            <span className="cart-calculation-name">Additional Discount</span>
            <span className="cart-calculation-price">
              ৳{calculateAdditionalDiscount()}
            </span>
          </div> : ""}
          {
            isFreeDelivery() && (
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Delivery Charge</span>
              <span className="cart-calculation-price">
                ৳0
              </span>
            </div>)
          }


          <hr className="cart-calculation-line" />
          
          <div className="cart-calculation-row">
            <span className="cart-calculation-name">Total</span>
            <span className="cart-calculation-price">
              ৳{calculateTotalPrice()}
            </span>
          </div>
        </div>

        <div className="gamify-purchase-fixed-bar">
          <span>{gamifyPurchase()}</span>
        </div>

        <div className="cart-fixed-bar-container" style={{fontSize: "1em"}}>
          <span>
            Total Price - ৳{calculateTotalPrice()}
          </span>
          <span className="divider" style={{marginLeft: "20px", marginRight: "10px", }}>|</span>
          <span style={{marginRight: "10px",}}>Next</span>
          <i class="fa fa-chevron-right" aria-hidden="true"></i>
        </div>
      </div>}
    </div>
  );
}

export default React.memo(CartPage);
