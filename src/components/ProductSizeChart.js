import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import { DataContext } from '../contexts/DataContext';

import { useQuery } from 'react-query'
import Axios from 'axios';
import { object } from 'yup';


const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/product/",
});


function ProductSizeChart() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { authData } = useContext(AuthContext);
  const {getAccessToken, showToast} = authData;

  const { dataContextData } = useContext(DataContext);
  const {getProductCategories, updateProductCategories, setIsLoading} = dataContextData;

  const [showPopup, setShowPopup] = useState(false);

  const [updatingSizeChart, setUpdatingSizeChart] = useState(null);
  const [updatingTitle, setUpdatingTitle] = useState("");
  const [updatingTable, setUpdatingTable] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  

  const productSizeChartResponse = useQuery(`get-size-chart-by-category-${state.slug}`, async () => {
    console.log(`get-size-chart-by-category-${state.slug}`);
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axiosInstance.get(`sizechart/category/${state.title}`, config);
  });

  const createNewSizeChart = async () => {
    console.log('create new size chart');
    
    setUpdatingSizeChart(null);
    setUpdatingTitle("");
    setUpdatingTable([{'Size':''},]);
    setAdminPassword('');
    setShowPopup(true);
  }

  const updateSizeChart = async (item) => {
    console.log(item);

    setUpdatingSizeChart(item);
    setUpdatingTitle(item.title);
    setUpdatingTable(item.size_chart);
    setAdminPassword(''); 
    setShowPopup(true);
  }

  const closePopup = () => {
    
    setUpdatingSizeChart(null);
    setUpdatingTitle("");
    setUpdatingTable(null);
    setShowPopup(false);
    setAdminPassword('');
  };

  const handleTableHeaderChange = (col, newKey) => {
    console.log(`handleTableHeaderChange: ${col} ${newKey}`);
    if(newKey in updatingTable[0]) {
      console.log('header already axist.');
      return;
    }
    const prvKey = Object.keys(updatingTable[0])[col];
    console.log('key: ', prvKey);
    
    const table = updatingTable.map((row) => {
      const data = {};
      for(const [key, value] of Object.entries(row)) {
        if(key === prvKey) {
          data[newKey] = value;
        }
        else {
          data[key] = value;
        }
      }
      return data;
    });
    console.log(table);
    setUpdatingTable(table);
  };

  const handleTaleValueChange = (row, col, value) => {
    console.log(`handleTaleValueChange: ${row} ${col} ${value}`)

    const table = [...updatingTable];
    table[row][Object.keys(table[row])[col]] = value;
    setUpdatingTable(table);
  }

  const addColumn = () => {
    console.log('add column');
    const table = updatingTable.map((row) => {
      return {...row, 'new size': 0}
    });
    setUpdatingTable(table);
  }

  const deleteColumn = () => {
    console.log('delete column');
    const keys = Object.keys(updatingTable[0]);
    const delKey = keys[keys.length-1];
    console.log('KEY: ', keys);

    const table = updatingTable.map(({ [delKey]: deletedColumn, ...rest }) => rest);
    setUpdatingTable(table);
  };

  const addRow = () => {
    console.log('add row');
    if(updatingTable.length >= 8) {
      return;
    }

    const table = [...updatingTable];
    const row = {...table[0]};
    for(let key in row) {
      row[key] = '';
    }
    table.push(row);
    setUpdatingTable(table);
  }

  const deleteRow = () => {
    console.log('delete row');
    const table = [...updatingTable];
    table.pop()
    setUpdatingTable(table);
  }

  const saveSizeChart = async () => {
    console.log('saveSizeChart');
    
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
    };

    const data = {'admin_password':adminPassword,};
    if(updatingSizeChart) {
      data['size_chart_title'] = updatingSizeChart.title;
    }
    data['size_chart_data'] = {'product_category': state.id, 'title': updatingTitle, 'size_chart': updatingTable};

    setIsLoading(true);
    try{
      const response = await axiosInstance.post("sizechart/", data, config);
      console.log('size-chart response: ', await response.data);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch(e){
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    setIsLoading(false);

    productSizeChartResponse.refetch();
    closePopup();
  }

  const deleteSizeChart = async () => {
    console.log('delete Size Chart');

    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
    };

    const data = {'admin_password':adminPassword,};
    if(updatingSizeChart) {
      data['size_chart_title'] = updatingSizeChart.title;
    }
    else {
      return;
    }

    setIsLoading(true);
    try{
      const response = await axiosInstance.post("sizechart/delete/", data, config);
      console.log('size-chart response: ', await response.data);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch(e){
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    setIsLoading(false);

    productSizeChartResponse.refetch();
    closePopup();
  }

  console.log('product size-chart page is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">{state.title} : Size Chart</h1>
  
      <div className="card-container">
        <div className="product-category-card" onClick={createNewSizeChart} style={{ cursor: 'pointer' }}>
          <i className="fa fa-plus" aria-hidden="true"></i>
          <p>Create New Size Chart</p>
        </div>
  
        <div className="product-category-manager-container">
          {!productSizeChartResponse.isLoading && productSizeChartResponse.data.data.map((item, index) => (
            <div key={index} className="product-size-chart-row" onClick={() => updateSizeChart(item)} style={{ cursor: 'pointer' }}>
  
              <div className="product-size-chart-details">
                <h3>{item.title}</h3>
              </div>
  
              <div className="product-size-chart-table">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(item.size_chart[0]).map(header => (<th key={header}>{header}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.size_chart.map((sizeInfo, sizeIndex) => (
                      <tr key={sizeIndex}>
                        {Object.values(sizeInfo).map((value, idx) => (<td key={idx}>{value}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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

            <h2 className='item'><i className="fa fa-hashtag" aria-hidden="true"></i> {updatingTitle ? updatingTitle : 'New Size Chart'}</h2>
            
            <div className="product-category-form-row">
              <input type="text" placeholder="Enter title" value={updatingTitle} onChange={(e) => setUpdatingTitle(e.target.value)} name='title' />
            </div>

            <div className="product-size-chart-table product-size-chart-form-row">
              <table>
                <thead>
                  <tr>
                    {Object.keys(updatingTable[0]).map((header, col) => (
                      <th key={col}>
                        {col === 0 ? header :
                        <input
                            type="text"
                            value={header}
                            onChange={(e) => handleTableHeaderChange(col, e.target.value)}
                          /> }
                      </th>
                    ))}
                    <td>
                      <div className="size-chart-buttons">
                        <button onClick={deleteColumn}>
                          <i className="fa fa-minus" aria-hidden="true"></i>
                        </button>
                        <button onClick={addColumn}>
                          <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {updatingTable.map((rowData, row) => (
                    <tr key={row}>
                      {Object.values(rowData).map((value, col) =>
                        <td key={col}>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleTaleValueChange(row, col, e.target.value)}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <div className="size-chart-buttons">
                        <button onClick={deleteRow}>
                          <i className="fa fa-minus" aria-hidden="true"></i>
                        </button>
                        <button onClick={addRow}>
                          <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{display: 'flex', flexDirection:'row', alignItems: 'center' }}>
              <div className="product-category-form-row">
                <input type="password" placeholder="Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} name='admin-password' />
              </div>
              <button onClick={saveSizeChart} className="adm-btn">Save</button>
              {updatingSizeChart && <button onClick={deleteSizeChart} className="adm-btn">Delete</button>}
            </div>
          </div>
        </div>
      }

      <br/><br/><br/>
    </div>
  );
}

export default React.memo(ProductSizeChart);