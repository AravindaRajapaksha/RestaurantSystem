import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { useFoods } from '../context/FoodsContext';
import './Shop.css';

const Shop = () => {
  const { foods, loading, error } = useFoods();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(foods.map((food) => food.category))];
  const filteredFoods =
    activeCategory === 'All'
      ? foods
      : foods.filter((food) => food.category === activeCategory);

  return (
    <div className="shop-page container section animate-fade-in">
      <div className="shop-header">
        <div>
          <h1>Foods</h1>
          <p className="text-secondary">
            Browse and order from our wide selection of fresh, delicious dishes.
          </p>
        </div>
      </div>

      <div className="shop-controls glass-panel">
        <div className="category-filter">
          <Filter size={18} className="text-muted" />
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
          <p className="text-secondary">Loading foods from database...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
          <p style={{ color: 'var(--danger)' }}>Database error: {error}</p>
        </div>
      )}

      <div className="food-grid">
        {filteredFoods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
        {filteredFoods.length === 0 && (
          <div className="no-results">
            <p>No foods found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
