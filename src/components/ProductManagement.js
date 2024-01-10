import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';


function ProductManagement() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const {userProfile} = authData;

  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCategoryTitle, setSearchCategoryTitle] = useState('All Categories');

  const demoProductList = [
    {
        "product_id": 7,
        "product_category": {"id": 1, "category_name": "Category 1"},
        "product_description": {"id": 1, "description": "Product 1 Description"},
        "product_size_chart": {"id": 1, "size_chart": "Product 1 Size Chart"},
        "store": {"id": 1, "store_name": "Store 1"},
        "updated_at": "2023-01-01",
        "product_name": "Product 1",
        "product_sell_price": 80.00,
        "product_discount": 10.00,
        "sale_count": 50,
        "visit_count": 100,
        "wishlist_count": 20,
        "quantity_in_stock": {"small": 100, "medium": 150, "large": 120},
        "is_archived": false,
        "video_url": "https://www.youtube.com/watch?v=example1"
    },
    {
        "product_id": 1,
        "product_category": {"id": 2, "category_name": "Category 2"},
        "product_description": {"id": 2, "description": "Product 2 Description"},
        "product_size_chart": {"id": 2, "size_chart": "Product 2 Size Chart"},
        "store": {"id": 2, "store_name": "Store 2"},
        "updated_at": "2023-01-02",
        "product_name": "Product 2",
        "product_sell_price": 70.00,
        "product_discount": 8.00,
        "sale_count": 30,
        "visit_count": 80,
        "wishlist_count": 15,
        "quantity_in_stock": {"small": 80, "medium": 120, "large": 90},
        "is_archived": false,
        "video_url": "https://www.youtube.com/watch?v=example2"
    },{
        "product_id": 8,
        "product_category": {"id": 1, "category_name": "Category 1"},
        "product_description": {"id": 1, "description": "Product 1 Description"},
        "product_size_chart": {"id": 1, "size_chart": "Product 1 Size Chart"},
        "store": {"id": 1, "store_name": "Store 1"},
        "updated_at": "2023-01-01",
        "product_name": "Product 1",
        "product_sell_price": 80.00,
        "product_discount": 10.00,
        "sale_count": 50,
        "visit_count": 100,
        "wishlist_count": 20,
        "quantity_in_stock": {"small": 100, "medium": 150, "large": 120},
        "is_archived": false,
        "video_url": "https://www.youtube.com/watch?v=example1"
    },
    {
        "product_id": 3,
        "product_category": {"id": 2, "category_name": "Category 2"},
        "product_description": {"id": 2, "description": "Product 2 Description"},
        "product_size_chart": {"id": 2, "size_chart": "Product 2 Size Chart"},
        "store": {"id": 2, "store_name": "Store 2"},
        "updated_at": "2023-01-02",
        "product_name": "Product 2",
        "product_sell_price": 70.00,
        "product_discount": 8.00,
        "sale_count": 30,
        "visit_count": 80,
        "wishlist_count": 15,
        "quantity_in_stock": {"small": 80, "medium": 120, "large": 90},
        "is_archived": false,
        "video_url": "https://www.youtube.com/watch?v=example2"
    },{
        "product_id": 15,
        "product_category": {"id": 1, "category_name": "Category 1"},
        "product_description": {"id": 1, "description": "Product 1 Description"},
        "product_size_chart": {"id": 1, "size_chart": "Product 1 Size Chart"},
        "store": {"id": 1, "store_name": "Store 1"},
        "updated_at": "2023-01-01",
        "product_name": "Product 1",
        "product_sell_price": 80.00,
        "product_discount": 10.00,
        "sale_count": 50,
        "visit_count": 100,
        "wishlist_count": 20,
        "quantity_in_stock": {"small": 100, "medium": 150, "large": 120},
        "is_archived": false,
        "video_url": "https://www.youtube.com/watch?v=example1"
    }
  ]
  const demoProductCategories = [
    {
        'title': 'T-Shirts',
        'description': 'Casual and comfortable T-shirts for all occasions.',
        'cover_picture': 'tshirts_cover.jpg',
        'profile_picture': 'tshirts_profile.jpg',
        'show_in_home_page': true,
    },
    {
        'title': 'Casual Shirt',
        'description': 'Elegant and stylish dresses for any event.',
        'cover_picture': 'dresses_cover.jpg',
        'profile_picture': 'dresses_profile.jpg',
        'show_in_home_page': true,
    },
    {
        'title': 'Jeans',
        'description': 'Classic and trendy jeans for a fashionable look.',
        'cover_picture': 'jeans_cover.jpg',
        'profile_picture': 'jeans_profile.jpg',
        'show_in_home_page': true,
    },
    {
        'title': 'Sweaters',
        'description': 'Warm and cozy sweaters to stay comfortable in winter.',
        'cover_picture': 'sweaters_cover.jpg',
        'profile_picture': 'sweaters_profile.jpg',
        'show_in_home_page': true,
    },
    {
        'title': 'Activewear',
        'description': 'Sporty and functional activewear for an active lifestyle.',
        'cover_picture': 'activewear_cover.jpg',
        'profile_picture': 'activewear_profile.jpg',
        'show_in_home_page': false,
    },
  ]

  const [productCategories, setProductCategories] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const [productList, setProductList] = useState([]);
  const [visibleProductList, setVisibleProductList] = useState([]);

  const [stockSortState, setStockSortState] = useState(0);
  const [saleSortState, setSaleSortState] = useState(0);
  const [popularitySortState, setPopularitySortState] = useState(0);

    const populateVisibleProductList = async (productList) => {
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
                sortedProductList = sortedProductList.sort((a, b) => b.sale_count - a.sale_count);
            }
            else if(saleSortState === 2) {
                sortedProductList = sortedProductList.sort((a, b) => a.sale_count - b.sale_count);
            }
        }
        else if(popularitySortState !== 0) {
            if(popularitySortState === 1) {
                sortedProductList = sortedProductList.sort((a, b) => (b.visit_count + (b.wishlist_count * 3) + (b.sale_count * 11)) - (a.visit_count + (a.wishlist_count * 3) + (a.sale_count * 11)));
            }
            else if(popularitySortState === 2) {
                sortedProductList = sortedProductList.sort((a, b) => (a.visit_count + (a.wishlist_count * 3) + (a.sale_count * 11)) - (b.visit_count + (b.wishlist_count * 3) + (b.sale_count * 11)));
            }
        }
        else {
            populateVisibleProductList(productList);
        }
        
        populateVisibleProductList(sortedProductList);
    }

    useEffect(() => {
        populateVisibleProductList(productList);
    }, [productList]);

    useEffect(() => {
        setProductList(demoProductList);
        setProductCategories(demoProductCategories);
    }, []);

    const searchProducts = () => {
        console.log(`Searching products: searchID: ${searchId}, searchName: ${searchName}, searchCategory: ${searchCategoryTitle}`);
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


  console.log('product list is being loaded');

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Product Management</h1>
      
      <div className="card-container">

        <div className="product-management-card" onClick={() => navigate('product-management')}>
          <i className="fa fa-shopping-bag" aria-hidden="true"></i>
          <p>Add Product</p>
        </div>

        <div className="product-management-card" onClick={() => navigate('order-management')}>
          <i className="fa fa-refresh" aria-hidden="true"></i>
          <p>Restock</p>
        </div>

        <div className="product-management-card" onClick={() => navigate('user-management')}>
            <i className="fa fa-ban" aria-hidden="true"></i>
            <p>Stock Out</p>
        </div>

        <div className="product-management-card" onClick={() => navigate('categories')}>
            <i className="fa fa-th-list" aria-hidden="true"></i>
            <p>Categories</p>
        </div>

        <div className="product-management-card" onClick={() => navigate('accounce-management')}>
            <i className="fa fa-bullhorn" aria-hidden="true"></i>
            <p>Offers</p>
        </div>

        <div className="product-management-card" onClick={() => navigate('accounce-management')}>
            <i className="fa fa-image" aria-hidden="true"></i>
            <p>Banners</p>
        </div>


        <div className="product-management-container">
            <div className="product-management-first-row">
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
                        productCategories.map((category) => {
                            return (<option key={category.id} value={category.title}>{category.title}</option>);
                        })
                    }
                </select>
                <button onClick={searchProducts}>Search</button>
                <button onClick={createDiscount}>Create Discount</button>
            </div>

            <div className="product-management-second-row">
                <p>Total Product - {visibleProductList ? visibleProductList.length : 0} : Selected Products - {visibleProductList ? visibleProductList.filter(product => product.is_selected).length : 0}</p>
            </div>

            <table className="product-management-product-table">
                <thead>
                <tr>
                    <th>
                    <input type="checkbox" checked={allSelected} onChange={handleSelectAllProducts} />
                    </th>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th onClick={stockSortClicked}>Stock {stockSortState === 0 ? <i class="fa fa-sort" aria-hidden="true"></i> : (stockSortState === 1 ? <i class="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i class="fa fa-sort-amount-desc" aria-hidden="true"></i>)}</th>
                    <th onClick={saleSortClicked}>Sale {saleSortState === 0 ? <i class="fa fa-sort" aria-hidden="true"></i> : (saleSortState === 1 ? <i class="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i class="fa fa-sort-amount-desc" aria-hidden="true"></i>)}</th>
                    <th onClick={popularitySortClicked}>Popularity {popularitySortState === 0 ? <i class="fa fa-sort" aria-hidden="true"></i> : (popularitySortState === 1 ? <i class="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i class="fa fa-sort-amount-desc" aria-hidden="true"></i>)}</th>
                </tr>
                </thead>
                <tbody>
                {visibleProductList && visibleProductList.map((product) => (
                    <tr key={product.product_id}>
                        <td>
                            <input
                                type='checkbox'
                                checked={product.is_selected}
                                onChange={() => handleProductSelection(product.product_id)}
                            />
                        </td>
                        <td>{product.product_id}</td>
                        <td>
                            <img src='https://fabrilife.com/products/652a3e0dd0762-square.jpg' alt={product.product_name} />
                        </td>
                        <td>{product.product_name}</td>
                        <td>
                            <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>৳{product.product_sell_price}</span><br />
                            ৳{product.product_sell_price - ((product.product_sell_price * product.product_discount) / 100)} <br />
                            <span style={{ fontWeight: 200, fontSize: '0.9rem' }}>{'('}{product.product_discount}% off{')'}</span> <br />
                        </td>
                        <td>
                            <p>
                                {Object.entries(product.quantity_in_stock).map(([key, value]) => (
                                    <span key={key} style={{ fontWeight: 200, fontSize: '0.9rem' }}>{key}: {value} <br /></span>
                                ))}
                            </p>
                        </td>
                        <td style={{ fontWeight: 200, fontSize: '0.9rem' }}>{product.sale_count}</td>
                        <td style={{ fontWeight: 200, fontSize: '0.9rem' }}>{product.visit_count + (product.wishlist_count * 3) + (product.sale_count * 11)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
      <br /><br /><br />
    </div>
  );
}

export default React.memo(ProductManagement);