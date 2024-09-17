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
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function WishListPage() {           
  const navigate = useNavigate();
   
  const { authData } = useContext(AuthContext);
  const { getAccessToken, } = authData;


  const {dataContextData}  = useContext(DataContext);
  const { setWishlistItemCount } = dataContextData;
  
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

  const removeFromWishList = async (productId) => {
    console.log("removeFromWishList");
      const updatedWishlist = wishListProducts.filter(item => (item.product.product_id !== productId));
      setWishListProducts(updatedWishlist);

      localStorage.setItem('LOCAL_WISHLIST', JSON.stringify(updatedWishlist));
      deleteProductFromRemoteWishlist(productId);
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

  useEffect(() => {
    const f = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setWishListInitiated(true);
    }
    f();
  }, [])
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  

  console.log("WishList page is being loaded");

  return (
    <div className="cart-page-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link> 

      <div className="cart-page-title">
        <span className="heart-icon">
          <i className="fa fa-heart" aria-hidden="true"></i>
        </span>
        <span>My WishList</span>
      </div>

      {wishListProducts && wishListProducts.map((wishlistItem) => 
        <div className="wishlist-product-container" onClick={() => {navigate(`/product/${wishlistItem.product.product_id}`, {'state':wishlistItem.product})}}>
          <div  className="wishlist-product-image" > 
            <Image 
              imageUrl={`${process.env.REACT_APP_BACKEND_SERVER}/${wishlistItem.product.profile_image}`}
              altText={wishlistItem.product.product_name}
              blurHash={wishlistItem.product.profile_image_blurhash}
              width={"100%"}
              height={"120px"}
              blurHashWidth={"100%"}
              blurHashHeight={"120px"}
              borderRadius={"8px"}
            />
          </div>
          <div className="cart-product-details">
            <div className="cart-product-row">
              <div className="cart-product-name">{wishlistItem.product.product_name}</div>
              <div className="cart-delete-button" onClick={(event) => {
                event.stopPropagation();
                removeFromWishList(wishlistItem.product.product_id);
              }}>
                <i className="fa fa-trash" aria-hidden="true"></i>
              </div>
            </div>
            <div className="cart-product-row">
              <div className="product-prices">
                <span className="discount-price">৳{wishlistItem.product.product_selling_price - ((wishlistItem.product.product_selling_price * wishlistItem.product.product_discount) / 100)}</span>
                <span className="real-price">৳{wishlistItem.product.product_selling_price}</span>
                <span className="saving-price">{parseInt(wishlistItem.product.product_discount)}% off</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WishListPage);
