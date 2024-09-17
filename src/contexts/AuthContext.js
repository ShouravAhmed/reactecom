import React, { createContext, useState, useMemo, useEffect, useCallback } from "react";
import Axios from 'axios';
import { Toast } from '../components/Toast';


export const AuthContext = createContext()

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function AuthProvider({children}) {
  console.log('AuthProvider being loaded . .. . ');

  const [accessToken, setAccessToken] = useState('');
  const [accessTokenTimestamp, setAccessTokenTimestamp] = useState(0);
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('LOCAL_REFRESH_TOKEN')
  );
  const [userProfile, setUserProfile] = useState(
    JSON.parse(localStorage.getItem('LOCAL_USER_PROFILE'))
  );


  useEffect(() => {
    const localRefreshToken = localStorage.getItem('LOCAL_REFRESH_TOKEN');
    setRefreshToken(localRefreshToken);

    const localAccessToken = localStorage.getItem('LOCAL_ACCESS_TOKEN');
    setAccessToken(localAccessToken);

    const localAccessTokenTimestamp = localStorage.getItem('LOCAL_ACCESS_TOKEN_TIME', '0');
    setAccessTokenTimestamp(parseInt(localAccessTokenTimestamp));

    const localUserProfile = localStorage.getItem('LOCAL_USER_PROFILE');
    setUserProfile((localUserProfile ? JSON.parse(localUserProfile) : null));
    
    console.log('useEffect: \nlocalRefreshTokens: ', localRefreshToken, '\nUserProfile: ', JSON.parse(localUserProfile));
  }, []);

  useEffect(() => {
    const initUserData = async () => {
      try {
        if(!refreshToken) {
          return;
        }
        
        const tenMinutesAgo = new Date(Date.now());
        tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
        const accessTokenTime = new Date(accessTokenTimestamp);
        
        console.log("UserEffect: " + tenMinutesAgo + " | " + accessTokenTime);
        console.log("prv accessToken: " + accessToken);

        if (!accessToken ||  accessTokenTime < tenMinutesAgo) {
          const refreshTokenResponse = await axiosInstance.post("auth/token/refresh/", {
            'refresh': refreshToken,
          });
    
          if ('access' in refreshTokenResponse.data) 
          {
            const token = refreshTokenResponse.data.access;
            setAccessToken(token);
            setAccessTokenTimestamp(Date.now());

            localStorage.setItem('LOCAL_ACCESS_TOKEN', token);
            localStorage.setItem('LOCAL_ACCESS_TOKEN_TIME', Date.now());

            console.log("access token from useEffect: ", token);

            const config = {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            };
            const UserDataResponse = await axiosInstance.get("auth/get-user/", config);
            const userData = UserDataResponse.data.user;
    
            setUserProfile(userData);
            localStorage.setItem('LOCAL_USER_PROFILE', JSON.stringify(userData));

            console.log("user data fetched: ", userData);
          }

          console.log("new accessToken: " + accessToken);
        }
      }
      catch(e) {
        console.log('exception: ', e);
      }
    }
    console.log("UserEffect: Init User Data");
    initUserData();
  }, [refreshToken]);

  const handleUserLogout = useCallback(async () => {
    console.log('logout');

    localStorage.removeItem('LOCAL_USER_PROFILE');

    localStorage.removeItem('LOCAL_REFRESH_TOKEN');
    localStorage.removeItem('LOCAL_ACCESS_TOKEN');
    localStorage.removeItem('LOCAL_ACCESS_TOKEN_TIME');

    localStorage.removeItem('LOCAL_CARTLIST');
    localStorage.removeItem('LOCAL_WISHLIST'); 
    localStorage.removeItem('LOCAL_ORDER_HISTORY');
    
    setAccessToken('');
    setRefreshToken('');
    setUserProfile(null);
    setAccessTokenTimestamp(0);
  }, []);

  const issueAccessToken = async () => {
    console.log('issueAccessToken:');
    if(!refreshToken) {
      handleUserLogout();
      return;
    }
    try {
      const response = await axiosInstance.post("auth/token/refresh/", {
        'refresh': refreshToken,
      });

      if ('access' in response.data) {
        setAccessToken(response.data.access);
        setAccessTokenTimestamp(Date.now());

        localStorage.setItem('LOCAL_ACCESS_TOKEN', response.data.access);
        localStorage.setItem('LOCAL_ACCESS_TOKEN_TIME', Date.now());

        console.log("access token issued: ", response.data.access);
        return response.data.access;
      }
      else {
        handleUserLogout();
      }
    }
    catch (error) {
      console.log("Error refreshing token:", error);
    }
  }

  const getAccessToken = async () => {
    if (!refreshToken) {
      const localRefreshToken = localStorage.getItem('LOCAL_REFRESH_TOKEN');
      if(localRefreshToken === false) {
        handleUserLogout();
      }
      return null;
    }
    const tenMinutesAgo = new Date(Date.now());
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    const accessTokenTime = new Date(accessTokenTimestamp);

    if (!accessToken ||  accessTokenTime < tenMinutesAgo) {
      const token = await issueAccessToken(refreshToken);
      return token;
    }
    return accessToken;
  }

  const handleUserLogin = useCallback(async ({phoneNo, otp}) => {
    try{
      const loginResponse = await axiosInstance.post("auth/token/", {
        'phone_number': phoneNo,
        'otp': otp,
        'password': '4321',
      });
      
      const data = ('data' in loginResponse) && (await loginResponse.data);
      
      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      localStorage.setItem('LOCAL_REFRESH_TOKEN', data.refresh);

      localStorage.setItem('LOCAL_USER_PROFILE', JSON.stringify(data.user));
      setUserProfile(data.user);

      if(loginResponse.status === 200) {
        return [true, `Wellcome Back!! ${(data.user.full_name ? data.user.full_name.split(' ').pop().slice(0, 9) : 'User')}. Happy Shoping With FabriCraft! `];
      }
      else {
        return [false, "Enter OTP carefully! Something went wrong."];
      }
    }
    catch (e) {
      console.error("Exception: ", e);
      const exception_message = e?.response?.data?.non_field_errors?.[0];
      return [false, exception_message || "Enter OTP carefully! Something went wrong."];
    }
  }, []);
  
  const updateUserProfile = async (userData = null) => {
    
    const authToken = await getAccessToken();
    if(!authToken) return;

    console.log("updateUserProfile: token: ", authToken);

    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };

    try {
      if (userData) {
        setUserProfile((prevData) => {
          const data = { ...prevData, ...userData }
          localStorage.setItem('LOCAL_USER_PROFILE', JSON.stringify({ ...data}));
          return data;
        });                                      
        await axiosInstance.post("auth/update-user/", {
          'full_name': userData['full_name'],
          'email': userData['email'],
          'address': userData['address']
        }, config);
        
        console.log('Profile updated successfully');
      } 
      else {
        const response = await axiosInstance.get("auth/get-user/", config);
        const data = response.data.user;

        setUserProfile(data);
        localStorage.setItem('LOCAL_USER_PROFILE', JSON.stringify(data));
      }
    } 
    catch (error) {
      console.error(error);
    }
  } 


  const [toastMsg, setToastMsg] = useState('');
  const showToast = async (Msg) => {
    console.log("ShowToast: ", Msg);

    setToastMsg(Msg);
    setTimeout(() => {
        setToastMsg('');
    }, 3000);
  };

  const authData = {
    handleUserLogin,
    handleUserLogout,
    userProfile,
    updateUserProfile,
    getAccessToken,
    showToast
  };

  const memoChildren = useMemo(() => children, [children]);

  return (
      <AuthContext.Provider value={{authData}}>
        {toastMsg && <Toast message={toastMsg}/>}

        {memoChildren}
      </AuthContext.Provider>
  )
}

export default React.memo(AuthProvider);