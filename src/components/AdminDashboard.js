import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext } from 'react';


function AdminDashboard() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const {userProfile} = authData;

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Admin Panel</h1>
      
      <div className="card-container">

        {userProfile.staff_level === 5 &&
            <div className="card" onClick={() => navigate('admin-manager')} style={{cursor: 'pointer'}}>
              <i className="icon fa fa-user-secret" aria-hidden="true"></i>
              <p>Admin Management</p>
            </div>
        }

        <div className="card" onClick={() => navigate('product-dashboard')} style={{cursor: 'pointer'}}>
          <i className="icon fa fa-shopping-bag" aria-hidden="true"></i>
          <p>Product Management</p>
        </div>

        <div className="card" onClick={() => navigate('order-manager')} style={{cursor: 'pointer'}}>
          <i className="icon fa fa-shopping-cart" aria-hidden="true"></i>
          <p>Order Management</p>
        </div>

        <div className="card" onClick={() => navigate('user-manager')} style={{cursor: 'pointer'}}>
          <i className="icon fa fa-users" aria-hidden="true"></i>
          <p>User Management</p>
        </div>

        <div className="card" onClick={() => navigate('accounce-manager')} style={{cursor: 'pointer'}}>
          <i className="icon fa fa-pie-chart" aria-hidden="true"></i>
          <p>Accounce Management</p>
        </div>

      </div>
      <br /><br /><br />
    </div>
  );
}

export default React.memo(AdminDashboard);