import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TopNavbar from './components/TopNavbar';
import BottomNavbar from './components/BottomNavbar';
import Home from './components/Home';
import SplashScreen from './components/SplashScreen';

import AuthProvider from './contexts/AuthContext';
import DataProvider from './contexts/DataContext';

import { PrivateOutlet } from './containers/PrivateOutlet';
import { AdminOutlet } from './containers/AdminOutlet';
import AdminDashboard from './components/AdminDashboard';
import AdminManager from './components/AdminManager';
import ProductDashboard from './components/ProductDashboard';
import ProductCategoryManager from './components/ProductCategoryManager';
import UpdateProductCategory from './components/UpdateProductCategory';
import ProductSizeChart from './components/ProductSizeChart'
import ProductDescription from './components/ProductDescription';
import BannerManager from './components/BannerManager';
import ProductManager from './components/ProductManager';
import SearchManager from './components/SearchManager';
import CategoryProducts from './components/CategoryProducts';
import CategoriesPage from './components/CategoriesPage';

import WishListPage from './components/WishListPage';
import CartPage from './components/CartPage';
import DeliveryDetails from './components/DeliveryDetails';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccess from './components/OrderSuccess';
import OrderHistory from './components/OrderHistory';
import OrderDetails from './components/OrderDetails';

import ProductPage from './components/ProductPage';

import ProfilePage from './components/ProfilePage';
import Login from './components/Login';
import { NotFound } from './components/NotFound';

import BrandLogoNameWhite from './assets/images/fabricraft-logo-name-white.png';

import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()


function App() {
  console.log("App is being loaded . . .");

  const [isSplashVisible, setIsSplashVisible] = useState(false)

  useEffect(() => {
    console.log('App useEffect Loaded');
    
    setIsSplashVisible(true);
    setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);
  }, []);

  if(isSplashVisible) {
    return <SplashScreen logo={BrandLogoNameWhite}/>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AuthProvider>
          <DataProvider>
            <Router>
              <TopNavbar/>

              <Routes>
                <Route path='/' element={<Home/>} exact/>
                <Route path='/search' element={<SearchManager/>} exact/>
                <Route path='/category/:categorySlug' element={<CategoryProducts/>} exact/>
                <Route path='/category' element={<CategoriesPage/>} exact/>

                <Route path='/product/:productId' element={<ProductPage/>} exact/>

                <Route path='/wishlist' element={<WishListPage/>} exact/>
                <Route path='/cart' element={<CartPage/>} exact/>
                <Route path='/delivery-details' element={<DeliveryDetails/>} exact/>
                <Route path='/checkout' element={<CheckoutPage/>} exact/>
                <Route path='/order-success' element={<OrderSuccess/>} exact/>

                <Route path='/' element={<PrivateOutlet/>}>
                  <Route path='profile' element={<ProfilePage/>} exact/>
                  <Route path='order-history' element={<OrderHistory/>} exact/>
                  <Route path='order-history/:orderId' element={<OrderDetails/>} exact/>
                </Route>

                <Route path='admin-panel/' element={<AdminOutlet/>}>
                  <Route path='' element={<AdminDashboard/>}/>
                  
                  <Route path='admin-manager' element={<AdminManager/>}/>

                  <Route path='product-dashboard' element={<ProductDashboard/>}/>
                  <Route path='product-dashboard/categories/' element={<ProductCategoryManager/>}/>
                  <Route path='product-dashboard/categories/:slug' element={<UpdateProductCategory/>}/>
                  <Route path='product-dashboard/categories/:slug/size-chart' element={<ProductSizeChart/>}/>
                  <Route path='product-dashboard/categories/:slug/description' element={<ProductDescription/>}/>
                  <Route path='product-dashboard/banner' element={<BannerManager/>}/>
                  
                  <Route path='product-dashboard/product-manager' element={<ProductManager/>}/>

                  <Route path='order-manager' element={<AdminDashboard/>}/>
                  <Route path='user-manager' element={<AdminDashboard/>}/>
                  <Route path='accounce-manager' element={<AdminDashboard/>}/>
                </Route>

                <Route path='/login' element={<Login/>}/>
                <Route path='*' element={<NotFound/>}/>
              </Routes>

              <BottomNavbar/>
            </Router>
          </DataProvider>
        </AuthProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
 