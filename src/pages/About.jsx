import React from 'react';
import './InfoPages.css';

const About = () => {
  return (
    <div className="container section animate-fade-in info-page">
      <section className="info-hero glass">
        <p className="info-kicker">About Us</p>
        <h1>Fresh food, fast delivery, and a cleaner restaurant experience.</h1>
        <p style={{ marginTop: '1rem' }}>
          RestoBite brings together menu discovery, easy ordering, and admin-side restaurant control in a single
          modern web app. The goal is simple: help customers order confidently while giving the restaurant team
          a live system to manage dishes, offers, and incoming orders.
        </p>
      </section>

      <section className="info-grid-layout">
        <div className="info-card glass-panel">
          <h3>What We Focus On</h3>
          <ul className="info-list">
            <li><strong>Quality first:</strong> menu items are presented with clear descriptions, pricing, and images.</li>
            <li><strong>Fast ordering:</strong> customers can move from browsing to checkout without unnecessary steps.</li>
            <li><strong>Operational visibility:</strong> admins can manage menu items and monitor live orders.</li>
          </ul>
        </div>

        <div className="info-card glass-panel">
          <h3>Why RestoBite</h3>
          <p>
            The project is designed as a restaurant-ready MVP with customer authentication, profile management,
            menu administration, checkout, order history, and dashboard analytics already integrated.
          </p>
          <p className="info-note">
            It is structured to keep improving over time, especially around payments, production QA, and launch polish.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
