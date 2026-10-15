import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../components/ProductCard';
import '../styles/Admin.css';

const tabs = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'products', label: 'Products', icon: '◇' },
  { id: 'orders', label: 'Orders', icon: '▤' },
];

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardRetry, setDashboardRetry] = useState(0);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [productsRetry, setProductsRetry] = useState(0);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [productImage, setProductImage] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productMessage, setProductMessage] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersRetry, setOrdersRetry] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const response = await api.get('/products');
      const result = Array.isArray(response.data) ? response.data : response.data?.products;
      if (!Array.isArray(result)) throw new Error('Unexpected product response from the server.');
      setProducts(result);
    } catch (error) {
      setProductsError(error.response?.data?.message || error.message || 'Could not load products.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') return undefined;
    let active = true;
    const loadStats = async () => {
      setDashboardLoading(true);
      setDashboardError('');
      try {
        const response = await api.get('/admin/dashboard');
        if (active) setStats(response.data?.stats || response.data);
      } catch (error) {
        if (active) setDashboardError(error.response?.data?.message || 'Could not load dashboard data.');
      } finally {
        if (active) setDashboardLoading(false);
      }
    };
    loadStats();
    return () => { active = false; };
  }, [activeTab, dashboardRetry]);

  useEffect(() => {
    if (activeTab !== 'products') return undefined;
    loadProducts();
    return undefined;
  }, [activeTab, productsRetry, loadProducts]);

  useEffect(() => {
    if (activeTab !== 'orders') return undefined;
    let active = true;
    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const response = await api.get('/orders');
        const result = response.data?.orders;
        if (!Array.isArray(result)) throw new Error('Unexpected order response from the server.');
        if (active) setOrders(result);
      } catch (error) {
        if (active) setOrdersError(error.response?.data?.message || 'Could not load orders.');
      } finally {
        if (active) setOrdersLoading(false);
      }
    };
    loadOrders();
    return () => { active = false; };
  }, [activeTab, ordersRetry]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', category: '', stock: '' });
    setProductImage(null);
    setProductMessage('');
    setProductsError('');
    setProductFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      category: product.category || '',
      stock: String(product.stock ?? 0),
    });
    setProductImage(null);
    setProductMessage('');
    setProductsError('');
    setProductFormOpen(true);
  };

  const closeProductForm = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
    setProductImage(null);
  };

  const handleProductSave = async (event) => {
    event.preventDefault();
    setProductSaving(true);
    setProductsError('');
    setProductMessage('');

    const payload = new FormData();
    Object.entries(productForm).forEach(([key, value]) => payload.append(key, value.trim()));
    if (productImage) payload.append('image', productImage);

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setProductMessage(editingProduct ? 'Product updated.' : 'Product created.');
      closeProductForm();
      await loadProducts();
    } catch (error) {
      setProductsError(error.response?.data?.message || 'Could not save the product.');
    } finally {
      setProductSaving(false);
    }
  };

  const handleProductDelete = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    setProductsError('');
    setProductMessage('');
    try {
      await api.delete(`/products/${product._id}`);
      setProductMessage('Product deleted.');
      setProducts((current) => current.filter((item) => item._id !== product._id));
    } catch (error) {
      setProductsError(error.response?.data?.message || 'Could not delete the product.');
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    setOrdersError('');
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      const updatedOrder = response.data?.order;
      setOrders((current) => current.map((order) => order._id === orderId ? (updatedOrder || { ...order, status }) : order));
    } catch (error) {
      setOrdersError(error.response?.data?.message || 'Could not update this order.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const statCards = [
    { label: 'Total orders', value: stats?.totalOrders ?? '—', icon: '▤', tone: 'orange' },
    { label: 'Customers', value: stats?.totalCustomers ?? '—', icon: '♙', tone: 'blue' },
    { label: 'Pending orders', value: stats?.pendingOrders ?? '—', icon: '◷', tone: 'gold' },
    { label: 'Revenue', value: stats ? formatPrice(stats.totalRevenue) : '—', icon: '₹', tone: 'green' },
  ];

  return (
    <main className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link to="/" className="admin-sidebar-brand"><span>E</span><strong>EzyMart</strong></Link>
          <p className="admin-sidebar-label">MANAGEMENT</p>
          <nav aria-label="Admin sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span aria-hidden="true">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
          <Link to="/" className="admin-store-link">← Back to store</Link>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <p>EZYMART ADMIN</p>
              <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
            </div>
            <Link to="/" className="admin-view-store">View store <span aria-hidden="true">↗</span></Link>
          </header>

          {activeTab === 'overview' && (
            <section className="admin-section" aria-label="Dashboard overview">
              {dashboardLoading && <p className="admin-feedback" role="status">Loading dashboard…</p>}
              {dashboardError && (
                <div className="admin-feedback admin-error" role="alert">
                  <span>{dashboardError}</span>
                  <button type="button" onClick={() => setDashboardRetry((count) => count + 1)}>Retry</button>
                </div>
              )}
              {!dashboardLoading && !dashboardError && (
                <>
                  <div className="admin-stat-grid">
                    {statCards.map((card) => (
                      <article className="admin-stat-card" key={card.label}>
                        <span className={`admin-stat-icon ${card.tone}`} aria-hidden="true">{card.icon}</span>
                        <div><p>{card.label}</p><strong>{card.value}</strong></div>
                      </article>
                    ))}
                  </div>
                  <div className="admin-overview-grid">
                    <section className="admin-panel">
                      <div className="admin-panel-heading"><div><h2>Order status</h2><p>Current order volume</p></div></div>
                      <div className="admin-status-list">
                        <div><span className="admin-status-dot pending" />Pending <strong>{stats?.pendingOrders ?? 0}</strong></div>
                        <div><span className="admin-status-dot shipped" />Shipped <strong>{stats?.shippedOrders ?? 0}</strong></div>
                        <div><span className="admin-status-dot delivered" />Delivered <strong>{stats?.deliveredOrders ?? 0}</strong></div>
                      </div>
                      <button type="button" className="admin-inline-link" onClick={() => setActiveTab('orders')}>Manage orders →</button>
                    </section>
                    <section className="admin-panel admin-quick-panel">
                      <div className="admin-panel-heading"><div><h2>Store management</h2><p>Keep your catalog up to date</p></div></div>
                      <button type="button" className="admin-quick-action" onClick={() => { setActiveTab('products'); openCreateForm(); }}>
                        <span aria-hidden="true">＋</span><span><strong>Add a product</strong><small>Create a new catalog listing</small></span><span aria-hidden="true">→</span>
                      </button>
                      <button type="button" className="admin-quick-action" onClick={() => setActiveTab('products')}>
                        <span aria-hidden="true">◇</span><span><strong>Manage products</strong><small>Edit pricing, stock, and details</small></span><span aria-hidden="true">→</span>
                      </button>
                    </section>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === 'products' && (
            <section className="admin-section" aria-label="Product management">
              <div className="admin-toolbar">
                <div><h2>Product catalog</h2><p>{products.length} {products.length === 1 ? 'product' : 'products'}</p></div>
                <button type="button" className="admin-primary-button" onClick={openCreateForm}>＋ Add product</button>
              </div>

              {productsError && <div className="admin-feedback admin-error" role="alert">{productsError}</div>}
              {productMessage && <p className="admin-feedback admin-success" role="status">{productMessage}</p>}

              {productFormOpen && (
                <form className="admin-product-form" onSubmit={handleProductSave}>
                  <div className="admin-form-heading">
                    <div><h3>{editingProduct ? 'Edit product' : 'Add a product'}</h3><p>Product details shown in the store</p></div>
                    <button type="button" className="admin-close-button" onClick={closeProductForm} aria-label="Close product form">×</button>
                  </div>
                  <div className="admin-form-grid">
                    <label><span>Product name</span><input name="name" value={productForm.name} maxLength={120} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required /></label>
                    <label><span>Category</span><input name="category" value={productForm.category} maxLength={80} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} required /></label>
                    <label><span>Price (₹)</span><input name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
                    <label><span>Stock quantity</span><input name="stock" type="number" min="0" step="1" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required /></label>
                    <label className="admin-form-wide"><span>Description</span><textarea name="description" rows="4" maxLength={3000} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required /></label>
                    <label className="admin-form-wide"><span>Product image {editingProduct?.image ? '(optional to replace)' : '(optional)'}</span><input name="image" type="file" accept="image/*" onChange={(event) => setProductImage(event.target.files?.[0] || null)} /></label>
                  </div>
                  {productImage && <p className="admin-file-name">Selected: {productImage.name}</p>}
                  <div className="admin-form-actions">
                    <button type="button" className="admin-secondary-button" onClick={closeProductForm}>Cancel</button>
                    <button type="submit" className="admin-primary-button" disabled={productSaving}>{productSaving ? 'Saving…' : editingProduct ? 'Save changes' : 'Create product'}</button>
                  </div>
                </form>
              )}

              {productsLoading && <p className="admin-feedback" role="status">Loading products…</p>}
              {!productsLoading && !productsError && products.length === 0 && (
                <div className="admin-empty"><span aria-hidden="true">◇</span><h3>No products yet</h3><p>Add a product to start filling the store catalog.</p><button type="button" className="admin-primary-button" onClick={openCreateForm}>Add product</button></div>
              )}
              {!productsLoading && products.length > 0 && (
                <div className="admin-products-table-wrap">
                  <table className="admin-products-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td><div className="admin-product-cell"><div className="admin-product-thumb">{product.image ? <img src={product.image} alt="" /> : <span aria-hidden="true">🛍️</span>}</div><div><strong>{product.name}</strong><small title={product.description}>{product.description}</small></div></div></td>
                          <td>{product.category}</td>
                          <td>{formatPrice(product.price)}</td>
                          <td><span className={`admin-stock ${Number(product.stock) > 0 ? 'in-stock' : 'out-stock'}`}>{product.stock ?? 0}</span></td>
                          <td><div className="admin-row-actions"><button type="button" onClick={() => openEditForm(product)}>Edit</button><button type="button" className="delete" onClick={() => handleProductDelete(product)}>Delete</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="admin-section" aria-label="Order management">
              <div className="admin-toolbar">
                <div><h2>All orders</h2><p>Review purchases and update fulfillment status</p></div>
                <button type="button" className="admin-secondary-button" onClick={() => setOrdersRetry((count) => count + 1)}>Refresh</button>
              </div>
              {ordersError && <div className="admin-feedback admin-error" role="alert">{ordersError}</div>}
              {ordersLoading && <p className="admin-feedback" role="status">Loading orders…</p>}
              {!ordersLoading && !ordersError && orders.length === 0 && <div className="admin-empty"><span aria-hidden="true">▤</span><h3>No orders yet</h3><p>Orders placed by customers will appear here.</p></div>}
              {!ordersLoading && orders.length > 0 && (
                <div className="admin-orders-list">
                  {orders.map((order) => (
                    <article className="admin-order-card" key={order._id}>
                      <div className="admin-order-primary">
                        <div><span className="admin-table-label">ORDER</span><strong title={order._id}>{order._id}</strong></div>
                        <div><span className="admin-table-label">CUSTOMER</span><strong>{order.user?.name || 'Customer'}</strong><small>{order.user?.email || ''}</small></div>
                        <div><span className="admin-table-label">PLACED</span><strong>{formatDate(order.createdAt)}</strong></div>
                        <div><span className="admin-table-label">TOTAL</span><strong>{formatPrice(order.totalAmount)}</strong></div>
                      </div>
                      <div className="admin-order-secondary">
                        <div className="admin-order-items">
                          {(order.items || []).map((item, index) => (
                            <span key={`${item.productId?._id || item.productId}-${index}`}>
                              {item.productId?.name || 'Product'} × {item.quantity}
                            </span>
                          ))}
                        </div>
                        <label className="admin-status-control">
                          <span>Status</span>
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order._id}
                            onChange={(event) => handleOrderStatus(order._id, event.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
