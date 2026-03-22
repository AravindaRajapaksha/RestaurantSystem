import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!user) {
      addToast('Please login to add items to cart.', 'error', 'LOCK');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    addToCart(food);
    addToast(`${food.name} added to cart!`, 'success', 'CART');
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="food-card glass">
      <div className="food-img-wrapper">
        <img src={food.image} alt={food.name} className="food-img" loading="lazy" />
        <span className="food-category">{food.category}</span>
      </div>

      <div className="food-content">
        <div className="food-header">
          <h3 className="food-name">{food.name}</h3>
          <span className="food-price">${food.price.toFixed(2)}</span>
        </div>

        <p className="food-desc">{food.description}</p>

        <button
          className={`btn add-to-cart-btn ${added ? 'btn-added' : 'btn-primary'}`}
          onClick={handleAdd}
        >
          {added ? (
            <>
              <Check size={18} /> Added!
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
