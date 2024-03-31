import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import React, { useContext, useState, useEffect } from "react";

import Axios from "axios";

import ProductImages from "./ProductImages";
import ProductTags from "./ProductTags";

import { DataContext } from "../contexts/DataContext";

import { useQuery } from "react-query";

const axiosInstance = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/product/",
});

function ProductManager() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const { dataContextData } = useContext(DataContext);
  const { updateProductCategories, setIsLoading } = dataContextData;

  const { state } = useLocation();

  const [updatingProduct, setUpdatingProduct] = useState({});
  const [adminPassword, setAdminPassword] = useState("");

  const [selectedProductCategory, setSelectedProductCategory] = useState({});
  const [selectedProductDescription, setSelectedProductDescription] = useState(
    {}
  );
  const [selectedProductSizeChart, setSelectedProductSizeChart] = useState({});

  const [productDescriptions, setProductDescriptions] = useState(null);
  const [productSizeCharts, setProductSizeCharts] = useState(null);

  const ProductCategories = useQuery(
    `product-categories`,
    async () => {
      const response = await axiosInstance.get("category/");
      if (response.data) {
        if (
          !("product_category" in updatingProduct) &&
          !("product_category" in state)
        ) {
          setSelectedProductCategory(response.data[0]);
        }
      }
      return response;
    }
  );

  const fetchRelatedProductDescriptionAndSizeChart = async () => {
    try {
      console.log("fetching product description and size chart : started");

      const token = await getAccessToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const productDescription = await axiosInstance.get(
        `description/category/${selectedProductCategory?.title}`,
        config
      );
      const productSizeChart = await axiosInstance.get(
        `sizechart/category/${selectedProductCategory?.title}`,
        config
      );

      console.log("productDescriptions: ", productDescription.data);
      console.log("productSizeCharts: ", productSizeChart.data);

      if (productDescription?.data.length > 0) {
        if (state) {
          const description = productDescription.data.find(
            (item) => item.id === state.product_description.id
          );
          if (description) {
            console.log(
              "fetched : state : setSelectedProductDescription from state: ",
              description
            );
            if (selectedProductDescription?.id !== description?.id) {
              setSelectedProductDescription(description);
            }
          } else {
            console.log("description not found from state", state);
          }
        } else {
          console.log(
            "fetched : first : setSelectedProductDescription: ",
            productDescription.data[0]
          );
          setSelectedProductDescription(productDescription.data[0]);
        }
        setProductDescriptions(productDescription.data);
      }
      if (productSizeChart?.data.length > 0) {
        if (state) {
          const sizechart = productSizeChart.data.find(
            (item) => item.id === state.product_size_chart.id
          );
          if (sizechart) {
            console.log(
              "fetched : state : setSelectedProductSizeChart from state: ",
              sizechart
            );
            if (selectedProductSizeChart?.id !== sizechart.id) {
              setSelectedProductSizeChart(sizechart);
            }
          } else {
            console.log("sizechart not found from state", state);
          }
        } else {
          console.log(
            "fetched : first : setSelectedProductSizeChart: ",
            productSizeChart.data[0]
          );
          setSelectedProductSizeChart(productSizeChart.data[0]);
        }
        setProductSizeCharts(productSizeChart.data);
      }
      console.log("fetching product description and size chart : ended");
    } catch (e) {
      console.log("Exception occoured: ", e);
    }
  };

  useEffect(() => {
    console.log(
      "SelectedProductCategory useEffect started: ",
      selectedProductCategory
    );
    fetchRelatedProductDescriptionAndSizeChart();

    if (ProductCategories.isLoading) return;
    const category = ProductCategories.data.data.find(
      (item) => item.title === selectedProductCategory?.title
    );

    if (!category) return;
    setUpdatingProduct((prev) => ({ ...prev, product_category: category }));

    console.log("SelectedProductCategory useEffect ended");
  }, [selectedProductCategory]);

  useEffect(() => {
    console.log(
      "selectedProductDescription useEffect started: ",
      selectedProductDescription
    );

    if (!productDescriptions) return;
    const description = productDescriptions.find(
      (item) => item.title === selectedProductDescription?.title
    );

    if (!description) return;
    setUpdatingProduct((prev) => ({
      ...prev,
      product_description: description,
    }));

    console.log("selectedProductDescription useEffect ended");
  }, [selectedProductDescription]);

  useEffect(() => {
    console.log(
      "selectedProductSizeChart useEffect started: ",
      selectedProductSizeChart
    );

    if (!productSizeCharts) return;
    const sizeChart = productSizeCharts.find(
      (item) => item.title === selectedProductSizeChart?.title
    );

    if (!sizeChart) return;

    const sizes = sizeChart.size_chart.map((item) => item.Size);
    const stock = Object.fromEntries(sizes.map((size) => [size, 0]));

    setUpdatingProduct((prev) => ({
      ...prev,
      product_size_chart: sizeChart,
      product_stock: stock,
    }));

    console.log("selectedProductSizeChart useEffect ended");
  }, [selectedProductSizeChart]);

  useEffect(() => {
    console.log("state use effect : started");
    if (state) {
      console.log("updarting the product: ", state);

      setUpdatingProduct(state);

      setSelectedProductCategory(state.product_category);

      console.log(
        "state loaded : setSelectedProductDescription: ",
        state.product_description
      );
      if (selectedProductDescription?.id !== state.product_description.id) {
        setSelectedProductDescription(state.product_description);
      }

      console.log(
        "state loaded : setSelectedProductSizeChart from state: ",
        state.product_size_chart
      );
      if (selectedProductSizeChart?.id !== state.product_size_chart.id) {
        setSelectedProductSizeChart(state.product_size_chart);
      }
    } else {
      console.log("creating new product");

      setUpdatingProduct({
        product_name: "",
        product_selling_price: 0,
        product_discount: 0,
        product_base_price: 0,
        is_archived: false,
        video_url: "",
      });

      if (
        !ProductCategories.isLoading &&
        !("product_category" in updatingProduct)
      ) {
        console.log(
          "selecting product category:",
          ProductCategories.data.data[0]
        );

        setSelectedProductCategory(ProductCategories.data.data[0]);
      }
    }
    console.log("state use effect : ended");
  }, [state]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log("updatingProduct useeffect: ", updatingProduct);
  }, [updatingProduct]);

  const handleInputChange = (e) => {
    if (e.target.name === "is_archived") {
      setUpdatingProduct((prev) => ({
        ...prev,
        [e.target.name]: !prev.is_archived,
      }));
    } else {
      setUpdatingProduct((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatingProduct((prev) => ({
          ...prev,
          [e.target.name]: selectedFile,
          [`${e.target.name}_preview`]: reader.result,
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const updateSelectedProductDescription = (title) => {
    const item =
      productDescriptions?.find((item) => item.title === title) || {};
    if (item) {
      console.log("update : setSelectedProductDescription: ", item);
      if (selectedProductDescription?.id !== item.id) {
        setSelectedProductDescription(item);
      }
    }
  };
  const updateSelectedProductSizeChart = (title) => {
    const item = productSizeCharts?.find((item) => item.title === title) || {};
    if (item) {
      console.log("update : setSelectedProductSizeChart from state: ", item);
      if (selectedProductSizeChart?.id !== item.id) {
        setSelectedProductSizeChart(item);
      }
    }
  };

  const handleProductStockChange = async (key, value) => {
    console.log("handleProductStockChange : started");
    const updatedStock = { ...updatingProduct.product_stock };
    updatedStock[key] = value;
    console.log("handleProductStockChange :", updatedStock);
    setUpdatingProduct((prev) => ({ ...prev, product_stock: updatedStock }));
    console.log("handleProductStockChange : ended");
  };

  const saveCategory = async () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(updatingProduct)) {
      formData.append(key, value);
    }
    formData.append("admin_password", adminPassword);

    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      console.log("calling saveCategory");
      setIsLoading(true);
      const response = await axiosInstance.post("category/", formData, config);
      console.log("saveCategory response: ", await response.data);
      if ("data" in response) {
        updateProductCategories(await response.data);
      }
      setIsLoading(false);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    } catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    navigate(-1);
  };

  const deleteProduct = async () => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    try {
      const data = {
        admin_password: adminPassword,
        product_id: updatingProduct.product_id,
      };
      console.log("data: ", data);
      setIsLoading(true);

      const response = await axiosInstance.post(
        "product/delete/",
        data,
        config
      );
      console.log("deleteProduct response: ", await response.data);

      setIsLoading(false);
      const toast_message = `Deleted Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    } catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
    navigate(-1);
  };

  const saveProduct = async () => {
    console.log("save product: ", updatingProduct);

    const product = { ...updatingProduct };
    product["product_category"] = updatingProduct["product_category"].title;
    product["product_description"] =
      updatingProduct["product_description"].title;
    product["product_size_chart"] = updatingProduct["product_size_chart"].title;

    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const data = { admin_password: adminPassword };
    data["product_data"] = product;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("product/", data, config);
      console.log("save product response: ", await response.data);
      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);

      setIsLoading(false);
      navigate(-1);
    } catch (e) {
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response?.statusText}`;
      showToast(exception_message);
      setIsLoading(false);
    }
  };

  console.log("Product Management page is being loaded");

  return (
    <div className="admin-panel-container">
      {state && <h1 className="page-title">#{state.product_id}</h1>}
      <h1 className="page-title">
        {" "}
        {state ? `Update : ${state.product_name}` : "Create New Product"}
      </h1>

      <div className="card-container">
        <div
          className="product-category-edit-container"
          style={{ maxWidth: "600px", marginTop: "0px" }}
        >
          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="Product Name"
              value={updatingProduct.product_name}
              onChange={handleInputChange}
              name="product_name"
            />
          </div>
          <div className="product-category-form-row">
            <select
              className="editable-light"
              name="product_category"
              value={selectedProductCategory?.title}
              onChange={(e) => {
                setSelectedProductCategory(
                  ProductCategories.isLoading
                    ? {}
                    : ProductCategories.data.data.find(
                        (item) => item.title === e.target.value
                      )
                );
              }}
            >
              {!ProductCategories.isLoading &&
                ProductCategories.data.data.map((categories) => {
                  return (
                    <option
                      key={categories.id}
                      id={categories.id}
                      value={categories.title}
                    >
                      {categories.title}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="product-category-form-row">
            <select
              className="editable-light"
              name="product_description"
              value={selectedProductDescription?.title}
              onChange={(e) => {
                updateSelectedProductDescription(e.target.value);
              }}
            >
              {productDescriptions &&
                productDescriptions.map((description) => {
                  return (
                    <option
                      key={description.id}
                      id={description.id}
                      value={description.title}
                    >
                      {description.title}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="product-category-form-row">
            <select
              className="editable-light"
              name="product_size_chart"
              value={selectedProductSizeChart?.title}
              onChange={(e) => {
                updateSelectedProductSizeChart(e.target.value);
              }}
            >
              {productSizeCharts &&
                productSizeCharts.map((sizechart) => {
                  return (
                    <option
                      key={sizechart.id}
                      id={sizechart.id}
                      value={sizechart.title}
                    >
                      {sizechart.title}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="product-description-container">
            <hr className="product-description-hzline" />
            <span className="product-description-title">Description</span>
            <hr className="product-description-hzline" />

            <div className="product-description-text">
              {selectedProductDescription?.description
                ?.split("\n")
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <div className="product-description-specification-container">
              <span className="product-description-specification-title">
                Detailed Specification
              </span>
              <hr className="product-description-hzline" />
              <ul>
                {selectedProductDescription?.specification
                  ?.split("\n")
                  .map((line, index) =>
                    line ? <li key={index}>{line}</li> : ""
                  )}
              </ul>
            </div>
          </div>
          <div
            className="product-description-container"
            style={{ marginLeft: 0 }}
          >
            <span className="product-description-specification-title">
              Size chart - In inches
            </span>
            <span
              style={{ marginLeft: "10px", fontWeight: 500, fontSize: "0.8em" }}
            >
              {"(Expected Deviation < 3%)"}
            </span>

            {selectedProductSizeChart &&
              "size_chart" in selectedProductSizeChart && (
                <table className="product-size-chart-table">
                  <thead>
                    <tr>
                      {Object.keys(selectedProductSizeChart.size_chart[0]).map(
                        (header) => (
                          <th
                            className="product-size-chart-table-cell"
                            key={header}
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProductSizeChart.size_chart.map(
                      (sizeInfo, sizeIndex) => (
                        <tr key={sizeIndex}>
                          {Object.values(sizeInfo).map((value, idx) => (
                            <td
                              className="product-size-chart-table-cell"
                              key={idx}
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
          </div>
          <div>
            <div className="product-description-container">
              <span className="product-description-specification-title">
                Product Pricing
              </span>
              <hr className="product-description-hzline" />
            </div>
            <div className="product-manager-pricing-container">
              <div className="product-manager-pricing-row">
                <div className="product-manager-pricing-column">
                  <label htmlFor="product_base_price">Base Price:</label>
                  <input
                    type="number"
                    id="product_base_price"
                    name="product_base_price"
                    onChange={handleInputChange}
                    value={
                      updatingProduct && updatingProduct.product_base_price
                    }
                  />
                </div>
                <div className="product-manager-pricing-column">
                  <label htmlFor="product_selling_price">Product Price:</label>
                  <input
                    type="number"
                    id="product_selling_price"
                    name="product_selling_price"
                    onChange={handleInputChange}
                    value={
                      updatingProduct && updatingProduct.product_selling_price
                    }
                  />
                </div>
              </div>
              <div className="product-manager-pricing-row">
                <div className="product-manager-pricing-column">
                  <label htmlFor="product_discount">Discount Percentage:</label>
                  <input
                    type="number"
                    id="product_discount"
                    name="product_discount"
                    onChange={handleInputChange}
                    value={updatingProduct && updatingProduct.product_discount}
                  />
                </div>
                <div className="product-manager-pricing-column product-manager-center-content">
                  <span className="product-description-title" id="salePrice">
                    <span style={{ paddingRight: "10px", fontWeight: 600 }}>
                      Final Price:
                    </span>
                    {updatingProduct &&
                      updatingProduct.product_selling_price -
                        (updatingProduct.product_selling_price *
                          updatingProduct.product_discount) /
                          100.0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {updatingProduct.product_stock && (
            <div>
              <div className="product-description-container">
                <span className="product-description-specification-title">
                  Product Stock
                </span>
                <hr className="product-description-hzline" />
              </div>
              <div className="product-size-chart-table product-size-chart-form-row">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(updatingProduct.product_stock).map(
                        (header, col) => (
                          <th key={col}>{header}</th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.entries(updatingProduct.product_stock).map(
                        ([key, value]) => (
                          <td key={key}>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                handleProductStockChange(key, e.target.value)
                              }
                            />
                          </td>
                        )
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="product-is-archived">
            <input
              type="checkbox"
              checked={updatingProduct.is_archived}
              onChange={handleInputChange}
              name="is_archived"
            />
            <label
              className="product-description-specification-title"
              style={{ paddingTop: "15px" }}
            >
              Archived
            </label>
          </div>
          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="Video URL"
              value={updatingProduct.video_url}
              onChange={handleInputChange}
              name="video_url"
            />
          </div>
          {state && 
            <div>
              <div>         
                <div className="product-description-container">
                  <span className="product-description-specification-title">
                    Product Photos
                  </span>
                  <hr className="product-description-hzline" />
                </div>
                <ProductImages
                  selectedProduct={state}
                  adminPassword={adminPassword}
                />
              </div>
              <div>         
                <div className="product-description-container">
                  <span className="product-description-specification-title">
                    Product Tags
                  </span>
                  <hr className="product-description-hzline" />
                </div>
                <ProductTags
                  selectedProduct={state}
                  adminPassword={adminPassword}
                />
              </div>
            </div>
          }
            <div className="product-category-form-row">
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            <div className="product-category-buttons">
              <button
                onClick={saveProduct}
                style={{ padding: "20px", width: "100%", fontSize: "medium" }}
              >
                {state ? "Update" : "Save"}
              </button>
              {state && (
                <button
                  onClick={deleteProduct}
                  style={{ padding: "20px", width: "100%", fontSize: "medium" }}
                >
                  Delete
                </button>
              )}
            </div>
        </div>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}

export default React.memo(ProductManager);
