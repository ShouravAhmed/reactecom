import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { Image } from './Image';

const axiosInstance = Axios.create({
    baseURL: "http://127.0.0.1:8000/api/product/",
});



function ProductDashboard() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast, userProfile } = authData;

  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCategoryTitle, setSearchCategoryTitle] = useState('All Categories');

  const [allSelected, setAllSelected] = useState(false);

  const [productList, setProductList] = useState([]);
  const [visibleProductList, setVisibleProductList] = useState([]);

  const [stockSortState, setStockSortState] = useState(0);
  const [saleSortState, setSaleSortState] = useState(0);
  const [popularitySortState, setPopularitySortState] = useState(0);

  const ProductCategories = useQuery(`product-categories`, async () => {
    return axiosInstance.get('category/');
  });

    const populateVisibleProductList = async (productList) => {
        console.log('populateVisibleProductList: ', productList)
        const initProducts = [];
        for(let product of productList) {
            initProducts.push({...product, is_selected: false})
        }
        setVisibleProductList(initProducts);
        console.log("new populated products: ", initProducts);
    };

    const sortProductList = async () => {
        let sortedProductList = [...productList];
        
        if(saleSortState !== 0) {
            if(saleSortState === 1) {
                sortedProductList = sortedProductList.sort((a, b) => b.product_sale_count - a.product_sale_count);
            }
            else if(saleSortState === 2) {
                sortedProductList = sortedProductList.sort((a, b) => a.product_sale_count - b.product_sale_count);
            }
        }
        else if(popularitySortState !== 0) {
            if(popularitySortState === 1) {
                sortedProductList = sortedProductList.sort((a, b) => (b.product_visit_count + (b.product_wishlist_count * 3) + (b.product_sale_count * 11)) - (a.product_visit_count + (a.product_wishlist_count * 3) + (a.product_sale_count * 11)));
            }
            else if(popularitySortState === 2) {
                sortedProductList = sortedProductList.sort((a, b) => (a.product_visit_count + (a.product_wishlist_count * 3) + (a.product_sale_count * 11)) - (b.product_visit_count + (b.product_wishlist_count * 3) + (b.product_sale_count * 11)));
            }
        }
        
        populateVisibleProductList(sortedProductList);
    }

    useEffect(() => {
        console.log('productList useEffect: ', productList)
        populateVisibleProductList(productList);
    }, [productList]);

    const fetchAdminProducts = async () => {
        const token = await getAccessToken();
        const config = {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        };
        
        console.log(`fetchAdminProducts: (${searchId})(${searchName})(${searchCategoryTitle})`);

        const response = await axiosInstance.post(
            'product/admin-product/',
            {'searchId':searchId, 'searchName':searchName, 'searchCategoryTitle':searchCategoryTitle}, 
            config
        );

        console.log('setProductList: ', response.data);
        setProductList(response.data);
    }

    useEffect(() => {
        fetchAdminProducts();
    }, []);

    const searchProducts = () => {
        console.log(`Searching products: searchID: ${searchId}, searchName: ${searchName}, searchCategory: ${searchCategoryTitle}`);
        fetchAdminProducts();
    };

    const createDiscount = () => {
        const selectedProductIds = visibleProductList
            .filter(product => product.is_selected)
            .map(product => product.product_id);

        console.log('Create discount for Selected Product IDs:', selectedProductIds);
    };

    const handleSelectAllProducts = () => {
        console.log('Toggling select all products');
        const totalSelectedProduct = visibleProductList.filter(product => product.is_selected).length;

        console.log("total seleced: ", totalSelectedProduct);

        if (visibleProductList.length === totalSelectedProduct.length || allSelected) {
            const updatedProducts = visibleProductList.map((product) => { 
                return {...product, is_selected: false};
            });
            
            setVisibleProductList(updatedProducts);
            setAllSelected(false);

            console.log('updatedProducts: ', updatedProducts);
        } 
        else {
            const updatedProducts = visibleProductList.map((product) => {
                return {...product, is_selected: true};
            });
            
            setVisibleProductList(updatedProducts);
            setAllSelected(true);

            console.log('updatedProducts: ', updatedProducts);
        }
    };

  const handleProductSelection = (productId) => {
    console.log("handle product selection: ", productId);

    setVisibleProductList((prevProducts) => {
        const updatedProducts = prevProducts.map((product) => ((product.product_id === productId) ? {...product, is_selected: !product.is_selected} : product));

        console.log('=> Updated products: ', updatedProducts);

        const isAllProductSelected = updatedProducts.every(
            (product) => product.is_selected
        );
        setAllSelected(isAllProductSelected);

        console.log('Updated products: ', updatedProducts);

        return updatedProducts;
    });
  };

  const stockSortClicked = () => {
    setStockSortState((prv) => {
        setSaleSortState(0);
        setPopularitySortState(0);
        if(prv === 2) return 0;
        if(prv === 0) return 1;
        if(prv === 1) return 2;
    });
  }

  const saleSortClicked = () => {
    setSaleSortState((prv) => {
        setStockSortState(0);
        setPopularitySortState(0);
        if(prv === 2) return 0;
        if(prv === 0) return 1;
        if(prv === 1) return 2;
    });
  }


  const popularitySortClicked = () => {
    setPopularitySortState((prv) => {
        setSaleSortState(0);
        setStockSortState(0);
        if(prv === 2) return 0;
        if(prv === 0) return 1;
        if(prv === 1) return 2;
    });
  }

    useEffect(() => {
        sortProductList();
    }, [saleSortState, stockSortState, popularitySortState]);


    useEffect(() => {
        console.log('visibleProductList: ', visibleProductList);
    }, [visibleProductList]);

  console.log('product list is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Product Dashboard</h1>
      
      <div className="card-container">

        <div className="product-dashboard-card" onClick={() => navigate('product-manager')} style={{cursor: 'pointer'}}>
          <i className="fa fa-shopping-bag" aria-hidden="true"></i>
          <p>Add Product</p>
        </div>

        <div className="product-dashboard-card" onClick={() => navigate('order-manager')} style={{cursor: 'pointer'}}>
          <i className="fa fa-refresh" aria-hidden="true"></i>
          <p>Restock</p>
        </div>

        <div className="product-dashboard-card" onClick={() => navigate('user-manager')} style={{cursor: 'pointer'}}>
            <i className="fa fa-ban" aria-hidden="true"></i>
            <p>Stock Out</p>
        </div>

        <div className="product-dashboard-card" onClick={() => navigate('categories')} style={{cursor: 'pointer'}}>
            <i className="fa fa-th-list" aria-hidden="true"></i>
            <p>Categories</p>
        </div>

        <div className="product-dashboard-card" onClick={() => navigate('accounce-manager')} style={{cursor: 'pointer'}}>
            <i className="fa fa-bullhorn" aria-hidden="true"></i>
            <p>Offers</p>
        </div>

        <div className="product-dashboard-card" onClick={() => navigate('banner')} style={{cursor: 'pointer'}}>
            <i className="fa fa-image" aria-hidden="true"></i>
            <p>Banners</p>
        </div>


        <div className="product-dashboard-container">
            <div className="product-dashboard-first-row">
                <input
                type="text"
                placeholder="ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                />
                <input
                type="text"
                placeholder="Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                />
                <select
                value={searchCategoryTitle}
                onChange={(e) => setSearchCategoryTitle(e.target.value)}
                >
                    <option value="All Categories">All Categories</option>
                    {
                        !ProductCategories.isLoading && ProductCategories.data.data.map((category) => {
                            return (<option key={category.category_order} value={category.title}>{category.title}</option>);
                        })
                    }
                </select>
                <button onClick={searchProducts}>Search</button>
                <button onClick={createDiscount}>Create Discount</button>
            </div>

            <div className="product-dashboard-second-row">
                <p>Total Product - {visibleProductList ? visibleProductList.length : 0} : Selected Products - {visibleProductList ? visibleProductList.filter(product => product.is_selected).length : 0}</p>
            </div>

            <table className="product-dashboard-product-table">
                <thead>
                <tr>
                    <th>
                    <input type="checkbox" checked={allSelected} onChange={handleSelectAllProducts} />
                    </th>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th onClick={stockSortClicked}>Stock {stockSortState === 0 ? <i className="fa fa-sort" aria-hidden="true"></i> : (stockSortState === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>)}</th>
                    <th onClick={saleSortClicked}>Sale {saleSortState === 0 ? <i className="fa fa-sort" aria-hidden="true"></i> : (saleSortState === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>)}</th>
                    <th onClick={popularitySortClicked}>Popularity {popularitySortState === 0 ? <i className="fa fa-sort" aria-hidden="true"></i> : (popularitySortState === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>)}</th>
                </tr>
                </thead>
                <tbody>
                {visibleProductList && visibleProductList.map((product) => (
                    <tr key={product.product_id} style={{cursor: 'pointer'}}>
                        <td>
                            <input
                                type='checkbox'
                                checked={product.is_selected}
                                onChange={() => handleProductSelection(product.product_id)}
                            />
                        </td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}}>{product.product_id}</td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}}>
                            <Image 
                                imageUrl={
                                    product.profile_image && product.profile_image
                                }
                                altText={product.product_name}
                                blurHash={product && product.profile_image_blurhash}
                                width={50}
                                height={50}
                                blurHashWidth={50}
                                blurHashHeight={50}
                                borderRadius={10}
                            />
                        </td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}}>
                            {product.product_name} <br/>
                            <span style={{color: 'grey'}}>({product.product_category.title})</span>
                        </td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}}>
                            <span style={{color: 'red'}}>৳{product.product_base_price}</span><br />
                            <span style={{ textDecoration: 'line-through', opacity: 0.5, color: 'blue'}}>৳{product.product_selling_price}</span><br />
                            <span style={{ color: 'green' }}>৳{product.product_selling_price - ((product.product_selling_price * product.product_discount) / 100)} </span><br />
                            <span style={{ fontWeight: 200, color: 'tomato' }}>{'('}{product.product_discount}% off{')'}</span> <br />
                        </td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}}>
                            <p>
                                {product.product_stock && Object.entries(product.product_stock).map(([key, value]) => (
                                    <span key={key} style={{ fontWeight: 200}}>{key}: {value} <br /></span>
                                ))}
                            </p>
                        </td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}} style={{ fontWeight: 200,  }}>{product.product_sale_count}</td>
                        <td onClick={() => {navigate('product-manager', {'state':product})}} style={{ fontWeight: 200, }}>{product.product_visit_count + (product.product_wishlist_count * 3) + (product.product_sale_count * 11)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductDashboard);