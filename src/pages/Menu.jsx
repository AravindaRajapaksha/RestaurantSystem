import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFoods } from '../context/FoodsContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Clock, Search, ChevronDown } from 'lucide-react';
import './Menu.css';

const Menu = () => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { foods, loading, error } = useFoods();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryEmojis = {
    Burger: 'Burger',
    Pizza: 'Pizza',
    Salad: 'Salad',
    Appetizer: 'App',
    Dessert: 'Dessert',
    Sides: 'Sides',
    Kottu: 'Kottu',
    Rice: 'Rice',
    Drinks: 'Drink',
  };

  const categories = useMemo(() => {
    return ['All', ...new Set(foods.map((f) => f.category))];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foods, searchTerm, activeCategory]);

  const foodsByCategory = useMemo(() => {
    const grouped = filteredFoods.reduce((acc, food) => {
      if (!acc[food.category]) acc[food.category] = [];
      acc[food.category].push(food);
      return acc;
    }, {});

    const order = ['Burger', 'Pizza', 'Kottu', 'Rice', 'Appetizer', 'Salad', 'Sides', 'Dessert', 'Drinks'];
    const sorted = {};
    order.forEach((cat) => {
      if (grouped[cat]) sorted[cat] = grouped[cat];
    });
    Object.keys(grouped).forEach((cat) => {
      if (!sorted[cat]) sorted[cat] = grouped[cat];
    });
    return sorted;
  }, [filteredFoods]);

  const handleOrder = (food) => {
    if (!user) {
      addToast('Please login to add items to cart.', 'error', 'LOCK');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    addToCart(food);
    addToast(`${food.name} added to cart!`, 'success', 'CART');
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const element = document.getElementById(`category-${cat}`);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <div className="menu-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1600"
          alt="Restaurant Menu Hero"
          className="menu-hero-img"
        />
        <div className="menu-hero-content container">
          <p className="menu-label">Welcome to</p>
          <h1 className="menu-title">RestoBite</h1>
          <p className="menu-subtitle">RESTAURANT MENU</p>
          <div className="menu-open-time">
            <Clock size={16} />
            <span>Open: Mon-Fri 10am-10pm | Sat-Sun 9am-11pm</span>
          </div>
        </div>
      </div>

      <div className="menu-controls-wrapper sticky glass">
        <div className="container menu-controls">
          <div className="menu-search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="menu-categories-nav">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-nav-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat)}
              >
                {cat === 'All' ? 'All' : categoryEmojis[cat] || 'Food'}
                <span className="cat-name">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-body container">
        {loading && (
          <div className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <p className="text-secondary">Loading menu from database...</p>
          </div>
        )}

        {error && (
          <div className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--danger)' }}>Database error: {error}</p>
          </div>
        )}

        {Object.keys(foodsByCategory).length === 0 ? (
          <div className="no-items-found section animate-fade-in">
            <div className="empty-icon">No Items</div>
            <h3>No dishes found matching your search.</h3>
            <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(foodsByCategory).map(([category, items]) => (
            <div className="menu-category-section animate-slide-up" key={category} id={`category-${category}`}>
              <div className="menu-category-header">
                <span className="menu-cat-emoji">{categoryEmojis[category] || 'Food'}</span>
                <h2 className="menu-cat-title">{category}</h2>
                <div className="menu-cat-line" />
              </div>

              <div className="menu-items-list">
                {items.map((food) => (
                  <div className="menu-item glass-hover" key={food.id}>
                    <div className="menu-item-img-wrapper">
                      <img src={food.image} alt={food.name} className="menu-item-img" />
                      {food.price > 12 && <div className="popular-badge">Chef's Choice</div>}
                    </div>
                    <div className="menu-item-info">
                      <div className="menu-item-top">
                        <h3 className="menu-item-name">{food.name}</h3>
                        <div className="menu-item-dots" />
                        <span className="menu-item-price">${food.price.toFixed(2)}</span>
                      </div>
                      <p className="menu-item-desc">{food.description}</p>
                    </div>
                    <button
                      className="menu-order-btn"
                      onClick={() => handleOrder(food)}
                      aria-label={`Add ${food.name} to cart`}
                    >
                      <ShoppingCart size={16} />
                      <span>Order</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <ChevronDown size={24} style={{ transform: 'rotate(180deg)' }} />
      </button>
    </div>
  );
};

export default Menu;
