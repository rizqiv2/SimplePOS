import { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

const ls = (key, def) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return localStorage.getItem(key) || def; }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [orderType, setOrderType] = useState('Dine-in');

  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, { product, quantity, price: product.price }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomer(null);
    setDiscount(0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTaxRate = () => {
    const v = parseFloat(ls('pos_tax_rate'));
    return isNaN(v) ? 8 : v;
  };

  const getTaxInclusive = () => {
    return ls('pos_tax_inclusive') === true;
  };

  const getServiceChargeEnabled = () => {
    return ls('pos_service_charge_enabled') === true;
  };

  const getServiceChargeRate = () => {
    const v = parseFloat(ls('pos_service_charge_rate'));
    return isNaN(v) ? 5 : v;
  };

  const getRoundingMode = () => {
    const v = ls('pos_rounding_mode');
    return v || 'none';
  };

  const getServiceCharge = () => {
    if (!getServiceChargeEnabled()) return 0;
    return getSubtotal() * (getServiceChargeRate() / 100);
  };

  const getTax = () => {
    const rate = getTaxRate();
    const base = getSubtotal() + getServiceCharge();
    if (getTaxInclusive()) {
      return base * rate / (100 + rate);
    }
    return base * (rate / 100);
  };

  const getTotalBeforeRounding = () => {
    return getSubtotal() + getServiceCharge() + getTax() - discount;
  };

  const applyRounding = (value) => {
    const mode = getRoundingMode();
    switch (mode) {
      case 'nearest_005':
        return Math.round(value * 20) / 20;
      case 'nearest_010':
        return Math.round(value * 10) / 10;
      case 'nearest_int':
        return Math.round(value);
      default:
        return value;
    }
  };

  const getTotal = () => {
    return applyRounding(getTotalBeforeRounding());
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      customer,
      discount,
      orderType,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setCustomer,
      setDiscount,
      setOrderType,
      getSubtotal,
      getTax,
      getServiceCharge,
      getTotalBeforeRounding,
      getTotal,
      getTaxRate,
      getTaxInclusive,
      getServiceChargeEnabled,
      getServiceChargeRate,
      getRoundingMode
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
