import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/products');
        const result = Array.isArray(response.data)
          ? response.data
          : response.data?.products;

        if (!Array.isArray(result)) {
          throw new Error('The product service returned an unexpected response.');
        }
        if (active) setProducts(result);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Unable to load products. Please try again.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => { active = false; };
  }, [retryCount]);

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const category = searchParams.get('category') || '';
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const sort = searchParams.get('sort') || 'featured';

    const filtered = products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const searchableText = `${product.name || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
      return matchesCategory && (!search || searchableText.includes(search));
    });

    if (sort === 'price-low') filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-high') filtered.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [products, searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <main className="products-page">
      <section className="products-hero">
        <div className="products-container">
          <p className="products-eyebrow">THE EZYMART COLLECTION</p>
          <h1>Find your next favorite.</h1>
          <p>Browse the latest products and discover something useful for every day.</p>
        </div>
      </section>

      <section className="products-container products-content" aria-label="Product catalog">
        <div className="products-toolbar">
          <form className="products-search" onSubmit={handleSearch}>
            <label className="visually-hidden" htmlFor="product-search">Search products</label>
            <input
              id="product-search"
              type="search"
              placeholder="Search products..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <div className="products-filter-controls">
            <label>
              <span className="visually-hidden">Filter by category</span>
              <select
                value={searchParams.get('category') || ''}
                onChange={(event) => updateFilter('category', event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option value={category} key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="visually-hidden">Sort products</span>
              <select
                value={searchParams.get('sort') || 'featured'}
                onChange={(event) => updateFilter('sort', event.target.value === 'featured' ? '' : event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="products-results-heading">
          <div>
            <h2>{searchParams.get('category') || 'All products'}</h2>
            {!loading && !error && (
              <p>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</p>
            )}
          </div>
          {(searchParams.has('category') || searchParams.has('search') || searchParams.has('sort')) && (
            <button type="button" className="products-clear" onClick={clearFilters}>Clear filters</button>
          )}
        </div>

        {loading && <p className="products-message" role="status">Loading products…</p>}
        {error && (
          <div className="products-message products-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
          </div>
        )}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="products-empty">
            <span aria-hidden="true">🔎</span>
            <h2>No products found</h2>
            <p>Try another search or clear the filters to see the full collection.</p>
            <button type="button" onClick={clearFilters}>Show all products</button>
          </div>
        )}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
        )}
        <div className="products-back-home"><Link to="/">← Back to home</Link></div>
      </section>
    </main>
  );
};

export default Products;
