import React, { useContext, useState, useEffect, useRef } from "react";
import { debounce } from 'lodash';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate } from 'react-router-dom';

import { Image } from "./Image";

import { AuthContext } from '../contexts/AuthContext';

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function SearchManager() {  
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const [productList, setProductList] = useState([]);
  const [searchBoxText, setSearchBoxText] = useState("");
  const [searchOnGoing, setSearchOnGoing] = useState(false);

  const delayedSearchRef = useRef(null);
 
  const searchProducts = async (searchText) => {
    console.log("searching for:", searchText);
    try{
      setSearchOnGoing(true);
      try{
        const response = await axiosInstance.get(`product/search/?search=${searchText}`);
        if(response.data) {
          setProductList(response.data);
        }
      }
      catch (e) {
        console.log("Exception:", e);
        showToast("Your internet connection may not stable!");
      }
      setSearchOnGoing(false);
    }
    catch (e) {
      setSearchOnGoing(false);
      console.log("Exception:", e);
    }
  }

  useEffect(() => {
    if (!delayedSearchRef.current) {
      delayedSearchRef.current = debounce((searchText) => {
        searchProducts(searchText);
      }, 600);
    }
    return () => {
      delayedSearchRef.current.cancel();
    };
  }, []); 

  const handleInputChange = (e) => {
    const searchText = e.target.value;
    setSearchBoxText(searchText);
    delayedSearchRef.current(searchText); 
  };

  useEffect(() => {
    setSearchOnGoing(false);
  }, []);


  console.log('search manager loaded');

  return (
    <div className="homepage-container">

        <div className="search-input-bar">
            <i className="fa fa-search search-input-icon" aria-hidden="true"></i>
            <input
                type="text"
                className="search-input"
                placeholder="Search For Products"
                value={searchBoxText}
                onChange={handleInputChange}
            />
        </div>

        {searchOnGoing && (<div class="lds-ripple"><div></div><div></div></div>)}

        <div className="search-product-card-container"> 
        {(productList && productList.length > 0) ? 
            productList.map((product) => {
                return (
                    <div className="search-product-card" onClick={() => {navigate('/product-page', {'state':product})}}>
                        <div className="search-product-image">
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
            }) :
            (<div className="no-product-found">Searched Products</div>)
        }
        </div>
        
        <br /><br /><br />
    </div>
  );
}

export default SearchManager;