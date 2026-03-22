import React from 'react';
import { Utensils, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer body-padding">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="brand" style={{ marginBottom: '1rem' }}>
            <Utensils className="brand-icon" style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Resto<span style={{ color: 'var(--brand-primary)' }}>Bite</span></span>
          </div>
          <p className="footer-desc">Premium dining experience delivered straight to your door with the highest quality ingredients.</p>
          <div className="social-links">
            <a href="#" className="social-link"><Facebook size={20} /></a>
            <a href="#" className="social-link"><Twitter size={20} /></a>
            <a href="#" className="social-link"><Instagram size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Our Menu</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-links-group">
          <h4>Support</h4>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>

        <div className="footer-links-group">
          <h4>Opening Hours</h4>
          <p>Mon to fri : 10:00 AM - 10:00 PM</p>
          <p>Sat to sun: 09:00 AM - 11:00 PM</p>
          <p>Public holidays: Closed</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RestoBite. All rights reserved.</p>
      </div>
    </footer>
  );
};
export default Footer;
