import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import Axios from 'axios';

import { Image } from './Image';
import { DataContext } from '../contexts/DataContext';



const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/product/",
});

function UpdateProductCategory() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const {getAccessToken, showToast} = authData;

  const { dataContextData } = useContext(DataContext);
  const {updateProductCategories, setIsLoading} = dataContextData;

  const { state } = useLocation();
  const [updatingCategory, setUpdatingCategory] = useState({});


  useEffect(() => {
    console.log('productCategory:',state);
    if(state) {
      setUpdatingCategory(state);
    }
    else {
      setUpdatingCategory({
        title: '',
        description: '',
        show_in_home_page: false,
        two_in_a_row: false
      });
    }
    console.log(state);
  }, [state]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const [adminPassword, setAdminPassword] = useState('');

  const handleInputChange = (e) => {
    console.log('handleInputChange');
    if(e.target.name === 'show_in_home_page') {
      console.log('show_in_home_page:', e.target)
      setUpdatingCategory((prev) => ({ ...prev, [e.target.name]: !prev.show_in_home_page }));  
    }
    else if(e.target.name === 'two_in_a_row') {
      console.log('two_in_a_row:', e.target)
      setUpdatingCategory((prev) => ({ ...prev, [e.target.name]: !prev.two_in_a_row }));  
    }
    else {
      setUpdatingCategory((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatingCategory((prev) => ({
          ...prev,
          [e.target.name]: selectedFile,
          [`${e.target.name}_preview`]: reader.result,
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  const saveCategory = async () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(updatingCategory)) {
      formData.append(key, value);
    }
    formData.append('admin_password', adminPassword);

    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    };
    try{
      console.log('calling saveCategory');
      setIsLoading(true);
      const response = await axiosInstance.post("category/", formData, config);
      console.log('saveCategory response: ', await response.data);
      if ('data' in response) {
        updateProductCategories(await response.data);
      }
      setIsLoading(false);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    navigate(-1);
  };

  const deleteCategory = async () => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };
    try{
      const data = {'admin_password': adminPassword, 'pk': updatingCategory.id};
      console.log('data: ', data);
      setIsLoading(true);

      const response = await axiosInstance.post(
        'category/delete/',
        data, 
        config
      );
      console.log('deleteCategory response: ', await response.data);
      if ('data' in response) {
        updateProductCategories(await response.data);
      }
      setIsLoading(false);
      const toast_message = `Deleted Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    navigate(-1);
  }

  console.log('Update product Category page is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title"> {state ? `Update : ${state.title}` : 'Create New Product Category'}</h1>
      
      <div className="card-container">
        {state && <div className="product-category-card" onClick={() => navigate('size-chart', {state: state})}  style={{cursor: 'pointer'}}>
          <i className="fa fa-table" aria-hidden="true"></i>
          <p>Size Charts</p>
        </div>}

        {state && <div className="product-category-card"  onClick={() => navigate('description', {state: state})} style={{cursor: 'pointer'}}>
          <i className="fa fa-info-circle" aria-hidden="true"></i>
          <p>Descriptions</p>
        </div>}

        <div className="product-category-edit-container">
          
          <div className="product-category-form-row">
            <input type="text" placeholder="Enter title" value={updatingCategory.title} onChange={handleInputChange} name='title' />
          </div>
          
          <div className="product-category-form-row">
            <textarea placeholder="Enter description" value={updatingCategory.description} onChange={handleInputChange} name='description'></textarea>
          </div>

          <div className="product-category-form-row">
            <div className="product-category-image-upload">
              <Image 
                imageUrl={
                  (updatingCategory && updatingCategory.cover_image_preview) ?  
                  updatingCategory.cover_image_preview :
                  (state && state.cover_image && "http://127.0.0.1:8000/" + state.cover_image)
                }
                altText="Cover"
                blurHash={state && state.cover_image_blurhash}
                width={300}
                height={180}
                BlurHashWidth={300}
                blurHashHeight={180}
                />

              <div className="product-category-image-upload-overlay">
                <input type="file" onChange={handleFileChange} name='cover_image'/>
                <i className="fa fa-plus" aria-hidden="true"></i>
                <p>Cover</p>
              </div>
            </div>
          </div>

          <div className="product-category-form-row">
            <div className="product-category-image-upload">
              
              <Image 
                imageUrl={
                  (updatingCategory && updatingCategory.profile_image_preview) ? 
                  updatingCategory.profile_image_preview :
                  (state && state.profile_image && "http://127.0.0.1:8000/" + state.profile_image)
                }
                altText="Profile"
                blurHash={state && state.profile_image_blurhash}
                width={300}
                height={180}
                BlurHashWidth={300}
                blurHashHeight={180}
                />

              <div className="product-category-image-upload-overlay">
                <input type="file" onChange={handleFileChange} name='profile_image'/>
                <i className="fa fa-plus" aria-hidden="true"></i>
                <p>Profile</p>
              </div>
            </div>
          </div>

          <div className="product-category-form-row">
            <label style={{paddingTop: '15px'}}>Show in Homepage</label>
            <input type="checkbox" checked={updatingCategory.show_in_home_page} onChange={handleInputChange} name='show_in_home_page'/>
          </div>

          <div className="product-category-form-row">
            <label style={{paddingTop: '15px'}}>Two In A Row</label>
            <input type="checkbox" checked={updatingCategory.two_in_a_row} onChange={handleInputChange} name='two_in_a_row'/>
          </div>

          <div className="product-category-form-row">
            <input type="password" placeholder="Enter admin password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
          </div>

          <div className="product-category-buttons">
            <button onClick={saveCategory} style={{padding: '20px', width: '100%', fontSize: 'medium'}}>
                Save
            </button>
            {state && <button onClick={deleteCategory} style={{padding: '20px', width: '100%', fontSize: 'medium'}}>
                Delete
            </button>}
          </div>
        </div>

      </div>
      <br /><br /><br />
    </div>
  );
}

export default React.memo(UpdateProductCategory);