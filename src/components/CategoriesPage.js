import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate, useLocation, Link } from 'react-router-dom';

import { Image } from "./Image";

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function CategoriesPage() {  
  const navigate = useNavigate();

  const [productCategories, setProductCategories] = useState([]);
  const ProductCategoriesResponse = useQuery(`product-categories`, async () => {
      return axiosInstance.get('product/category/');
    }, { 
      staleTime: (60) * (60 * 1000),
      cacheTime: (6 * 60) * (60 * 1000),
    }
  );
  useEffect(() => {
    if(ProductCategoriesResponse.data && ProductCategoriesResponse.data.data) {
      setProductCategories(ProductCategoriesResponse.data.data);
      localStorage.setItem('LOCAL_PRODUCT_CATEGORIES', JSON.stringify(ProductCategoriesResponse.data.data));
    }
  }, [ProductCategoriesResponse.data]);

  useEffect(() => {
    const localProductCategories = localStorage.getItem('LOCAL_PRODUCT_CATEGORIES');
    if(localProductCategories) {
      setProductCategories(JSON.parse(localProductCategories));
    }
  }, []);

  console.log('Categories Page loaded');

  return (
    <div className="homepage-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

        <div className="search-product-card-container"> 
        {(productCategories && productCategories.length > 0) && 
            productCategories.map((category) => {
                return (
                    <div className="category-item-card" key={category.id}>
                        <div className="category-item-image" onClick={() => navigate(`/category/${category.slug}`)}> 
                          <Image 
                            imageUrl={`${process.env.REACT_APP_BACKEND_SERVER}/${category.profile_image}`}
                            altText={category.title}
                            blurHash={category.profile_image_blurhash}
                            width={"100%"}
                            height={"150px"}
                            blurHashWidth={"100%"}
                            blurHashHeight={"150px"}
                            borderRadius={"5px"}
                          />
                        </div>
                        <div className="category-item-name">{category.title}</div>
                    </div>
                );
            })
        }
        </div>
        
        <br /><br /><br />
    </div>
  );
}

export default CategoriesPage;