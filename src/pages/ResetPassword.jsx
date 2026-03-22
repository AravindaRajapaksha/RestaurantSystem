import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const ResetPassword = () => {
  const { user, loading, updatePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error', 'ERR');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error', 'ERR');
      return;
    }

    setSubmitting(true);

    try {
      await updatePassword(password);
      addToast('Password updated successfully.', 'success', 'OK');
      navigate('/login', { replace: true });
    } catch (error) {
      addToast(error.message || 'Unable to update password.', 'error', 'ERR');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page container section animate-fade-in">
      <div className="login-card glass">
        <h2 className="login-title">Set New Password</h2>
        <p className="login-subtitle">Create a new password for your account.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="input-base"
              placeholder="Enter your new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="input-base"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 login-submit" disabled={submitting || loading}>
            {submitting ? 'Updating...' : 'Update Password'}
          </button>

          <p className="text-center mt-3">
            <Link to="/login" className="text-brand">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
