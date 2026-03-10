import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      // ✅ Actualizamos a la llave oficial de Fiebriticos
      const saved = localStorage.getItem('fiebriticos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error al cargar el carrito:", e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // ✅ Guardamos con la nueva identidad
    localStorage.setItem('fiebriticos_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size) => {
    setCart((prev) => {
      const productId = product._id || product.id;
      const existingIndex = prev.findIndex(
        (item) => (item._id || item.id) === productId && item.selectedSize === size
      );

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        toast.info(`¡Otra unidad de la joya agregada! ⚽`, { icon: "➕" });
        return newCart;
      } else {
        toast.success(`¡Fichaje completado! Al carrito 🛒`, { icon: "✅" });
        return [...prev, { ...product, selectedSize: size, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter((item) => !((item._id || item.id) === id && item.selectedSize === size)));
    toast.warn("Producto fuera de la convocatoria 🗑️");
  };
  
  const updateQuantity = (id, size, amount) => {
     setCart(prev => prev.map(item => {
        if ((item._id || item.id) === id && item.selectedSize === size) {
           return { ...item, quantity: Math.max(1, item.quantity + amount) };
        }
        return item;
     }));
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('fiebriticos_cart');
  };

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.discountPrice || item.price;
    return acc + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      toggleCart, 
      isCartOpen, 
      setIsCartOpen, 
      cartTotal, 
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};