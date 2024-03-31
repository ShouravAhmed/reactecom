import '../assets/styles/AdminDashboard.css';
import '../assets/styles/ProductManager.css';

import { AuthContext } from '../contexts/AuthContext';

import React, { useContext, useState, useEffect } from 'react';
import { Image } from './Image';

import { DataContext } from '../contexts/DataContext';
import Axios from 'axios';

import { useQuery } from 'react-query'


const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/product/image/",
});


const ProductImages = ({selectedProduct, adminPassword}) => {
  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const { dataContextData } = useContext(DataContext);
  const { setIsLoading } = dataContextData;

  const [imageList, setImageList] = useState([]);

  const populateImages = async (images) => {
    console.log('populateImages');
    if(!images) return;

    const updatedImages = images.sort((a, b) => a.image_order - b.image_order);
    if(imageList !== updatedImages) {
      
      setImageList(updatedImages);
      console.log('Image list updated');
    }
    else {
      console.log('Image list not updated');
    }
  };

  const fetchImages = async () => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axiosInstance.get(`product/${selectedProduct.product_id}/`, config);
    populateImages(response.data);
    return response;
  }

  const imageListResponse = useQuery(`product-images`, fetchImages);

  useEffect(() => {
    if(!imageListResponse.isLoading) {
      populateImages(imageListResponse.data.data);
    }
  }, []);

  const updateImageOrder = async (image_id, direction) => {
    let n = imageList.length;
    let updatedImages = [...imageList];

    for(let i = 0; i < n; i++) {
      if(imageList[i]['image_id'] === image_id) {
        if(i && direction === 'up') {
          let imageA = {...imageList[i]};
          imageA.image_order -= 1;
          let imageB = {...imageList[i-1]};
          imageB.image_order += 1;

          updatedImages[i-1] = imageA;
          updatedImages[i] = imageB;
        }
        else if(i + 1 < n  && direction === 'down') {
          let imageA = {...imageList[i+1]};
          imageA.image_order -= 1;
          let imageB = {...imageList[i]};
          imageB.image_order += 1;

          updatedImages[i] = imageA;
          updatedImages[i+1] = imageB;
        }
      }
    }
    const isImageOrderUpdated = await saveImageOrder(updatedImages);
    if(isImageOrderUpdated) {
      imageListResponse.refetch();
    }
  }

  const saveImageOrder = async (updatedImages) => {
    const order = {}
    for(let image of updatedImages) {
      order[image.image_id] = image.image_order;
    }
    
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };
    const data = {'order': order, 'admin_password': adminPassword, 'product' : selectedProduct.product_id};
    console.log('order: ', data);
    console.log('order: ', imageList);
    
    try{
      setIsLoading(true);
      const response = await axiosInstance.post(
        'update-order/',
        data, 
        config
      );
      console.log('update category order response: ', await response.data);
      setIsLoading(false);

      const toast_message = `Order Updated Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
      return true;
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    return false;
  }

  const saveImage = async (e) => {
    if (!e.target.files || e.target.files.length <= 0) return;
    const productImage = {
      'image' : e.target.files[0],
      'product' : selectedProduct.product_id
    };

    const formData = new FormData();
    for (const [key, value] of Object.entries(productImage)) {
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
      console.log('calling saveImage');
      setIsLoading(true);

      const response = await axiosInstance.post("", formData, config);
      
      console.log('saveImage response: ', await response.data);
      setIsLoading(false);

      imageListResponse.refetch();

      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
  };

  const deleteImage = async (image) => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };
    try{
      const data = {'admin_password': adminPassword, 'product' : selectedProduct.product_id, 'image_id' : image.image_id};
      console.log('data: ', data);
      setIsLoading(true);

      const response = await axiosInstance.post(
        'delete/',
        data, 
        config
      );
      console.log('deleteImage response: ', await response.data);
      setIsLoading(false);

      imageListResponse.refetch();

      const toast_message = `Deleted Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
  }


  console.log('Product Image component is being loaded');

  if(!selectedProduct || !selectedProduct.product_id) return "";

  return (
    <div className="card-container">
      <div className="product-category-image-upload admin-product-image-container" style={{height: 150, width: 150}}>
        <div className="product-category-image-upload-overlay">
          <input type="file" onChange={saveImage} name='image'/>
          <i className="fa fa-plus" aria-hidden="true"></i>
          <p>Product Image</p>
        </div>
      </div>
      {imageList && imageList.map((image) => (
        <div className="admin-product-image-container">
          <div className="admin-product-image-container-overlay">
              <button className="admin-product-image-container-arrow-button admin-product-image-container-left-arrow"
                onClick={() => {updateImageOrder(image.image_id, 'up')}}>&#8249;</button>
              <button className="admin-product-image-container-arrow-button admin-product-image-container-right-arrow"
                onClick={() => {updateImageOrder(image.image_id, 'down')}}>&#8250;</button>
              <button className="admin-product-image-container-delete-button"
                onClick={() => {deleteImage(image)}}>×</button>
          </div>
          <Image 
            imageUrl={
              image && "http://127.0.0.1:8000/" + image.image
            }
            altText="Img"
            blurHash={image && image.image_blurhash}
            width={150}
            height={150}
            blurHashWidth={150}
            blurHashHeight={150}
            borderRadius={10}
            />
        </div>
      ))}
    </div>
  );
}

export default React.memo(ProductImages);