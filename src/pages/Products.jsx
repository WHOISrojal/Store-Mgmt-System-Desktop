import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function Products() {
  const [editingId, setEditingId] = useState(null);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [minimumStock, setMinimumStock] = useState("5");
  const [unit, setUnit] = useState("pcs");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("Choose Image");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
      const response = await api.get(`/products?page=${page}`);

      setProducts(response.data.products);

      setCurrentPage(response.data.currentPage);

      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const addProduct = async () => {
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("category", category);
      formData.append("barcode", barcode);
      formData.append("costPrice", Number(costPrice));
      formData.append("sellingPrice", Number(sellingPrice));
      formData.append("stock", Number(stock));
      formData.append("minimumStock", Number(minimumStock));
      formData.append("unit", unit);

      if (image) {
        formData.append("image", image);
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchProducts();

      setName("");
      setCategory("");
      setBarcode("");
      setCostPrice("");
      setSellingPrice("");
      setStock("");
      setImage(null);
      setImageName("Choose Image");

      alert("Product Added Successfully");
    } catch (error) {
      console.error(error);

      alert("Failed to add product");
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);

    setName(product.name);
    setCategory(product.category);
    setBarcode(product.barcode || "");
    setCostPrice(product.costPrice);
    setSellingPrice(product.sellingPrice);
    setMinimumStock(product.minimumStock || 5);
    setUnit(product.unit || "pcs");
    setStock(product.stock);
  };

  const updateProduct = async () => {
    try {
      await api.put(`/products/${editingId}`, {
        name,
        category,
        barcode,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock),
        minimumStock: Number(minimumStock),
        unit,
      });

      fetchProducts();

      setEditingId(null);

      setName("");
      setCategory("");
      setBarcode("");
      setCostPrice("");
      setSellingPrice("");
      setStock("");
      setMinimumStock("5");
      setUnit("pcs");

      alert("Product Updated Successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);

      fetchProducts();

      alert("Product Deleted Successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const viewStockHistory = async (product) => {
    try {
      const response = await api.get(`/stock-movements/${product._id}`);

      setStockHistory(response.data);

      setHistoryProduct(product);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Products</h2>

      <div className="card mb-4">
        <div className="card-header">
          {editingId ? "Update Product" : "Add Product"}
        </div>

        <div className="card-body">
          {editingId && (
            <div className="alert alert-warning mb-4">
              <strong>Editing Product:</strong> {name}
            </div>
          )}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Product Name</label>

              <input
                className="form-control"
                placeholder="Enter Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Category</option>

                <option value="Shirt">Shirt</option>

                <option value="T-Shirt">T-Shirt</option>

                <option value="Pant">Pant</option>

                <option value="Jeans">Jeans</option>

                <option value="Hoodie">Hoodie</option>

                <option value="Sweater">Sweater</option>

                <option value="Track Pant">Track Pant</option>

                <option value="Innerwear">Innerwear</option>

                <option value="Accessories">Accessories</option>

                <option value="Jacket">Jacket</option>

                <option value="Kurta">Kurta</option>

                <option value="Saree">Saree</option>

                <option value="Shoes">Shoes</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Barcode</label>
              <input
                className="form-control"
                placeholder="Enter Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <div className="d-flex gap-2">
                <label
                  className="btn btn-secondary"
                  style={{
                    width: "120px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                  }}
                >
                  {imageName}

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      setImage(e.target.files[0]);

                      if (e.target.files[0]) {
                        const fileName = e.target.files[0].name;

                        setImageName(
                          fileName.length > 15
                            ? fileName.substring(0, 15) + "..."
                            : fileName,
                        );
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setImage(null);
                    setImageName("Choose Image");
                  }}
                >
                  ✖
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Cost Price</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Cost Price"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Selling Price</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Selling Price"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Stock</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Minimum Stock</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Minimum Stock"
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Unit</label>
              <select
                className="form-control"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="ltr">ltr</option>
                <option value="ml">ml</option>
                <option value="box">box</option>
              </select>
            </div>

            <div className="col-md-6">
              {editingId ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-warning" onClick={updateProduct}>
                    Update
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingId(null);

                      setName("");
                      setCategory("");
                      setBarcode("");
                      setCostPrice("");
                      setSellingPrice("");
                      setStock("");
                      setMinimumStock("5");
                      setUnit("pcs");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary w-100" onClick={addProduct}>
                  Add Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Product List</div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Search for Products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>

                <option value="Shirt">Shirt</option>

                <option value="T-Shirt">T-Shirt</option>

                <option value="Pant">Pant</option>

                <option value="Jeans">Jeans</option>

                <option value="Jacket">Jacket</option>

                <option value="Kurta">Kurta</option>

                <option value="Saree">Saree</option>

                <option value="Shoes">Shoes</option>

                <option value="Hoodie">Hoodie</option>

                <option value="Sweater">Sweater</option>

                <option value="Track Pant">Track Pant</option>

                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Barcode</th>
                {role === "ADMIN" && <th>Cost Price</th>}
                <th>Selling Price</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className={
                    product.stock <= product.minimumStock ? "table-danger" : ""
                  }
                >
                  <td>
                    {product.image ? (
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.barcode}</td>
                  {role === "ADMIN" && <td>Rs. {product.costPrice}</td>}
                  <td>Rs. {product.sellingPrice}</td>
                  <td>
                    {product.stock <= product.minimumStock ? (
                      <span className="badge bg-danger">
                        {product.stock} LOW
                      </span>
                    ) : (
                      <span className="badge bg-success">{product.stock}</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => viewStockHistory(product)}
                    >
                      History
                    </button>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => editProduct(product)}
                    >
                      Edit
                    </button>

                    {localStorage.getItem("role") === "ADMIN" && (
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteProduct(product._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {historyProduct && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Stock History - {historyProduct.name}</h5>

                <button
                  className="btn-close"
                  onClick={() => {
                    setHistoryProduct(null);
                    setStockHistory([]);
                  }}
                />
              </div>

              <div className="modal-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Note</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stockHistory.map((movement) => (
                      <tr key={movement._id}>
                        <td>{new Date(movement.createdAt).toLocaleString()}</td>

                        <td>
                          {movement.type === "PURCHASE" ? (
                            <span className="badge bg-success">PURCHASE</span>
                          ) : (
                            <span className="badge bg-danger">SALE</span>
                          )}
                        </td>

                        <td>
                          {movement.type === "SALE"
                            ? `-${movement.quantity}`
                            : `+${movement.quantity}`}
                        </td>

                        <td>{movement.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
