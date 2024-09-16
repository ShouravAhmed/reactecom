import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";
import ImageSlider from "./ImageSlider";

import { useQuery } from 'react-query';
import Axios from 'axios';

import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


const getInitials = (name) => {
  const initials = name.split(' ').map((word) => word[0]).join('');
  const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
  return { initials, randomColor };
};

const ReviewCard = ({ review }) => {
  const { initials, randomColor } = getInitials(review.reviewer_name);

  return (
    <div className="product-review-card">
      <div className="product-review-header">
        <div className="product-review-profile-pic" style={{ backgroundColor: randomColor }}>
          {initials}
        </div>
        <div className="product-reviewer-info">
          <span className="product-reviewer-name">{review.reviewer_name}</span>
          <div className="product-review-body">
            <div className="product-review-rating">
              {'★'.repeat(Math.round(review.rating))}{''}
              {Array(5 - Math.round(review.rating)).fill('☆').join('')}
            </div>
            <span className="product-review-date">{review.review_date}</span>
          </div>
        </div>
      </div>
      <p className="product-review-text">{review.review}</p>
    </div>
  );
};


function ProductPage() {    
  const navigate = useNavigate();                                           
  const { state } = useLocation();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, } = authData;

  const {dataContextData}  = useContext(DataContext);
  const { setCartItemCount, setWishlistItemCount } = dataContextData;

  const [currentProduct, setCurrentProduct] = useState({});

  const [selectedSize, setSelectedSize] = useState("-");
  const [sizeNotSelected, setSizeNotSelected] = useState(false);
  const [selectedSizeInCart, setSelectedSizeInCart] = useState(false);

  
  useEffect(() => {
    setCurrentProduct(state);
  }, [state]);
  
  const refetchProduct = async (productId) => {
    try{
      const response = await axiosInstance.get(`product/product/${productId}/`);
      setCurrentProduct(response?.data);
      console.log('response.data:', response?.data);
    }
    catch (e) {
      console.log("exception: ", e);
    }
  }
  
  const [productReviews, setProductReviews] = useState([]);
  const [productRating, setProductRating] = useState(5.0);
  const [visibleReviewCount, setvisibleReviewCount] = useState(3);

  const visibleReviews = productReviews.slice(0, visibleReviewCount);

  const fiveStarPercentage = () => {
    return ((productReviews.filter(review => parseInt(review.rating) === 5).length * 100.0) / productReviews.length).toFixed(2);
  }
  const fiveStarCount = () => {
    return productReviews.filter(review => parseInt(review.rating) === 5).length;
  }
  const fourStarPercentage = () => {
    return ((productReviews.filter(review => parseInt(review.rating) === 4).length * 100.0) / productReviews.length).toFixed(2);
  }
  const fourStarCount = () => {
    return productReviews.filter(review => parseInt(review.rating) === 4).length;
  }
  const threeStarPercentage = () => {
    return ((productReviews.filter(review => parseInt(review.rating) === 3).length * 100.0) / productReviews.length).toFixed(2);
  }
  const threeStarCount = () => {
    return productReviews.filter(review => parseInt(review.rating) === 3).length;
  }
  const twoStarPercentage = () => {
    return ((productReviews.filter(review => parseInt(review.rating) === 2).length * 100.0) / productReviews.length).toFixed(2);
  }
  const twoStarCount = () => {
    return productReviews.filter(review => parseInt(review.rating) === 2).length;
  }
  const oneStarPercentage = () => {
    return ((productReviews.filter(review => parseInt(review.rating) === 1).length * 100.0) / productReviews.length).toFixed(2);
  }
  const oneStarCount = () => {
    return productReviews.filter(review => parseInt(review.rating) === 1).length;
  }
  
  useEffect(() => {
    if(!productReviews || productReviews.length == 0) setProductRating(5.0);
    else setProductRating(productReviews.reduce((sum, review) => sum + parseFloat(review.rating), 0.0) / productReviews.length);
  }, [productReviews]);

  const fetchProductReview = async (productId) => {
    try{
      const token = await getAccessToken();
      if(!token) {
        const response = await axiosInstance.get(`order/ordered-product/review/${productId}/`);
        console.log('=>> reviews:', response?.data);
        setProductReviews(response?.data);  
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.get(`order/ordered-product/review/${productId}/`, config);
      console.log('=>> reviews:', response?.data);
      setProductReviews(response?.data);
    }
    catch (e) {
      console.log("exception: ", e);
    }
  }

  useEffect(() => {
    refetchProduct(state.product_id);
    fetchProductReview(state.product_id);
  }, [state]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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
  // WishList Related Operations
  // -----------------------------------------------------------------
  const [wishListProducts, setWishListProducts] = useState([]);
  const [productIsInWishList, setProductIsInWishList] = useState(false);
  const [wishListInitiated, setWishListInitiated] = useState(false);

  const WishListProductsResponse = useQuery(`wishlist-products`, async () => {
    try{
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      return axiosInstance.get('product/wishlist/', config);
    }
    catch(e) {
      return {'data':[]};
    }
  }, { 
    staleTime: (60) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });
  
  const saveUnsavedWishlistItems = useCallback(async (wishlist) => {
    console.log('wishlist saveUnsavedWishlistItems:', wishlist);

    const unsavedWishlistItems = [];
    for (const item of wishlist) {
      if (!item.id) {
        unsavedWishlistItems.push(item.product.product_id);
      }
    }
    
    console.log('wishlist unsavedWishlistItems:', unsavedWishlistItems);
    if(!unsavedWishlistItems || unsavedWishlistItems.length === 0) {
      return;
    }
    
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axiosInstance.post('product/wishlist/batch-add/',
        {'wishlist':unsavedWishlistItems,}, 
        config
      );
      WishListProductsResponse.refetch();
    }
    catch(e) {
      console.log("exception:", e);
    }
  },[getAccessToken, WishListProductsResponse]);

  const populateWishListProducts = useCallback(async (productList) => {
    if(!wishListInitiated)  return;
    
    console.log("populateWishListProducts:");
    console.log("candidate wishListProducts:", productList);
    console.log("wishListProducts:", wishListProducts);

    const productListMap = {};
    for(const item of productList) {
      if(item.product.product_id) {
        productListMap[item.product.product_id] = true;
      }
    }
    const unsavedItems = [];
    for (const item of wishListProducts) {
      if(!item.id) {
        if(!(item.product.product_id in productListMap)) {
          unsavedItems.push(item);
        }
      }
    }
    const updatedWishlist = [...productList, ...unsavedItems];

    console.log('wishlist unsavedItems:', unsavedItems);
    console.log("wishlist updatedWishlist:", updatedWishlist);
    
    if(!arraysAreEqual(updatedWishlist, wishListProducts)) {
      localStorage.setItem('LOCAL_WISHLIST', JSON.stringify(updatedWishlist));
      setWishListProducts(updatedWishlist);
    }
    else {
      console.log("wishListProducts and updatedWishlist are identical.");
    }
    saveUnsavedWishlistItems(updatedWishlist);
  }, [wishListProducts, saveUnsavedWishlistItems, wishListInitiated]);

  useEffect(() => {
    try{
      if(WishListProductsResponse.data && WishListProductsResponse.data.data && WishListProductsResponse.data.data.length > 0) {
        console.log("remote wishlist loaded:", WishListProductsResponse.data.data);
        populateWishListProducts(WishListProductsResponse.data.data);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }, [WishListProductsResponse, populateWishListProducts]);

  useEffect(() => {
    const localWishlist = JSON.parse(localStorage.getItem('LOCAL_WISHLIST'));
    console.log("localWishlist inited:", localWishlist);

    if(localWishlist && localWishlist.length > 0) {
      setWishListProducts(localWishlist);
    }
  }, []);

  useEffect(() => {
    console.log("wishListProducts inited :", wishListProducts);
    for (const wishListItem of wishListProducts) {
      console.log(wishListItem);
      if (wishListItem.product.product_id === currentProduct.product_id) {
        setProductIsInWishList(true);
        return;
      }
    }
    setProductIsInWishList(false);
  }, [wishListProducts, currentProduct]);

  const addProductInRemoteWishlist = async (productId) => {
    console.log("addProductInRemoteWishlist");
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      try{
        const res = await axiosInstance.get(`product/wishlist/add/${productId}/`, config);
        
        console.log("addProductInRemoteWishlist response:", res);
        WishListProductsResponse.refetch();
      }
      catch(e) {
        console.log("exception:", e);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }

  const deleteProductFromRemoteWishlist = async (productId) => {
    console.log("deleteProductFromRemoteWishlist");
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      try{
        const res = await axiosInstance.get(`product/wishlist/delete/${productId}/`, config);
        
        console.log("deleteProductFromRemoteWishlist response:", res);
        WishListProductsResponse.refetch();
      }
      catch(e) {
        console.log("exception:", e);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }

  const addToWishList = async () => {
    console.log("wishlistButtonClicked");

    if(productIsInWishList) {
      const updatedWishlist = wishListProducts.filter(item => (item.product.product_id !== currentProduct.product_id));
      setWishListProducts(updatedWishlist);

      localStorage.setItem('LOCAL_WISHLIST', JSON.stringify(updatedWishlist));
      deleteProductFromRemoteWishlist(currentProduct.product_id);
    }
    else {
      const updatedWishlist = [...wishListProducts, {'product':currentProduct, }]
      setWishListProducts(updatedWishlist);

      localStorage.setItem('LOCAL_WISHLIST', JSON.stringify(updatedWishlist));
      addProductInRemoteWishlist(currentProduct.product_id);
    }
  }

  useEffect(() => {
    console.log("wishListProducts updated:", wishListProducts);
    if(wishListProducts && wishListProducts.length > 0) {
      setWishListInitiated(true);
      setWishlistItemCount(wishListProducts.length);
    }
    if(wishListProducts && wishListInitiated) {
      setWishlistItemCount(wishListProducts.length);
    }
  }, [wishListProducts]);

  useEffect(() => {
    if(WishListProductsResponse.data && WishListProductsResponse.data.data && WishListProductsResponse.data.data.length > 0) {
      console.log("wishlistInitiated : remote wishlist : ", WishListProductsResponse.data.data);
      populateWishListProducts(WishListProductsResponse.data.data);
    }
  }, [wishListInitiated]);
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------


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
    if (!cartInitiated) return;
    
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

  useEffect(() => {
    for(const item of cartProducts) {
      if(item.product.product_id === currentProduct.product_id && item.size === selectedSize) {
        setSelectedSizeInCart(true);
        return;
      }
    }
    setSelectedSizeInCart(false);
  }, [selectedSize, cartProducts, currentProduct]);
  

  const addProductInRemoteCart = async (cartItem) => {
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

  const addToCart = () => {
    if(selectedSize === "-") {
      window.scrollTo({
        top: 60,
        behavior: 'smooth'
      });
      if(!sizeNotSelected) {
        setSizeNotSelected(true);
      }
      return;
    }
    const newItem = {'product':currentProduct, 'size':selectedSize, 'count':"1"};    
    const updatedCartlist = [...cartProducts, newItem]
    setCartProducts(updatedCartlist);

    localStorage.setItem('LOCAL_CARTLIST', JSON.stringify(updatedCartlist));
    addProductInRemoteCart(newItem);
  }

  useEffect(() => {
    if(cartProducts && cartProducts.length > 0) {
      setCartInitiated(true);
      setCartItemCount(cartProducts.length);
    }
  }, [cartProducts]);

  useEffect(() => {
    if(CartProductsResponse.data && CartProductsResponse.data.data && CartProductsResponse.data.data.length > 0) {
      console.log("cartInitiated : remote cartList : ", CartProductsResponse.data.data);
      populateCartProducts(CartProductsResponse.data.data);
    }
  }, [cartInitiated]);
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  

  console.log("Product page is being loaded");

  return (
    <div className="product-page-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

    <div className="product-image-slider">
      <ImageSlider productId={currentProduct.product_id}/>
    </div>

    <div className="product-body">
      <h1 className="product-page-title">
        {currentProduct && `${currentProduct.product_name}`}
      </h1>

      <div className="product-page-rating-container">
        <div className="product-page-rating">
          {/* Full stars */}
          {[...Array(Math.floor(productRating))].map((_, index) => (
            <i key={index} className="fa fa-star" aria-hidden="true"></i>
          ))}

          {/* Half star */}
          {productRating % 1 !== 0 && <i className="fa fa-star-half-stroke" aria-hidden="true"></i>}

          {/* Empty stars */}
          {[...Array(5 - Math.ceil(productRating))].map((_, index) => (
            <i key={index} className="fa-regular fa-star" aria-hidden="true"></i>
          ))}
        </div>
      </div>

      <div className="product-page-price-container">
        <span className="product-page-discount-price">৳{currentProduct.product_selling_price - ((currentProduct.product_selling_price * currentProduct.product_discount) / 100)}</span>
        <span className="product-page-selling-price">৳{currentProduct.product_selling_price}</span>
        <span className="product-page-saving">Save ৳{currentProduct.product_selling_price - (currentProduct.product_selling_price - ((currentProduct.product_selling_price * currentProduct.product_discount) / 100))}</span>
        <span className="product-page-discount-percentage">({parseInt(currentProduct.product_discount)}% off)</span>
      </div>

      <h1 className={`product-page-title ${sizeNotSelected ? "size-not-selected" : ""}`} style={{marginTop: "18px", marginBottom: "18px"}}>
        Select Size
      </h1>

      <div className="product-size-container">
      {currentProduct.product_stock && Object.entries(currentProduct.product_stock).map(([size, quantity]) => (
        <div
          key={size}
          className={`size-name ${selectedSize === size ? 'selected' : ''} ${quantity === 0 ? 'stock-out' : ''}`}
          onClick={() => setSelectedSize(size)}>
          {size}
        </div>
      ))}
      </div>

      <div className="card-container">
        <div
          className="product-category-edit-container"
          style={{ maxWidth: "600px", marginTop: "0px" }}>
          
          <div className="product-description-container">
            <hr className="product-description-hzline" />
            <span className="product-description-title">Description</span>
            <hr className="product-description-hzline" />

            <div className="product-description-text">
              {currentProduct?.product_description?.description
                ?.split("\n")
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <div className="product-description-specification-container">
              <span className="product-description-specification-title">
                Detailed Specification
              </span>
              <hr className="product-description-hzline" />
              <ul>
                {currentProduct?.product_description?.specification
                  ?.split("\n")
                  .map((line, index) =>
                    line ? <li key={index}>{line}</li> : ""
                  )}
              </ul>
            </div>
          </div>
          <div
            className="product-description-container"
            style={{ marginLeft: 0 }}
          >
            <span className="product-description-specification-title">
              Size chart - In inches
            </span>
            <span
              style={{ marginLeft: "10px", fontWeight: 500, fontSize: "0.8em" }}
            >
              {"(Expected Deviation < 3%)"}
            </span>

            {currentProduct.product_size_chart && (
                <table className="product-size-chart-table">
                  <thead>
                    <tr>
                      {Object.keys(currentProduct.product_size_chart?.size_chart[0]).map(
                        (header) => (
                          <th
                            className="product-size-chart-table-cell"
                            key={header}
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentProduct.product_size_chart?.size_chart.map(
                      (sizeInfo, sizeIndex) => (
                        <tr key={sizeIndex}>
                          {Object.values(sizeInfo).map((value, idx) => (
                            <td
                              className="product-size-chart-table-cell"
                              key={idx}
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {productReviews && productReviews.length > 0 && (
        <div className="product-review-container">
          <h1>Rating & Reviews</h1>
          <div className="product-review-rating-summary">
            <div className="product-review-rating-number">
              <h2>{productRating.toFixed(2)}</h2>
              <p>{productReviews.length} ratings</p>
            </div>
            <div className="product-review-rating-bars">
              <div className="product-review-rating-bar">
                <span className="stars">★★★★★</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${fiveStarPercentage()}%` }}></div>
                </div>
                <span className="product-review-count">{fiveStarCount()}</span>
              </div>
              <div className="product-review-rating-bar">
                <span className="stars"><b style={{opacity: 0}}>★</b>★★★★</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${fourStarPercentage()}%` }}></div>
                </div>
                <span className="product-review-count">{fourStarCount()}</span>
              </div>
              <div className="product-review-rating-bar">
                <span className="stars"><b style={{opacity: 0}}>★★</b>★★★</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${threeStarPercentage()}%` }}></div>
                </div>
                <span className="product-review-count">{threeStarCount()}</span>
              </div>
              <div className="product-review-rating-bar">
                <span className="stars"><b style={{opacity: 0}}>★★★</b>★★</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${twoStarPercentage()}%` }}></div>
                </div>
                <span className="product-review-count">{twoStarCount()}</span>
              </div>
              <div className="product-review-rating-bar">
                <span className="stars"><b style={{opacity: 0}}>★★★★</b>★</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${oneStarPercentage()}%` }}></div>
                </div>
                <span className="product-review-count">{oneStarCount()}</span>
              </div>
            </div>
          </div>
          <h2>{productReviews.length} Review{productReviews.length > 1 ? 's' : ''}</h2>
          <div className="product-reviews-list">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {productReviews.length > 3 &&
              <div className="product-reviews-show-more">
                <button className="product-reviews-show-more-button" onClick={() => {
                  setvisibleReviewCount((prv) => {
                    if(visibleReviewCount >= productReviews.length) return 3;
                    return prv + 5;
                  })
                }}>
                  <span className="product-reviews-show-more-down-arrows">
                    {
                      visibleReviewCount >= productReviews.length ? 
                        <i class="fa fa-chevron-up" aria-hidden="true"></i> : 
                        <i class="fa fa-chevron-down" aria-hidden="true"></i>
                    }
                  </span> {visibleReviewCount >= productReviews.length ? 'Show Less' : 'Show More'}
                </button>
              </div>
            }
          </div>
        </div>
      )}

      <div className={`product-fixed-bar-container ${selectedSizeInCart ? "product-checkout" : "" }`}>
        
        <span onClick={addToWishList} className={productIsInWishList ? "wishlisted-product" : ""}>
          <i class="fa fa-heart" aria-hidden="true"></i>
        </span>
        <span className="divider">|</span>
        {selectedSizeInCart ? (
          <Link to="/cart" style={{color: "white", textDecoration:"none"}}>Checkout</Link>
        ) : (
          <span onClick={addToCart}>Add to Cart</span>
        )}
      </div>
    </div>
  );
}

export default React.memo(ProductPage);
