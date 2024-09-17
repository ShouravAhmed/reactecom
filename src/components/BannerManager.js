import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';
import { Image } from './Image';

import { DataContext } from '../contexts/DataContext';
import Axios from 'axios';

import { useQuery } from 'react-query'


const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});


function BannerManager() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const {getAccessToken, showToast} = authData;

  const { dataContextData } = useContext(DataContext);
  const { setIsLoading } = dataContextData;

  const [bannerList, setBannerList] = useState([]);
  const [showPopup, setShowPopup] = useState(false);


  const populateBanners = async (banners) => {
    console.log('populateBanners');
    if(!banners) return;
    const updatedBanners = banners.sort((a, b) => a.banner_order - b.banner_order);
    if(bannerList !== updatedBanners) {
      setBannerList(updatedBanners);
      console.log('banner list updated');
    }
    else {
      console.log('banner list not updated');
    }
  };

  const fetchBanners = async () => {
    const response = await axiosInstance.get('marketing/banner/');
    populateBanners(response.data);
    return response;
  }

  const bannerListResponse = useQuery(`all-banner`, fetchBanners);

  useEffect(() => {
    if(!bannerListResponse.isLoading) {
      populateBanners(bannerListResponse.data.data);
    }
  }, []);

  const updateBannerOrder = async (title, direction) => {
    let n = bannerList.length;
    let updatedBanners = [...bannerList];

    for(let i = 0; i < n; i++) {
      if(bannerList[i]['title'] === title) {
        if(i && direction === 'up') {
          let bannerA = {...bannerList[i]};
          bannerA.banner_order -= 1;
          let bannerB = {...bannerList[i-1]};
          bannerB.banner_order += 1;

          updatedBanners[i-1] = bannerA;
          updatedBanners[i] = bannerB;
        }
        else if(i + 1 < n  && direction === 'down') {
          let bannerA = {...bannerList[i+1]};
          bannerA.banner_order -= 1;
          let bannerB = {...bannerList[i]};
          bannerB.banner_order += 1;

          updatedBanners[i] = bannerA;
          updatedBanners[i+1] = bannerB;
        }
      }
    }
    setBannerList(updatedBanners);
  }

  const closePopup = () => {
    setSelectedBanner(null);
    setupdatingBanner(null);
    setAdminPassword('');
    setShowPopup(false);
  }

  const saveBannerOrder = async () => {
    const order = {}
    for(let banner of bannerList) {
      order[banner.title] = banner.banner_order
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
        'marketing/banner/update-order/',
        data, 
        config
      );
      console.log('update category order response: ', await response.data);
      setIsLoading(false);

      bannerListResponse.refetch();

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

  const [selectedBanner, setSelectedBanner ] = useState(null);
  const [updatingBanner, setupdatingBanner] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');

  const handleInputChange = (e) => {
    console.log('handleInputChange');
    setupdatingBanner((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setupdatingBanner((prev) => ({
          ...prev,
          [e.target.name]: selectedFile,
          [`${e.target.name}_preview`]: reader.result,
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  const saveBanner = async () => {
    console.log('saveBanner: ', updatingBanner);

    const formData = new FormData();
    for (const [key, value] of Object.entries(updatingBanner)) {
      formData.append(key, value);
    }
    formData.append('admin_password', adminPassword);
    if(selectedBanner) {
      formData.append('previous_title', selectedBanner.title);
    }
    
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    };
    try{
      console.log('calling saveBanner');
      setIsLoading(true);
      const response = await axiosInstance.post("marketing/banner/", formData, config);
      console.log('saveBanner response: ', await response.data);
      setIsLoading(false);

      bannerListResponse.refetch();

      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    closePopup();
  };

  const deleteBanner = async () => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };
    try{
      const data = {'admin_password': adminPassword, 'title': updatingBanner.title};
      console.log('data: ', data);
      setIsLoading(true);

      const response = await axiosInstance.post(
        'marketing/banner/delete/',
        data, 
        config
      );
      console.log('deleteBanner response: ', await response.data);
      setIsLoading(false);

      bannerListResponse.refetch();

      const toast_message = `Deleted Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    closePopup();
  }

  const newBanner = () => {
    console.log('new banner clicked');

    setupdatingBanner({
      title: '',
    });
    setAdminPassword('');
    setShowPopup(true);
  }

  const bannerItemClicked = (banner) => {
    console.log('banner item clicked: ', banner);

    setSelectedBanner(banner);
    setupdatingBanner(banner);
    setAdminPassword('');
    setShowPopup(true);
  }

  console.log('Banner page page is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Banner Manager</h1>
      
      <div className="card-container">

        <div className="product-category-card" onClick={newBanner}  style={{cursor: 'pointer'}}>
          <i className="fa fa-plus" aria-hidden="true"></i>
          <p>Add Banner</p>
        </div>
        { bannerList && bannerList.length > 1 &&
        <div className="product-category-card" onClick={saveBannerOrder}  style={{cursor: 'pointer'}}>
          <i className="fa fa-refresh" aria-hidden="true"></i>
          <p>Update Banner Order</p>
        </div>}

        <div className="product-category-manager-container">
            
            {bannerList && bannerList.map((banner) => (
              <div key={banner.banner_order} style={{marginBottom: '25px', }}>
                <div className="product-category-row">
              
                  <div style={{width: '25px', marginRight:'5px', fontSize: '1.1em'}}>
                    <h2 style={{textAlign: 'left'}}>{banner.banner_order}.</h2>
                  </div>
                  <div className="product-category-details" onClick={() => {bannerItemClicked(banner)}}  style={{cursor: 'pointer'}}>
                    <h2>{banner.title}</h2>
                    <a href={`http://${banner.redirect_url}`} target='_blank'>
                      <i className="icon fa fa-link" aria-hidden="true"></i>
                    </a>
                  </div>
              
                  <div className="product-category-buttons">
                    <button onClick={() => updateBannerOrder(banner.title, 'up')}>
                      <i className="fa fa-chevron-up" aria-hidden="true"></i>
                    </button>
                    <button onClick={() => updateBannerOrder(banner.title, 'down')}>
                      <i className="fa fa-chevron-down" aria-hidden="true"></i>
                    </button>
                  </div>
              
                </div>
                <div className="product-category-row" style={{marginTop: 0, paddingTop: 0, cursor: 'pointer'}} onClick={() => {bannerItemClicked(banner)}} >
                  <Image imageUrl={`${process.env.REACT_APP_BACKEND_SERVER}/${banner.image}`}
                    altText={banner.title} 
                    blurHash={banner.image_blurhash}
                    width={'100%'}
                    height={''}
                    BlurHashWidth={320}
                    blurHashHeight={180}
                    />
                </div>
              </div>
            ))}
            
        </div>
      </div>

      {showPopup && 
        <div className="popup-overlay" style={{overflowY: 'scroll', }}>
          <div className="popup" style={{ marginLeft: '20px',marginRight: '20px', marginTop: '50px'}}>

            <div className="adm-close-button" onClick={closePopup}>
              <i className="close-icon fa fa-times" aria-hidden="true"></i>
            </div>
            
            <div className="admin-panel-container">
              <h1 className="page-title" style={{marginTop:'0px', marginBottom: '10px', padding: '0px'}}> {selectedBanner ? `Update : ${selectedBanner.title}` : 'Create New banner'}</h1>
              
              <div className="card-container">
                <div className="product-category-edit-container" style={{margin:'0px', padding: '0px'}}>
                  
                  <div className="product-category-form-row">
                    <input type="text" placeholder="Enter title" value={updatingBanner.title} onChange={handleInputChange} name='title' />
                  </div>

                  <div className="product-category-form-row">
                    <input type="text" placeholder="Enter redirect URL" value={updatingBanner.redirect_url} onChange={handleInputChange} name='redirect_url' />
                  </div>

                  <div className="product-category-form-row">
                    <div className="product-category-image-upload">
                      <Image 
                        imageUrl={
                          (updatingBanner && updatingBanner.image_preview) ?  
                          updatingBanner.image_preview :
                          (selectedBanner && selectedBanner.image && `${process.env.REACT_APP_BACKEND_SERVER}/${selectedBanner.image}`)
                        }
                        altText="Cover"
                        blurHash={selectedBanner && selectedBanner.image_blurhash}
                        width={300}
                        height={180}
                        BlurHashWidth={300}
                        blurHashHeight={180}
                        />

                      <div className="product-category-image-upload-overlay">
                        <input type="file" onChange={handleFileChange} name='image'/>
                        <i className="fa fa-plus" aria-hidden="true"></i>
                        <p>Banner</p>
                      </div>
                    </div>
                  </div>

                  <div className="product-category-form-row">
                    <input type="password" placeholder="Enter admin password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                  </div>

                  <div className="product-category-buttons">
                    <button onClick={saveBanner} style={{padding: '20px', width: '100%', fontSize: 'medium'}}>
                        Save
                    </button>
                    {selectedBanner && <button onClick={deleteBanner} style={{padding: '20px', width: '100%', fontSize: 'medium'}}>
                        Delete
                    </button>}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      }

      <br/><br/><br/>
    </div>
  );
}

export default React.memo(BannerManager);