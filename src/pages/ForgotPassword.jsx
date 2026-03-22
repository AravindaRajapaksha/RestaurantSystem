import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const ForgotPassword = () => {
  const { sendPasswordResetEmail } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      addToast(`Password reset link sent to ${email}.`, 'info', 'MAIL');
      setEmail('');
    } catch (error) {
      addToast(error.message || 'Unable to send reset email.', 'error', 'ERR');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page container section animate-fade-in">
      <div className="login-card glass">
        <h2 className="login-title">Forgot Password</h2>
        <p className="login-subtitle">Enter your email and we will send you a secure reset link.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-base"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 login-submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center mt-3">
            <Link to="/login" className="text-brand">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
