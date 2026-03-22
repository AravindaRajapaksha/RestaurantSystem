import React from 'react';
import './InfoPages.css';

const Contact = () => {
  return (
    <div className="container section animate-fade-in info-page">
      <section className="info-hero glass">
        <p className="info-kicker">Contact</p>
        <h1>Need help with an order or restaurant account?</h1>
        <p style={{ marginTop: '1rem' }}>
          Reach out to the RestoBite team for support, order issues, or general questions about deliveries,
          menu items, and account access.
        </p>
      </section>

      <section className="info-grid-layout">
        <div className="info-card glass-panel">
          <h3>Support Channels</h3>
          <ul className="info-list">
            <li><strong>Email:</strong> support@restobite.com</li>
            <li><strong>Phone:</strong> +1 234 567 8900</li>
            <li><strong>Live Hours:</strong> Daily, 10:00 AM to 10:00 PM</li>
          </ul>
        </div>

        <div className="info-card glass-panel">
          <h3>Before You Contact Us</h3>
          <ul className="info-list">
            <li><strong>Order issue:</strong> keep your order number ready so support can help faster.</li>
            <li><strong>Account issue:</strong> use the password reset option first if you cannot sign in.</li>
            <li><strong>Menu question:</strong> mention the item name and the date of your order.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Contact;
