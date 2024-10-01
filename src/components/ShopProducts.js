import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate, Link, useParams } from 'react-router-dom';

import { Image } from "./Image";


const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function ShopProducts() {  
  const navigate = useNavigate();
  const { query } = useParams(); 
  
  const [productList, setProductList] = useState([]);
  const [searchOnGoing, setSearchOnGoing] = useState(false);

  const shopProductsQuery = useQuery(`SHOP_PRODUCTS_${query}`, async () => {
    try{
      setSearchOnGoing(true);
      const data = await axiosInstance.get(`product/shop/${query}`);
      setSearchOnGoing(false);
      return data;
    }
    catch(e) {
      setSearchOnGoing(false);
      return {'data':[]};
    }
  });

  useEffect(() => {
    try{
      if(shopProductsQuery.data && shopProductsQuery.data.data) {
        setProductList(shopProductsQuery.data.data);
      }
    }
    catch(e) {
      console.log("Exception:", e);
    }
  }, [shopProductsQuery.data]);


  return (
    <div className="homepage-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

      {searchOnGoing && (<div class="lds-ripple"><div></div><div></div></div>)}

      <h2 className="category-title">Shop</h2>

      <div className="search-product-card-container"> 
        {(productList && productList.length > 0) && 
            productList.map((product) => {
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

export default React.memo(ShopProducts);