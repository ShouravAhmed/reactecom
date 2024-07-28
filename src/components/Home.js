import React, { useState, useEffect, useContext, useCallback } from "react";
import { Blurhash } from "react-blurhash";

import PoloShirtIcon from '../assets/images/polo.png';
import ShirtIcon from '../assets/images/shirt.png';
import TrouserIcon from '../assets/images/trouser.png';
import ShortsIcon from '../assets/images/shorts.png';
import GraphicTshirtIcon from '../assets/images/graphic-tees.png';
import TshirtIcon from '../assets/images/tees.png';
import AccessoriesIcon from '../assets/images/accessories.png';
import OfferIcon from '../assets/images/offer.png';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { Image } from "./Image";
import BannerSlider from "./BannerSlider";

import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';


const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function Home() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, } = authData;

  const {dataContextData}  = useContext(DataContext);
  const { setWishlistItemCount, setCartItemCount } = dataContextData;

  const [banners, setBanners] = useState([]);
  const BannersResponse = useQuery(`banners`, async () => {
    return axiosInstance.get('marketing/banner/');
  }, { 
    staleTime: (60) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });
  useEffect(() => {
    if(!BannersResponse.isLoading && BannersResponse.data && BannersResponse.data.data) {
      setBanners(BannersResponse.data.data);
      localStorage.setItem('LOCAL_BANNERS', JSON.stringify(BannersResponse.data.data));
    }
  }, [BannersResponse]);
  useEffect(() => {
    const localBanners = localStorage.getItem('LOCAL_BANNERS');
    if(localBanners) {
      setBanners(JSON.parse(localBanners));
    }
  }, []);

  const [productCategories, setProductCategories] = useState([]);
  const ProductCategoriesResponse = useQuery(`product-categories`, async () => {
      return axiosInstance.get('product/category/');
    }, { 
      staleTime: (60) * (60 * 1000),
      cacheTime: (6 * 60) * (60 * 1000),
    }
  );
  useEffect(() => {
    if(!ProductCategoriesResponse.isLoading && ProductCategoriesResponse.data && ProductCategoriesResponse.data.data) {
      setProductCategories(ProductCategoriesResponse.data.data);
      localStorage.setItem('LOCAL_PRODUCT_CATEGORIES', JSON.stringify(ProductCategoriesResponse.data.data));
    }
  }, [ProductCategoriesResponse]);
  useEffect(() => {
    const localProductCategories = localStorage.getItem('LOCAL_PRODUCT_CATEGORIES');
    if(localProductCategories) {
      setProductCategories(JSON.parse(localProductCategories));
    }
  }, []);

  const [homePageProducts, setHomePageProducts] = useState({});
  const HomePageProductsResponse = useQuery(`homepage-products`, async () => {
      return axiosInstance.get('product/homepage-products/');
    }, { 
      staleTime: (60) * (60 * 1000),
      cacheTime: (6 * 60) * (60 * 1000),
    }
  );
  useEffect(() => {
    if(!HomePageProductsResponse.isLoading && HomePageProductsResponse.data && HomePageProductsResponse.data.data) {
      setHomePageProducts(HomePageProductsResponse.data.data);
      localStorage.setItem('LOCAL_HOME_PAGE_PRODUCTS', JSON.stringify(HomePageProductsResponse.data.data));
    }
  }, [HomePageProductsResponse]);
  useEffect(() => {
    const localHomePageProducts = localStorage.getItem('LOCAL_HOME_PAGE_PRODUCTS');
    if(localHomePageProducts) {
      setHomePageProducts(JSON.parse(localHomePageProducts));
    }
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
  
  const WishListProductsResponse = useQuery(`wishlist-products`, async () => {
    try{
      console.log('=>> remote : >> wish refatching');
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const data = await axiosInstance.get('product/wishlist/', config);
      console.log('=>> remote : >> wish refatched data:', data);
      return data;
    }
    catch(e) {
      console.log('=>> remote : >> wish refatched failed: ', e);
      return {'data':[]};
    }
  }, { 
    staleTime: (60) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });

  const saveUnsavedWishlistItems = useCallback(async (wishlist) => {
    console.log('=>> remote : wishlist saveUnsavedWishlistItems:', wishlist);
    if(wishlist === null) wishlist = [];

    const unsavedWishlistItems = [];
    const savedWishlistItems = [];
    for (const item of wishlist) {
      if (!item.id) {
        unsavedWishlistItems.push(item.product.product_id);
      }
      else {
        savedWishlistItems.push(item.product);
      }
    }
    
    console.log('wishlist unsavedWishlistItems:', unsavedWishlistItems);
    if(!unsavedWishlistItems || unsavedWishlistItems.length === 0) {

      if(!savedWishlistItems || savedWishlistItems.length === 0) {
        console.log("=>> remote : refatching WishListProductsResponse");
        WishListProductsResponse.refetch();
      }
      return;
    }
    
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const res = await axiosInstance.post('product/wishlist/batch-add/',
        {'wishlist':unsavedWishlistItems,}, 
        config
      );
      console.log("batch wishlist save response:", res);

      if(res.data.status === 'OK') {
        localStorage.setItem('LOCAL_WISHLIST', JSON.stringify(savedWishlistItems));
        WishListProductsResponse.refetch();
      }
    }
    catch(e) {
      console.log("exception:", e);
    }
  }, [getAccessToken]);

  useEffect(() => {
    const localWishlist = JSON.parse(localStorage.getItem('LOCAL_WISHLIST'));
    console.log("localWishlist inited:", localWishlist);

    saveUnsavedWishlistItems(localWishlist);
  }, [saveUnsavedWishlistItems]);
  

  const CartProductsResponse = useQuery(`cart-products`, async () => {
    try{
      console.log('=>> remote : >> cart refatching');
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const data = await axiosInstance.get('product/cart/', config);
      console.log('=>> remote : >> cart refatched data:', data);
      return data;
    }
    catch(e) {
      console.log('=>> remote : >> cart refatched failed: ', e);
      return {'data':[]};
    }
  }, { 
    staleTime: (60) * (60 * 1000),
    cacheTime: (6 * 60) * (60 * 1000),
  });

  const saveUnsavedCartItems = useCallback(async (cartItems) => {
    console.log('=>> saveUnsavedCartItems: extracting unsaved items from cartlist:', cartItems);
    if(cartItems === null) cartItems = [];

    const unsavedCartItems = [];
    const savedCartItems = [];
    for (const item of cartItems) {
      if (!item.id) {
        unsavedCartItems.push(item);
      }
      else {
        savedCartItems.push(item);
      }
    }
    
    console.log('cartItems unsavedCartItems:', unsavedCartItems);
    if(!unsavedCartItems || unsavedCartItems.length === 0) {

      if(!savedCartItems || savedCartItems.length === 0) {
        console.log("=>> remote : refatching CartProductsResponse");
        CartProductsResponse.refetch();
      }
      return;
    }
    
    try {
      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const res = await axiosInstance.post('product/cart/batch-add/',
        {'cart':unsavedCartItems,}, 
        config
      );
      console.log("batch cart save response:", res);
      
      if(res.data.status === 'OK') {
        localStorage.setItem('LOCAL_CARTLIST', JSON.stringify(savedCartItems));
        CartProductsResponse.refetch();
      }
    }
    catch(e) {
      console.log("exception:", e);
    }
  }, [getAccessToken]);

  useEffect(() => {
    const localCartlist = JSON.parse(localStorage.getItem('LOCAL_CARTLIST'));
    console.log("localCartlist inited:", localCartlist);

    saveUnsavedCartItems(localCartlist);
  }, [saveUnsavedCartItems]);



  const getUpdatedProductList = (remoteProductList, localString) => {
    if(remoteProductList === null) remoteProductList = [];
    let localProductList = JSON.parse(localStorage.getItem(localString));
    if(localProductList === null) localProductList = [];

    const savedItems = {};
    for(const item of remoteProductList) {
      if(item.product.product_id) {
        savedItems[item.product.product_id] = true;
      }
    }
    const unsavedItems = [];
    for (const item of localProductList) {
      if(!item.id) {
        if(!(item.product.product_id in savedItems)) {
          unsavedItems.push(item);
        }
      }
    }
    const updatedProductlist = [...remoteProductList, ...unsavedItems];
    if(!arraysAreEqual(updatedProductlist, localProductList)) {
      return updatedProductlist;
    }
    return [];
  }

  useEffect(() => {
    if(CartProductsResponse.data && CartProductsResponse.data.data && CartProductsResponse.data.data.length > 0) {
      console.log("=>> Home : remote cartList loaded:", CartProductsResponse.data.data);
      
      const updatedProductlist = getUpdatedProductList(CartProductsResponse.data.data, 'LOCAL_CARTLIST');
      
      if(updatedProductlist.length > 0) {
        localStorage.setItem('LOCAL_CARTLIST', JSON.stringify(updatedProductlist));
        setCartItemCount(updatedProductlist.length);
      }
    }
  }, [CartProductsResponse]);

  useEffect(() => {
    if(WishListProductsResponse.data && WishListProductsResponse.data.data && WishListProductsResponse.data.data.length > 0) {
      console.log("=>> remote : wishlist loaded:", WishListProductsResponse.data.data);
      
      const updatedProductlist = getUpdatedProductList(WishListProductsResponse.data.data, 'LOCAL_WISHLIST');
      
      if(updatedProductlist.length > 0) {
        localStorage.setItem('LOCAL_WISHLIST', JSON.stringify(updatedProductlist));
        setWishlistItemCount(updatedProductlist.length);
      }
    }
  }, [WishListProductsResponse]);
  
  return (
    <div className="homepage-container">

      <div className="search-bar" onClick={() => navigate("search")}>
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </div>

      <div className="banner">
        <BannerSlider slides={banners}/>
      </div>

      <div className="categories-container1">
        <div className="category-card">
          <img src={PoloShirtIcon} alt="Polo"/>
          <p>Polo</p>
        </div>
        <div className="category-card">
          <img src={ShirtIcon} alt="Polo"/>
          <p>Shirts</p>
        </div>
        <div className="category-card">
          <img src={TrouserIcon} alt="Polo"/>
          <p>Trouser</p>
        </div>
        <div className="category-card">
          <img src={TshirtIcon} alt="Polo"/>
          <p>Tees</p>
        </div>
      </div>

      <div className="categories-container2">
        <div className="category-card">
          <img src={GraphicTshirtIcon} alt="Polo"/>
          <p>Graphic Tees</p>
        </div>
        <div className="category-card">
          <img src={ShortsIcon} alt="Polo"/>
          <p>Shorts</p>
        </div>
        <div className="category-card">
          <img src={AccessoriesIcon} alt="Polo"/>
          <p>Accessories</p>
        </div>
        <div className="category-card category-card-offer">
          <img src={OfferIcon} alt="Polo"/>
          <p>Offer</p>
        </div>
      </div>

      {
        productCategories && productCategories?.map((category) => {
          return (
            <div className="category-product-list" key={category.id}>
              <div className="category-description"> 
                <h2 className="category-title">{category.title}</h2>
                <div className="category-cover" onClick={() => navigate('category-products', {state: category})}>
                  <Image 
                    imageUrl={'http://127.0.0.1:8000/' + category.cover_image}
                    altText={category.title}
                    blurHash={category.cover_image_blurhash}
                    width={"100%"}
                    height={"190px"}
                    blurHashWidth={"100%"}
                    blurHashHeight={"190px"}
                    borderRadius={"10px"}/>
                </div>
              </div>
              
              <div className="product-card-container">        
                {
                  category.two_in_a_row ?
                  (category.title in homePageProducts) && homePageProducts[category.title]?.slice(0, 4).map((product) => {
                    return (
                        <div className="product-two-card" onClick={() => {navigate('/product-page', {'state':product})}}>
                          <div className="product-two-image">
                            <Image 
                              imageUrl={'http://127.0.0.1:8000/' + product.profile_image}
                              altText={product.product_name}
                              blurHash={product.profile_image_blurhash}
                              width={"100%"}
                              height={"150px"}
                              blurHashWidth={"100%"}
                              blurHashHeight={"150px"}
                              borderRadius={"5px"}
                            />
                          </div>
                          <h3 className="product-name">{product.product_name}</h3>
                          <div className="product-prices">
                            <span className="discount-price">৳{product.product_selling_price - ((product.product_selling_price * product.product_discount) / 100)}</span>
                            <span className="real-price">৳{product.product_selling_price}</span>
                            <div className="discount-percentage discount-font-two">{parseInt(product.product_discount)}% off</div>
                          </div>
                        </div>
                    );
                  }) : (
                  category.title in homePageProducts) && homePageProducts[category.title]?.map((product) => {
                    return(
                      <div className="product-three-card" onClick={() => {navigate('/product-page', {'state':product})}}>
                        <div className="product-three-image">
                          <Image 
                            imageUrl={'http://127.0.0.1:8000/' + product.profile_image}
                            altText={product.product_name}
                            blurHash={product.profile_image_blurhash}
                            width={"100%"}
                            height={"100px"}
                            blurHashWidth={"100%"}
                            blurHashHeight={"100px"}
                            borderRadius={"5px"}
                          />
                        </div>
                        <h3 className="product-name">{product.product_name}</h3>
                        <div className="product-prices">
                          <span className="discount-price">৳{product.product_selling_price - ((product.product_selling_price * product.product_discount) / 100)}</span>
                          <span className="real-price">৳{product.product_selling_price}</span>
                          <div className="discount-percentage discount-font-three">{parseInt(product.product_discount)}% off</div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )
        })
      }
      <br /><br /><br />
    </div>
  );
}

export default Home;