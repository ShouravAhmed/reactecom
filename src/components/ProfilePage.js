import '../assets/styles/ProfilePage.css';

import WishlistIconPink from '../assets/images/wishlist-icon.png';
import ClockIcon from '../assets/images/clockicon.png';
import Coin from '../assets/images/coin-icon.png';
import ProfileIcon from '../assets/images/user-icon.png';
import CallIcon from '../assets/images/call-icon.png';
import EmailIcon from '../assets/images/mail-icon.png';
import AddressIcon from '../assets/images/address-icon.png';
import RightArrow from '../assets/images/right-arrow-icon.png'

import { AuthContext } from '../contexts/AuthContext';

import React, { useState, useContext } from 'react';
import {useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'


function getRandomBackgroundColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function ProfilePage() {
  console.log('profile page is being loaded');
  const navigate = useNavigate();
  const randomBackgroundColor = getRandomBackgroundColor();

  const { authData } = useContext(AuthContext);
  const {userProfile, updateUserProfile, handleUserLogout, showToast} = authData;
  
  const schema = yup.object().shape({
    full_name: yup
      .string()
      .test('at-least-two-words', 'Full Name should contain at least two words', (value) => {
        if (value) {
          const words = value.split(' ').filter((x) => x.length > 0  );
          return words.length >= 2;
        }
        return true;
      })
      .min(4, 'Full Name should be at least 4 characters long.')
      .required('Full Name is required.'),
    email: yup.string().email('Please provide a valid email.').required('Email is Required.'),
    address: yup.string().required('Address is required.')
  });
  
  const {register, handleSubmit, formState: {errors}} = useForm({
    resolver: yupResolver(schema),
  });
  
  const [newUser, setNewUser] = useState(userProfile)

  const onSubmit = (data) => {
    const {full_name, email, address} = data;
    const tmpUser = { ...userProfile, full_name:full_name, email:email, address: address };
    if(JSON.stringify(tmpUser) === JSON.stringify(userProfile)) {
      showToast("Profile Already Updated!");
    }
    else{
      updateUserProfile(tmpUser);
      showToast("Your Profile Updated Successfully!");
    }
  };
  const onChange = (event) => {
    const { name, value } = event.target; 
    setNewUser({ ...newUser, [name]: value });
  };

  const showErrors = () => {
    let formError = false;
    if(errors.full_name) {
      formError = errors.full_name.message;
    }
    else if (errors.email) {
      formError = errors.email.message;
    }
    else if(errors.address) {
      formError = errors.address.message;
    }
    return formError;
  }

  const handleLogout = () => {
    console.log("Logout successfull");
    handleUserLogout();
  }

  return (
    <div>
        <div className="profile-container">
          
          <div className="profile-header">
            <div className="profile-picture" style={{ background: randomBackgroundColor }}>
            <div className="initials">{userProfile.full_name ? userProfile.full_name.split(' ').map(word => word[0]).join('') : 'U'}</div>
            </div>

            <div className="user-info">
              <div className="username">{userProfile.full_name || "User"}</div>
              <div className="registered-since">
                <img src={ClockIcon} alt="reg" className="registration-icon" />
                Registered 3 yers ago
              </div>
            </div>

            <div className="user-points-container">
              <div className="user-points">
                <img src={Coin} alt="Gold Coin Icon" className="gold-coin" />
                <div className="total-points">{userProfile.points}</div>
                <div className="points-text">points</div>
              </div>
            </div>
          </div>

          <div className="profile-row">
            <img src={CallIcon} alt="PhoneNo" className="icon" />
            <div className="editable-light">{userProfile.phone_number}</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} onChange={onChange}>
            <div className="profile-row">
              <img src={ProfileIcon} alt="UserIcon" className="icon" />
              <input type="text" className="editable-light textbox" placeholder="Full Name" name="full_name" value={newUser.full_name || ''} {...register("full_name")}/>
            </div>

            <div className="profile-row">
            <img src={EmailIcon} alt="Email" className="icon" />
              <input type="email" className="editable-light textbox" placeholder="user@email.com" name="email" value={newUser.email || ''} {...register("email")}/>
            </div>

            <div className="profile-row">
              <img src={AddressIcon} alt="Address" className="icon" />
              <input type="text" className="editable-light textbox" placeholder="Address" name="address" value={newUser.address || ''} {...register("address")}/>
            </div>
            {showErrors() ? <p className='formErrors'>{showErrors()}</p> : ""}
            
            <br />            
            <div className="profile-row order-history" onClick={() => navigate('/orderhistory')}>
              <img src={WishlistIconPink} alt="history" className="icon" />
              <div className="order-history-text">Order History</div>
              <img src={RightArrow} alt="Right Icon" className="right-icon" />
            </div>

            <div className="profile-row submit-btn">
              <input type='submit' className="submit-btn-text" value="Update Profile"/>
            </div>
          </form>

          <div className="profile-row submit-btn" onClick={()=>{
                showToast("Logout Successfull. See You Again!"); 
                handleLogout();
                return navigate('login', { replace: true });
              }
            }>
            <div className="submit-btn-text">Logout</div>
          </div>
          {userProfile.is_staff && 
            <div className="profile-row order-history" onClick={() => navigate('/admin-panel', { replace: true })}>
              <i className="fa fa-cogs" aria-hidden="true" style={{marginLeft: 15}}></i>
              <div className="order-history-text" style={{marginLeft: 25}}>Admin Panel</div>
              <i className="fa fa-arrow-right" aria-hidden="true" style={{textAlign: 'right', marginRight: 15}}></i>
            </div>
          }
        
        </div>
        <br /><br /> <br />
    </div>
  )
}

export default React.memo(ProfilePage);