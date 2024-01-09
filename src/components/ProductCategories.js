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
        },
        {
            'title': 'Jeans',
            'description': 'Classic and trendy jeans for a fashionable look.',
            'cover_picture': 'jeans_cover.jpg',
            'profile_picture': 'jeans_profile.jpg',
            'show_in_home_page': true,
        },
        {
            'title': 'Sweaters',
            'description': 'Warm and cozy sweaters to stay comfortable in winter.',
            'cover_picture': 'sweaters_cover.jpg',
            'profile_picture': 'sweaters_profile.jpg',
            'show_in_home_page': true,
        },
        {
            'title': 'Activewear',
            'description': 'Sporty and functional activewear for an active lifestyle.',
            'cover_picture': 'activewear_cover.jpg',
            'profile_picture': 'activewear_profile.jpg',
            'show_in_home_page': false,
        },
    ]

    const [productCategories, setProductCategories] = useState([]);

    useEffect(() => {
        setProductCategories(demoProductCategories);
    }, []);

  const updateCategoryOrder = () => {
    console.log('update category order');
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

        <div className="product-category-card" onClick={updateCategoryOrder}>
          <i className="fa fa-refresh" aria-hidden="true"></i>
          <p>Update Category Order</p>
        </div>


        <div className="product-management-container">
            
        </div>
      </div>
      <br /><br /><br />
    </div>
  );
}

export default React.memo(ProductManagement);