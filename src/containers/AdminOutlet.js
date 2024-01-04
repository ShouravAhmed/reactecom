import { Navigate, Outlet } from "react-router-dom";

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const AdminOutlet = () => {
  const { authData } = useContext(AuthContext);
  const {userProfile} = authData;
  
  return userProfile?.is_staff ? <Outlet/> : <Navigate to='/login'/>;
}

