import '../assets/styles/AdminDashboard.css';

import React, { createContext, useMemo, useContext, useState, useEffect } from "react";
import Axios from 'axios';

import { AuthContext } from '../contexts/AuthContext';

export const DataContext = createContext()

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function DataProvider({children}) {
  const { authData } = useContext(AuthContext);
  const {getAccessToken} = authData;

  const [productCategories, setProductCategories] = useState(null);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const localProductCategories = localStorage.getItem('LOCAL_PRODUCT_CATEGORIES');
    setProductCategories((localProductCategories ? JSON.parse(localProductCategories) : null));

    const localLastUpdatedTimestamp = localStorage.getItem('LOCAL_LAST_UPDATED_TIME', '0');
    setLastUpdatedTimestamp(parseInt(localLastUpdatedTimestamp));
  }, []);

  const fetchProductCategories = async () => {
    console.log('==> fetchProductCategories');

    const response = await axiosInstance.get("product/category/");
    const data = await response.data;
    const sortedData = data.sort((a, b) => a.category_order - b.category_order);

    setProductCategories(sortedData);
    localStorage.setItem('LOCAL_PRODUCT_CATEGORIES', JSON.stringify(sortedData));

    setLastUpdatedTimestamp(Date.now());
    localStorage.setItem('LOCAL_LAST_UPDATED_TIME', Date.now());

    console.log('=>> FetchedProductCategories: ', sortedData);
    return sortedData;
  }

  useEffect(() => {
    fetchProductCategories();
  }, []); 

  const getProductCategories = async () => {
    console.log('==> getProductCategories');

    const timeToCompare = new Date(Date.now());
    timeToCompare.setMinutes(timeToCompare.getMinutes() - 15);
    const lastUpdated = new Date(lastUpdatedTimestamp);

    if (lastUpdated < timeToCompare) {
        return await fetchProductCategories();
    }
    console.log('=>> productCategories: ', productCategories);
    return productCategories;
  }

  const updateProductCategories = async (data) => {
    console.log('==> updateProductCategories: ', data);
    const sortedData = data.sort((a, b) => a.category_order - b.category_order);

    setProductCategories(sortedData);
    localStorage.setItem('LOCAL_PRODUCT_CATEGORIES', JSON.stringify(sortedData));

    setLastUpdatedTimestamp(Date.now());
    localStorage.setItem('LOCAL_LAST_UPDATED_TIME', Date.now());
    
    return sortedData;
  }

  const dataContextData = {
    getProductCategories,
    updateProductCategories,
    isLoading, setIsLoading,
  };

  const memoChildren = useMemo(() => children, [children]);

  console.log('DataProvider being loaded . .. . ');
  return (
      <DataContext.Provider value={{dataContextData}}>
        {memoChildren}
        {isLoading && (
        <div className="loading-popup-overlay">
          <div className="loading-popup">
            
            <svg class="pl" viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pl-grad1" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stop-color="hsl(359, 100%, 50%)" />
                  <stop offset="100%" stop-color="hsl(207, 100%, 50%)" />
                </linearGradient>
                <linearGradient id="pl-grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="hsl(359, 100%, 50%)" />
                  <stop offset="100%" stop-color="hsl(207, 100%, 50%)" />
                </linearGradient>
              </defs>
              <circle class="pl__ring" cx="100" cy="100" r="82" fill="none" stroke="url(#pl-grad1)" stroke-width="36" stroke-dasharray="0 257 1 257" stroke-dashoffset="0.01" stroke-linecap="round" transform="rotate(-90,100,100)" />
              <line class="pl__ball" stroke="url(#pl-grad2)" x1="100" y1="18" x2="100.01" y2="182" stroke-width="36" stroke-dasharray="1 165" stroke-linecap="round" />
            </svg>
              
          </div>
        </div>
      )}
      </DataContext.Provider>
  )
}

export default React.memo(DataProvider);