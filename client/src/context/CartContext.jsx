import { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);

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

  const getTax = () => {
    return getSubtotal() * 0.08;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() - discount;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      customer,
      discount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setCustomer,
      setDiscount,
      getSubtotal,
      getTax,
      getTotal
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
