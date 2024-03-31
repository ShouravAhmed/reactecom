import React, { useState, useEffect } from "react";
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


const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function Home() {
  const navigate = useNavigate();

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
                <div className="category-cover">
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
                        <div className="product-two-card">
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
                      <div className="product-three-card">
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