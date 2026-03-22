import React from 'react';
import './InfoPages.css';

const termsSections = [
  {
    title: 'Orders and Availability',
    body:
      'Orders are subject to menu availability, restaurant operating hours, and the accuracy of the information submitted during checkout.',
  },
  {
    title: 'Account Responsibility',
    body:
      'Users are responsible for keeping their account credentials secure and for ensuring that their profile and delivery details remain accurate.',
  },
  {
    title: 'Pricing and Fulfillment',
    body:
      'Prices, offers, and delivery fees may change over time. The final order summary shown during checkout is the amount used for fulfillment.',
  },
  {
    title: 'Platform Use',
    body:
      'Users should not misuse the ordering flow, administrative access, or any part of the application in a way that disrupts service or compromises data.',
  },
];

const Terms = () => {
  return (
    <div className="container section animate-fade-in info-page">
      <section className="info-hero glass">
        <p className="info-kicker">Terms</p>
        <h1>Terms of Service</h1>
        <p style={{ marginTop: '1rem' }}>
          By using RestoBite, you agree to use the ordering platform responsibly and provide accurate details for
          account access, checkout, and delivery.
        </p>
      </section>

      <section className="info-grid-layout">
        {termsSections.map((section) => (
          <article key={section.title} className="info-card glass-panel">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Terms;
