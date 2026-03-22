import React from 'react';
import './InfoPages.css';

const faqItems = [
  {
    question: 'Do you offer free delivery?',
    answer: 'Yes. Delivery is free for orders above $50. Smaller orders currently use a flat delivery fee.',
  },
  {
    question: 'Can I track my order status?',
    answer: 'Yes, order progress now updates through restaurant-side status management such as pending, preparing, and delivered.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'Cash on delivery is the currently supported payment method in the app.',
  },
  {
    question: 'Can I update my profile details?',
    answer: 'Yes. You can update your name, phone number, and profile picture from the profile page.',
  },
];

const Faq = () => {
  return (
    <div className="container section animate-fade-in info-page">
      <section className="info-hero glass">
        <p className="info-kicker">FAQ</p>
        <h1>Common questions from customers and admins.</h1>
        <p style={{ marginTop: '1rem' }}>
          These answers cover the current product behavior in the app today.
        </p>
      </section>

      <section className="info-card glass-panel">
        <div className="info-faq-list">
          {faqItems.map((item) => (
            <article key={item.question} className="info-faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Faq;
