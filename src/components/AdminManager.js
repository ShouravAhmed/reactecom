import '../assets/styles/AdminManager.css';


import { AuthContext } from '../contexts/AuthContext';

import React, { useContext, useState } from 'react';

import { IsValidPassword, IsCorrectPhoneNumber } from '../utils/SecurityUtils';


import { DataContext } from '../contexts/DataContext';


import { useQuery } from 'react-query'
import Axios from 'axios';

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

const staffLevels = [
  {id: 0, staff_level: 'User'},
  {id: 1, staff_level: 'Intern'},
  {id: 2, staff_level: 'Junior'},
  {id: 3, staff_level: 'Mid'},
  {id: 4, staff_level: 'Senior'},
  {id: 5, staff_level: 'Manager'}
];

function getStaffLevelName(id) {
  const levelObject = staffLevels.find((level) => level.id === id);
  return levelObject ? levelObject.staff_level : staffLevels[0].staff_level;
}
function getStaffLevelId(name) {
  const staffLevel = staffLevels.find(level => level.staff_level === name);
  return staffLevel ? staffLevel.id : 0;
}

function AdminManager() {
  const { authData } = useContext(AuthContext);
  const {getAccessToken, showToast} = authData;

  const {dataContextData}  = useContext(DataContext);
  const {setIsLoading} = dataContextData;

  const [showPopup, setShowPopup] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [updatingAdmin, setUpdatingAdmin] = useState(null);
  const [formWarning, setFormWarning] = useState('');
  
  const adminListResponse = useQuery('get-admin-list', async () => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axiosInstance.get("auth/get-admin-list/", config);
  });

  const openPopup = (admin) => {
    if(admin) {
      admin.staff_level_name = getStaffLevelName(admin.staff_level);
    }
    setSelectedAdmin(admin);
    setUpdatingAdmin((admin || {}));
    setShowPopup(true);
  };

  const closePopup = () => {
    setSelectedAdmin(null);
    setUpdatingAdmin(null);
    setFormWarning("");
    setShowPopup(false);
  };

  const kickoutAdmin = () => {
    console.log("Kickout admin: ", selectedAdmin);
    closePopup();
  }

  const updateAdmin = async (admin) => {
    console.log("update admin: ", admin);
    setIsLoading(true);

    const token = await getAccessToken();
    console.log("Token", token);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };

    const response = await axiosInstance.post("auth/update-admin/", admin, config);
    setIsLoading(false);

    showToast(response.data.toast);
    console.log(response);

    adminListResponse.refetch();
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if(!updatingAdmin.phone_number || !IsCorrectPhoneNumber(updatingAdmin.phone_number)) {
      setFormWarning('Phone Number is not valid');
      return;
    }
    if(updatingAdmin.new_password && !IsValidPassword(updatingAdmin.new_password, updatingAdmin.confirm_new_password)) {
      setFormWarning('Enter Admin Password Carefully');
      return;
    }
    if(!updatingAdmin.manager_password || !IsValidPassword(updatingAdmin.manager_password, updatingAdmin.manager_password)) {
      setFormWarning('Manager Password Required');
      return;
    }
    if(!selectedAdmin && !updatingAdmin.new_password) {
      setFormWarning('Admin Password Required');
      return;
    }
    if(selectedAdmin && selectedAdmin.phone_number !== updatingAdmin.phone_number) {
      setFormWarning('Can not change admin phone number');
      return;
    }

    updatingAdmin.staff_level = getStaffLevelId(updatingAdmin.staff_level_name);
    updateAdmin(updatingAdmin);
    closePopup();
  };

  const handleChange = (event) => {
    const { name, value } = event.target; 
    setUpdatingAdmin((prv) => {return { ...prv, [name]: value }});
    console.log("handle change: ", updatingAdmin);
  }

  if(adminListResponse.isLoading) {
    setIsLoading(true);
  }
  else {
    setIsLoading(false);
  }

  return (
    <div className="admin-manager-container">

      <div className='title-row'>
          <h1 className='item' style={{fontSize: '24px'}}>Admin Management</h1>
          <button onClick={() => openPopup(null)} className="adm-btn">Add Admin</button>
      </div>

      <div className='admin-row-container'>  
        {!adminListResponse.isLoading && adminListResponse.data.data.admin_list.map((admin) => (
          <div className="admin-row" key={admin.phone_number} onClick={() => openPopup(admin)} style={{cursor: 'pointer'}}>
            <i className="fa fa-hashtag" aria-hidden="true"></i>
            <p className='item' style={{fontWeight: 600}}>{admin.phone_number}</p>
            <p className='item'>{admin.full_name}</p>
            <p className='item' style={{color: '#EA3837', fontWeight: 600}}>{getStaffLevelName(admin.staff_level)}</p>
          </div>
        ))}
      </div>      

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            
          <div className="adm-close-button" onClick={closePopup}>
            <i className="close-icon fa fa-times" aria-hidden="true"></i>
          </div>

            <h2 className='item'><i className="fa fa-hashtag" aria-hidden="true"></i> {selectedAdmin ? selectedAdmin.full_name : 'Add new Admin'}</h2>
            <div className="profile-container">
                
                {selectedAdmin && 
                <div className="profile-row">
                    <i className="fa fa-phone" aria-hidden="true"></i>
                    <div className="editable-light">{selectedAdmin.phone_number}</div>
                </div>}

                <form onSubmit={handleSubmit}>

                    {selectedAdmin == null &&
                    <div className="profile-row">
                        <i className="fa fa-phone" aria-hidden="true"></i>
                        <input type="text" className="editable-light textbox" placeholder="Phone Number" name="phone_number" value={updatingAdmin.phone_number || ''}  onChange={handleChange}/>
                    </div>}
                    
                    {selectedAdmin == null ?
                    <div className="profile-row">
                        <i className=" fa fa-address-card" aria-hidden="true"></i>
                        <input type="text" className="editable-light textbox" placeholder="Full Name" name="full_name" value={updatingAdmin.full_name || ''}  onChange={handleChange}/>
                    </div> : 
                    <div className="profile-row">
                        <i className="fa fa-address-card" aria-hidden="true"></i>
                        <div className="editable-light">{selectedAdmin.full_name}</div>
                    </div>}

                    <div className='profile-row'>
                      <i className="fa fa-user-secret" aria-hidden="true"></i>
                      <select className="editable-light" name="staff_level_name" value={updatingAdmin.staff_level_name} onChange={handleChange}>
                        {
                          staffLevels.map((staffLevel) => {
                            return (<option key={staffLevel.id} id={staffLevel.id} value={staffLevel.staff_level}>{staffLevel.staff_level}</option>);
                          })
                        }
                      </select>
                    </div>

                    <div className="profile-row">
                        <i className=" fa fa-key" aria-hidden="true"></i>
                        <input type="password" className="editable-light textbox" placeholder="New Password" name="new_password" value={updatingAdmin.new_password || ''}  onChange={handleChange}/>
                    </div>
                    <div className="profile-row">
                        <i className=" fa fa-key" aria-hidden="true"></i>
                        <input type="password" className="editable-light textbox" placeholder="Confirm New Password" name="confirm_new_password" value={updatingAdmin.confirm_new_password || ''}  onChange={handleChange}/>
                    </div>
                    
                    <div className="profile-row">
                        <i className=" fa fa-unlock-alt" aria-hidden="true"></i>
                        <input type="password" className="editable-light textbox" placeholder="Manager Password" name="manager_password" value={updatingAdmin.manager_password || ''}  onChange={handleChange}/>
                    </div>
                    <p style={{textAlign:'right', fontSize:'10px', color:'red'}}>{formWarning}</p>

                    <input type='submit' className="adm-btn" value={selectedAdmin ? 'Update Admin' : 'Create Admin'}/>
                    {selectedAdmin && <button onClick={kickoutAdmin} className="adm-btn">Kickout Admin</button>}
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(AdminManager);