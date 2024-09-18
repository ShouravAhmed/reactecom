import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';

import { Image } from "./Image";

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function CategoryProducts() {  
  const navigate = useNavigate();
  const { categorySlug } = useParams(); 
  
  const [categoryProductList, setCategoryProductList] = useState([]);
  const [searchOnGoing, setSearchOnGoing] = useState(false);

  const fetchCategoryProducts = async () => {
    try{
      setSearchOnGoing(true);
      const response = await axiosInstance.get(`product/product/category/${categorySlug}/`);
      setCategoryProductList(response.data);
      setSearchOnGoing(false);
    }
    catch (e) {
      setSearchOnGoing(false);
      console.log("exception: ", e);
    }
  }

  useEffect(() => {
    if(categoryProductList && categoryProductList.length > 0) {
      localStorage.setItem(`LOCAL_CATEGORY_PRODUCTS_${categorySlug}`, JSON.stringify(categoryProductList));
    }
  }, [categoryProductList]);
  
  useEffect(() => {
    const categoryProducts = localStorage.getItem(`LOCAL_CATEGORY_PRODUCTS_${categorySlug}`);
    if(categoryProducts) {
      setCategoryProductList(JSON.parse(categoryProducts));
    }
  }, []);

  useEffect(() => {
    fetchCategoryProducts();
  }, []);


  console.log('Category Produts loaded');

  return (
    <div className="homepage-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

      {searchOnGoing && (<div class="lds-ripple"><div></div><div></div></div>)}

      <h2 className="category-title">
        {categoryProductList && categoryProductList.length > 0 && 
          (categoryProductList[0].product_category.title)
        }
      </h2>

      <div className="search-product-card-container"> 
        {(categoryProductList && categoryProductList.length > 0) && 
            categoryProductList.map((product) => {
                return (
                    <div className="search-product-card" key={product.id} onClick={() => {navigate(`/product/${product.product_id}`, {'state':product})}}>
                        <div className="search-product-image">
                          <Image 
                            imageUrl={`${process.env.REACT_APP_BACKEND_SERVER}/${product.profile_image}`}
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
            })
        }
        </div>
        
        <br /><br /><br />
    </div>
  );
}

export default CategoryProducts;