import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ezymart-cart';
const CartContext = createContext(null);

const readCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) =>
      item && item.productId && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0
    );
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Keep the cart usable for the current session if browser storage is unavailable.
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const stock = Number(product?.stock);
    const requestedQuantity = Number(quantity);

    if (!product?._id || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return { success: false, message: 'This product could not be added.' };
    }
    if (Number.isFinite(stock) && stock < 1) {
      return { success: false, message: 'This product is out of stock.' };
    }

    const productId = String(product._id);
    const maxQuantity = Number.isFinite(stock) ? stock : Number.MAX_SAFE_INTEGER;
    let result = { success: true, message: `${product.name} added to your cart.` };

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === productId);
      const nextQuantity = Math.min((existingItem?.quantity || 0) + requestedQuantity, maxQuantity);

      if (nextQuantity === (existingItem?.quantity || 0)) {
        result = { success: false, message: 'You already have all available stock in your cart.' };
        return currentItems;
      }

      const savedProduct = {
        productId,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image || '',
        category: product.category || '',
        stock: Number.isFinite(stock) ? stock : null,
      };

      return existingItem
        ? currentItems.map((item) => item.productId === productId
          ? { ...savedProduct, quantity: nextQuantity }
          : item)
        : [...currentItems, { ...savedProduct, quantity: nextQuantity }];
    });

    return result;
  };

  const setQuantity = (productId, quantity) => {
    const nextQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) return;

    setItems((currentItems) => currentItems.map((item) => {
      if (item.productId !== String(productId)) return item;
      const maxQuantity = Number.isFinite(item.stock) && item.stock > 0
        ? item.stock
        : Number.MAX_SAFE_INTEGER;
      return { ...item, quantity: Math.min(nextQuantity, maxQuantity) };
    }));
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== String(productId)));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = useMemo(() => ({
    items,
    itemCount,
    subtotal,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
  }), [items, itemCount, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider.');
  return context;
};
