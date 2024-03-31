import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import { DataContext } from '../contexts/DataContext';

import { useQuery } from 'react-query'
import Axios from 'axios';


const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/product/",
});


function ProductDescription() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { authData } = useContext(AuthContext);
  const {getAccessToken, showToast} = authData;

  const { dataContextData } = useContext(DataContext);
  const {getProductCategories, updateProductCategories, setIsLoading} = dataContextData;

  const [showPopup, setShowPopup] = useState(false);

  const [updatingDescription, setupdatingDescription] = useState(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupDescription, setPopupDescription] = useState('');
  const [popupSpecification, setPopupSpecification] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  

  const productDescriptionResponse = useQuery(`get-products-description-by-category-${state.slug}`, async () => {
    console.log(`get-products-description-by-category-${state.slug}`);
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axiosInstance.get(`description/category/${state.title}`, config);
  });

  const createNewDescription = async () => {
    console.log('create new description');
    
    setupdatingDescription(null);
    setPopupTitle("");
    setPopupDescription("");
    setPopupSpecification('');
    setAdminPassword('');
    setShowPopup(true);
  }

  const updateSizeChart = async (item) => {
    console.log(item);

    setupdatingDescription(item);
    setPopupTitle(item.title);
    setPopupDescription(item.description);
    setPopupSpecification(item.specification);
    setAdminPassword(''); 
    setShowPopup(true);
  }

  const closePopup = () => {
    setupdatingDescription(null);
    setPopupTitle("");
    setPopupDescription("");
    setPopupSpecification('');
    setAdminPassword('');
    setShowPopup(false);
  };

  const saveProductDescription = async () => {
    console.log('saveProductDescription');
    
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
    };

    const data = {'admin_password':adminPassword,};
    if(updatingDescription) {
      data['description_title'] = updatingDescription.title;
    }
    data['description_data'] = {'product_category': state.id, 'title': popupTitle, 'description': popupDescription, 'specification': popupSpecification};
    
    console.log(data);

    setIsLoading(true);
    try{
      const response = await axiosInstance.post("description/", data, config);
      console.log('product description response: ', await response.data);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch(e){
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    setIsLoading(false);

    productDescriptionResponse.refetch();
    closePopup();
  }

  const deleteProductDescription = async () => {
    console.log('delete Size Chart');

    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
    };

    const data = {'admin_password':adminPassword,};
    if(updatingDescription) {
      data['description_title'] = updatingDescription.title;
    }
    else {
      return;
    }

    setIsLoading(true);
    try{
      const response = await axiosInstance.post("description/delete/", data, config);
      console.log('description response: ', await response.data);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch(e){
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    setIsLoading(false);

    productDescriptionResponse.refetch();
    closePopup();
  }

  console.log('product description page is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">{state.title} : Description</h1>
  
      <div className="card-container">
        <div className="product-category-card" onClick={createNewDescription} style={{ cursor: 'pointer' }}>
          <i className="fa fa-plus" aria-hidden="true"></i>
          <p>Create New Description</p>
        </div>
  
        <div className="product-category-manager-container">
          {!productDescriptionResponse.isLoading && productDescriptionResponse.data.data.map((item, index) => (
            <div key={index} className="product-size-chart-row" onClick={() => updateSizeChart(item)} style={{ cursor: 'pointer' }}>
  
              <div className="product-size-chart-details">
                <h3>{item.title}</h3>
              </div>
  
              <div style={{textAlign:'left'}}>
                {item.description.split('\n').map((part, index) => (
                  <p key={index}>{part}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPopup && 
        <div className="popup-overlay">
          <div className="popup">
            
            <div className="adm-close-button" onClick={closePopup}>
              <i className="close-icon fa fa-times" aria-hidden="true"></i>
            </div>

            <h2 className='item'><i className="fa fa-hashtag" aria-hidden="true"></i> {popupTitle ? popupTitle : 'New Description'}</h2>
            
            <div className="product-category-form-row">
              <input type="text" placeholder="Enter title" value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} name='title' />
            </div>

            <div className="product-category-form-row">
              <textarea placeholder="Enter description" value={popupDescription} onChange={(e) => setPopupDescription(e.target.value)} name='description'></textarea>
            </div>

            <div className="product-category-form-row">
              <textarea placeholder="Enter specification" value={popupSpecification} onChange={(e) => setPopupSpecification(e.target.value)} name='specification'></textarea>
            </div>

            <div style={{display: 'flex', flexDirection:'row', alignItems: 'center' }}>
              <div className="product-category-form-row">
                <input type="password" placeholder="Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} name='admin-password' />
              </div>
              <button onClick={saveProductDescription} className="adm-btn">Save</button>
              {updatingDescription && <button onClick={deleteProductDescription} className="adm-btn">Delete</button>}
            </div>
          </div>
        </div>
      }

      <br/><br/><br/>
    </div>
  );
}

export default React.memo(ProductDescription);