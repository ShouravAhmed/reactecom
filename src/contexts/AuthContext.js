import React, { createContext, useState, useMemo, useEffect, useCallback } from "react";
import Axios from 'axios';
import { Toast } from '../components/Toast';


export const AuthContext = createContext()

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/auth/",
});

function AuthProvider({children}) {
  console.log('AuthProvider being loaded . .. . ');

  const [accessToken, setAccessToken] = useState('');
  const [accessTokenTimestamp, setAccessTokenTimestamp] = useState(0);
  const [refreshToken, setRefreshToken] = useState('');
  const [userProfile, setUserProfile] = useState(null);


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
          const refreshTokenResponse = await axiosInstance.post("token/refresh/", {
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
            const UserDataResponse = await axiosInstance.get("get-user/", config);
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

    setAccessToken('');
    setRefreshToken('');
    setUserProfile(null);
  }, []);

  const issueAccessToken = async () => {
    console.log('issueAccessToken:');
    if(!refreshToken) {
      handleUserLogout();
      return;
    }
    try {
      const response = await axiosInstance.post("token/refresh/", {
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
    console.log('getAccessToken');

    if (!refreshToken) {
      handleUserLogout();
      return null;
    }
    const tenMinutesAgo = new Date(Date.now());
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    const accessTokenTime = new Date(accessTokenTimestamp);

    console.log("UserEffect: " + tenMinutesAgo + " | " + accessTokenTime);
    console.log("prv accessToken: " + accessToken);

    if (!accessToken ||  accessTokenTime < tenMinutesAgo) {
      const token = await issueAccessToken(refreshToken);
      console.log('getAccessToken: ', token);
      return token;
    }
    console.log('getAccessToken: ', accessToken);
    return accessToken;
  }

  const handleUserLogin = useCallback(async ({phoneNo, otp}) => {
    try{
      const loginResponse = await axiosInstance.post("token/", {
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
        await axiosInstance.post("update-user/", {
          'full_name': userData['full_name'],
          'email': userData['email'],
          'address': userData['address']
        }, config);
        
        console.log('Profile updated successfully');
      } 
      else {
        const response = await axiosInstance.get("get-user/", config);
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