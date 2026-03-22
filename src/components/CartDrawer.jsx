import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFoods } from '../context/FoodsContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    offerCategory,
    setOfferCategory,
    addToCart
  } = useCart();

  const { foods } = useFoods();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const offerItems = offerCategory
    ? foods.filter((f) => f.category === offerCategory).slice(0, 3)
    : [];

  const requireLoginForCart = () => {
    addToast('Please login to add items to cart.', 'error', 'LOCK');
    toggleCart(false);
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleAddSpecial = (food) => {
    if (!user) {
      requireLoginForCart();
      return;
    }

    addToCart(food);
    addToast(`${food.name} added to cart!`, 'success', 'CART');
  };

  const handleBrowseFoods = () => {
    toggleCart(false);
    setOfferCategory(null);
    navigate('/shop');
  };

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={() => toggleCart(false)}>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={24} className="text-brand" />
            <h2>Your Order</h2>
          </div>
          <button className="close-btn" onClick={() => toggleCart(false)}>
            <X size={24} />
          </button>
        </div>

        {offerCategory && (
          <div className="drawer-special-offer animate-slide-up">
            <div className="offer-banner">
              <span>Weekend Special: {offerCategory}s</span>
              <button className="clear-offer-btn" onClick={() => setOfferCategory(null)}><X size={14} /></button>
            </div>
            <div className="special-items-grid">
              {offerItems.map((item) => (
                <div key={item.id} className="special-item-mini glass">
                  <img src={item.image} alt={item.name} />
                  <div className="special-info">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                    <button onClick={() => handleAddSpecial(item)} className="mini-add-btn">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">Empty</div>
              <p>Your cart is empty</p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleBrowseFoods}
              >
                Go find some food
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-row animate-slide-in">
                <img src={item.image} alt={item.name} className="item-img" />
                <div className="item-details">
                  <div className="item-main">
                    <h4>{item.name}</h4>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button className="delete-item" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span>Subtotal</span>
              <span className="total-price">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="footer-note">Free Delivery and GST Included</p>
            <Link to="/cart" className="btn btn-primary checkout-btn" onClick={() => toggleCart(false)}>
              Checkout Now <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
