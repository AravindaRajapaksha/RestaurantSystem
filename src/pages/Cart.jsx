import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Banknote, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useToast } from '../context/ToastContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { placeOrder } = useOrders();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const deliveryFee = cartTotal > 50 ? 0 : 5;
  const finalTotal = cartTotal > 0 ? cartTotal + deliveryFee : 0;

  const handleCheckoutSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);

      const order = await placeOrder({
        customerName: String(formData.get('fullName') || ''),
        deliveryAddress: String(formData.get('deliveryAddress') || ''),
        customerPhone: String(formData.get('phoneNumber') || ''),
        paymentMethod: String(formData.get('payment') || 'cod'),
        items: cart,
      });

      setSubmittedOrder(order);
      setCheckoutStep(3);
      clearCart();
      addToast(`Order ${order.order_number} placed successfully!`, 'success', 'OK');
    } catch (error) {
      addToast(error.message || 'Unable to place your order right now.', 'error', 'ERR');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutStep === 3) {
    return (
      <div
        className="cart-page container section animate-fade-in text-center"
        style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="success-icon mb-4" style={{ color: 'var(--success)', fontSize: '4rem' }}>
          OK
        </div>
        <h2>Order Placed Successfully!</h2>
        {submittedOrder?.order_number && (
          <p className="text-secondary mb-2">Reference: {submittedOrder.order_number}</p>
        )}
        <p className="text-secondary mb-4">Your order is being prepared and will be delivered soon.</p>
        <Link to="/profile" className="btn btn-primary">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container section animate-fade-in">
      <h1 className="mb-4">{checkoutStep === 1 ? 'Your Cart' : 'Checkout'}</h1>

      {cart.length === 0 ? (
        <div className="empty-cart glass flex-center-col">
          <ShoppingCartPlaceholder size={64} className="text-muted mb-4" />
          <h3>Your cart is empty</h3>
          <p className="text-secondary mb-4">Looks like you have not added anything to your cart yet.</p>
          <Link to="/shop" className="btn btn-primary">Start Browsing</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            {checkoutStep === 1 ? (
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item glass-panel">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p className="text-brand font-bold">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn" aria-label="Decrease">
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn" aria-label="Increase">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="btn btn-danger remove-btn" aria-label="Remove item">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="checkout-form glass">
                <h3>Delivery Details</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="input-base"
                    required
                    defaultValue={profile?.full_name || user?.name || ''}
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Delivery Address</label>
                  <textarea name="deliveryAddress" className="input-base" rows="3" required placeholder="Enter full address" />
                </div>
                <div className="form-group mt-3">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="input-base"
                    required
                    placeholder="e.g. +1 234 567 8900"
                    defaultValue={profile?.phone || user?.phone || ''}
                  />
                </div>

                <h3 className="mt-5">Payment Method</h3>
                <div className="payment-options mt-2">
                  <label className="payment-option active">
                    <input type="radio" name="payment" value="cod" defaultChecked />
                    <Banknote size={20} />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </form>
            )}
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary glass">
              <h3>Order Summary</h3>
              <div className="summary-row mt-4">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-success text-sm mt-1">You qualified for free delivery!</p>
              )}

              <div className="summary-total mt-4 pt-4 border-top">
                <span>Total</span>
                <span className="text-brand">${finalTotal.toFixed(2)}</span>
              </div>

              {checkoutStep === 1 ? (
                <button
                  className="btn btn-primary w-100 mt-5"
                  onClick={() => {
                    if (!user) {
                      addToast('Please login before checkout.', 'error', 'LOCK');
                      navigate('/login', { state: { from: '/cart' } });
                      return;
                    }

                    setCheckoutStep(2);
                  }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" form="checkout-form" className="btn btn-primary w-100 mt-5" disabled={isSubmitting}>
                  {isSubmitting ? 'Placing Order...' : 'Place Order (COD)'}
                </button>
              )}

              {checkoutStep === 2 && (
                <button
                  className="btn btn-outline w-100 mt-3"
                  onClick={() => setCheckoutStep(1)}
                >
                  Back to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShoppingCartPlaceholder = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export default Cart;
