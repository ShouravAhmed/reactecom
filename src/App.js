import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TopNavbar from './components/TopNavbar';
import BottomNavbar from './components/BottomNavbar';
import Home from './components/Home';
import SplashScreen from './components/SplashScreen';

import AuthProvider from './contexts/AuthContext';
import { PrivateOutlet } from './containers/PrivateOutlet';
import { AdminOutlet } from './containers/AdminOutlet';
import AdminDashboard from './components/AdminDashboard';
import AdminManagement from './components/AdminManagement';

import ProfilePage from './components/ProfilePage';
import Login from './components/Login';
import { NotFound } from './components/NotFound';

import BrandLogoNameWhite from './assets/images/fabricraft-logo-name-white.png';



function App() {
  console.log("App is being loaded . . .");

  const [isSplashVisible, setIsSplashVisible] = useState(false)

  useEffect(() => {
    console.log('App useEffect Loaded');
    
    setIsSplashVisible(true);
    setTimeout(() => {
      setIsSplashVisible(false);
    }, 2800);
  }, []);

  if(isSplashVisible) {
    return <SplashScreen logo={BrandLogoNameWhite}/>;
  }

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <TopNavbar/>

          <Routes>
            <Route path='/' element={<Home/>} exact/>

            <Route path='/' element={<PrivateOutlet/>}>
              <Route path='profile' element={<ProfilePage/>}/>
            </Route>

            <Route path='admin-panel/' element={<AdminOutlet/>}>
              <Route path='dashboard' element={<AdminDashboard/>}/>
              
              <Route path='admin-management' element={<AdminManagement/>}/>
              <Route path='product-management' element={<AdminDashboard/>}/>
              <Route path='order-management' element={<AdminDashboard/>}/>
              <Route path='user-management' element={<AdminDashboard/>}/>
              <Route path='accounce-management' element={<AdminDashboard/>}/>
            </Route>

            <Route path='/login' element={<Login/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>

          <BottomNavbar/>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
 