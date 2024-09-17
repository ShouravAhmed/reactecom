import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';
import { Image } from './Image';

import { DataContext } from '../contexts/DataContext';
import Axios from 'axios';


const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});


function ProductCategoryManager() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const {getAccessToken, showToast} = authData;

  const { dataContextData } = useContext(DataContext);
  const {getProductCategories, updateProductCategories, setIsLoading} = dataContextData;

  const [productCategories, setProductCategories] = useState([]);

  const populateProductCategories = async () => {
    setIsLoading(true);
    const categories = await getProductCategories();
    setIsLoading(false);
    if(!categories) return;
    const updatedCategories = categories.map((category) => ({
      ...category,
    }));
    setProductCategories(updatedCategories);
  };

  useEffect(() => {
    const run = async () => {
      populateProductCategories();
    }
    run();
    setIsLoading(false);
  }, []);

  const updateCategoryOrder = async (title, direction) => {
    let n = productCategories.length;
    let updatedCategories = [...productCategories];

    for(let i = 0; i < n; i++) {
      if(productCategories[i]['title'] === title) {
        if(i && direction === 'up') {
          let categoryA = {...productCategories[i]};
          categoryA.category_order -= 1;
          let categoryB = {...productCategories[i-1]};
          categoryB.category_order += 1;

          updatedCategories[i-1] = categoryA;
          updatedCategories[i] = categoryB;
        }
        else if(i + 1 < n  && direction === 'down') {
          let categoryA = {...productCategories[i+1]};
          categoryA.category_order -= 1;
          let categoryB = {...productCategories[i]};
          categoryB.category_order += 1;

          updatedCategories[i] = categoryA;
          updatedCategories[i+1] = categoryB;
        }
      }
    }
    setProductCategories(updatedCategories);
  }

  const saveCategoryOrder = async () => {
    const order = {}
    for(let category of productCategories) {
      order[category.title] = category.category_order
    }
    
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };
    const data = {'order': order,};
    console.log('order: ', data);
    
    try{
      setIsLoading(true);
      const response = await axiosInstance.post(
        'product/category/update-order/',
        data, 
        config
      );
      console.log('update category order response: ', await response.data);
      if ('data' in response) {
        updateProductCategories(await response.data);
      }
      setIsLoading(false);
      const toast_message = `Order Updated Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
  }

  console.log('product Category page is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Product Categories</h1>
      
      <div className="card-container">

        <div className="product-category-card" onClick={() => navigate('create')}  style={{cursor: 'pointer'}}>
          <i className="fa fa-plus" aria-hidden="true"></i>
          <p>Create Categories</p>
        </div>

        <div className="product-category-card" onClick={saveCategoryOrder}  style={{cursor: 'pointer'}}>
          <i className="fa fa-refresh" aria-hidden="true"></i>
          <p>Update Category Order</p>
        </div>

        <div className="product-category-manager-container">
            
            {productCategories && productCategories.map((category) => (
              <div key={category.category_order} className="product-category-row">
            
                <div style={{width: '25px', marginRight:'5px', fontSize: '1.1em'}}>
                  <span style={{textAlign: 'left'}}>{category.category_order}.</span>
                </div>
            
                <div className="product-category-image" onClick={() => navigate(category.slug, {state: category})} style={{cursor: 'pointer'}}>
                  <Image imageUrl={`${process.env.REACT_APP_BACKEND_SERVER}/${category.profile_image}`} 
                    altText={category.title} 
                    blurHash={category.profile_image_blurhash}
                    width={100}
                    height={100}
                    BlurHashWidth={100}
                    blurHashHeight={100}
                    />
                </div>
            
                <div className="product-category-details" onClick={() => navigate(category.slug, {state: category})}  style={{cursor: 'pointer'}}>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>

                <div className="product-category-buttons">
                  <button onClick={() => updateCategoryOrder(category.title, 'up')}>
                    <i className="fa fa-chevron-up" aria-hidden="true"></i>
                  </button>
                  <button onClick={() => updateCategoryOrder(category.title, 'down')}>
                    <i className="fa fa-chevron-down" aria-hidden="true"></i>
                  </button>
                </div>
            
              </div>
            ))}
            
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCategoryManager);