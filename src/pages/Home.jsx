import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFoods } from '../context/FoodsContext';
import { initialOffers } from '../data/dummyData';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [displayTitle, setDisplayTitle] = React.useState('');
  const [displaySubtitle, setDisplaySubtitle] = React.useState('');
  const [animationFinished, setAnimationFinished] = React.useState(false);
  
  const fullTitle = "Experience Premium Dining at Home";
  const fullSubtitle = "Discover a world of exquisite tastes. Fresh ingredients, masterful preparation, and fast delivery straight to your door.";
  
  React.useEffect(() => {
    let titleIndex = 0;
    let subtitleIndex = 0;
    
    // Type Title First
    const titleTimer = setInterval(() => {
      setDisplayTitle(fullTitle.slice(0, titleIndex));
      titleIndex++;
      
      if (titleIndex > fullTitle.length) {
        clearInterval(titleTimer);
        
        // Start Subtitle after Title finishes
        const subtitleTimer = setInterval(() => {
          setDisplaySubtitle(fullSubtitle.slice(0, subtitleIndex));
          subtitleIndex++;
          if (subtitleIndex > fullSubtitle.length) {
            clearInterval(subtitleTimer);
            setAnimationFinished(true); // Trigger glass animation
          }
        }, 25);
      }
    }, 50);

    return () => {
      clearInterval(titleTimer);
    };
  }, []);

  const { openWithOffer } = useCart();
  const { foods } = useFoods();

  const databaseOffers = foods
    .filter((food) => food.is_featured_offer)
    .map((food) => ({
      id: `food-offer-${food.id}`,
      title: food.offer_title || `${food.name} Deal`,
      description: food.offer_description || food.description,
      discountPercent: food.discount_percent || 0,
      category: food.category,
    }));

  const offersToDisplay = databaseOffers.length > 0 ? databaseOffers : initialOffers;

  const handleOfferClick = (e, offer) => {
    e.preventDefault();
    if (offer.category) {
      openWithOffer(offer.category);
    } else if (offer.title.toLowerCase().includes('weekend')) {
      openWithOffer('Pizza');
    } else if (offer.title.toLowerCase().includes('dessert')) {
      openWithOffer('Dessert');
    } else {
      openWithOffer(null);
    }
  };

  const renderTitle = () => {
    const part1 = displayTitle.slice(0, 19); // "Experience Premium "
    const part2 = displayTitle.slice(19, 25); // "Dining"
    const part3 = displayTitle.slice(25); // " at Home"
    
    return (
      <>
        {part1}
        {part1.length === 19 && <br/>}
        {part2 && <span className="brand-accent">{part2}</span>}
        {part3}
        {displayTitle.length < fullTitle.length && <span className="typing-cursor">|</span>}
      </>
    );
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className={`hero-content animate-fade-in ${animationFinished ? 'is-ready' : ''}`}>
            <span className="badge badge-primary">Savor the Flavor</span>
            <h1 className="hero-title min-h-[140px]">
              {renderTitle()}
            </h1>
            <p className="hero-subtitle min-h-16">
              {displaySubtitle}
              {displayTitle.length === fullTitle.length && displaySubtitle.length < fullSubtitle.length && (
                <span className="typing-cursor">|</span>
              )}
            </p>
            <div className={`hero-actions ${animationFinished ? 'reveal-glass' : ''}`}>
              <Link to="/shop" className="btn btn-primary btn-shine">
                Explore Menu <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000" 
              alt="Premium Food" 
              className="hero-image"
            />
            <div className="floating-card glass">
              <Star className="text-accent" fill="currentColor" />
              <div>
                <p className="font-bold">4.9/5 Rating</p>
                <p className="text-sm">Based on 2k+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section body-padding section">
        <div className="container features-container">
          <div className="feature-card glass">
            <Clock size={40} className="feature-icon" />
            <h3>Fast Delivery</h3>
            <p>Hot and fresh food delivered within 30 minutes or it's on us.</p>
          </div>
          <div className="feature-card glass">
            <UtensilsIcon size={40} className="feature-icon" />
            <h3>Fresh Ingredients</h3>
            <p>We source the finest ingredients from local farms daily.</p>
          </div>
          <div className="feature-card glass">
            <Truck size={40} className="feature-icon" />
            <h3>Free Shipping</h3>
            <p>Enjoy free shipping on all orders over $50.</p>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers-section section body-padding" style={{ background: 'var(--surface-soft)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Special Offers</h2>
            <p>Don't miss out on these exclusive deals!</p>
          </div>
          
          <div className="offers-grid">
            {offersToDisplay.map(offer => (
              <div 
                key={offer.id} 
                className="offer-card glass-panel clickable-card"
                onClick={(e) => handleOfferClick(e, offer)}
              >
                <div className="offer-content">
                  <div className="offer-card-top">
                    <span className="offer-badge">{offer.discountPercent ? `${offer.discountPercent}% OFF` : 'DEAL'}</span>
                    <span className="shop-now-text">View Special <ArrowRight size={14} /></span>
                  </div>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Mock icon since we didn't import Utensils directly above
const UtensilsIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

export default Home;
