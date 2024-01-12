import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

    


function ProductManagement() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const {userProfile} = authData;

  const demoProductCategories = [
        {
            'title': 'T-Shirts',
            'description': 'Casual and comfortable T-shirts for all occasions.',
            'cover_picture': 'tshirts_cover.jpg',
            'profile_picture': 'tshirts_profile.jpg',
            'show_in_home_page': true,
            'category_order': 1
        },
        {
            'title': 'Casual Shirt',
            'description': 'Elegant and stylish dresses for any event.',
            'cover_picture': 'dresses_cover.jpg',
            'profile_picture': 'dresses_profile.jpg',
            'show_in_home_page': true,
            'category_order': 2
        },
        {
            'title': 'Jeans',
            'description': 'Classic and trendy jeans for a fashionable look.',
            'cover_picture': 'jeans_cover.jpg',
            'profile_picture': 'jeans_profile.jpg',
            'show_in_home_page': true,
            'category_order': 3
        },
        {
            'title': 'Sweaters',
            'description': 'Warm and cozy sweaters to stay comfortable in winter.',
            'cover_picture': 'sweaters_cover.jpg',
            'profile_picture': 'sweaters_profile.jpg',
            'show_in_home_page': true,
            'category_order': 4
        },
        {
            'title': 'Activewear',
            'description': 'Sporty and functional activewear for an active lifestyle.',
            'cover_picture': 'activewear_cover.jpg',
            'profile_picture': 'activewear_profile.jpg',
            'show_in_home_page': false,
            'category_order': 5
        },
  ]

  const [productCategories, setProductCategories] = useState([]);

  useEffect(() => {
      setProductCategories(demoProductCategories);
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
    console.log("save product categories: ", productCategories);
  }

  console.log('product Category page is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Product Categories</h1>
      
      <div className="card-container">

        <div className="product-category-card" onClick={() => navigate('update')}>
          <i className="fa fa-shopping-bag" aria-hidden="true"></i>
          <p>Create Categories</p>
        </div>

        <div className="product-category-card" onClick={saveCategoryOrder}>
          <i className="fa fa-refresh" aria-hidden="true"></i>
          <p>Update Category Order</p>
        </div>


        <div className="product-category-management-container">
            {productCategories && productCategories.map((category) => (
              <div key={category.id} className="product-category-row">
                <div style={{width: '25px', marginRight:'5px', fontSize: '1.1em'}}>
                  <span style={{textAlign: 'left'}}>{category.category_order}.</span>
                </div>
                <div className="product-category-image">
                  <img src="https://fabrilife.com/image-gallery/638a77dc9c88d-square.jpg" alt={category.title} />
                </div>
                <div className="product-category-details">
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
                <div className="product-category-buttons">
                  <button onClick={() => updateCategoryOrder(category.title, 'up')}>
                    <i class="fa fa-chevron-up" aria-hidden="true"></i>
                  </button>
                  <button onClick={() => updateCategoryOrder(category.title, 'down')}>
                    <i class="fa fa-chevron-down" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      <br /><br /><br />
    </div>
  );
}

export default React.memo(ProductManagement);