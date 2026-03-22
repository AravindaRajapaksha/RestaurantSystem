import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const AdminLogin = () => {
  const { user, isAdmin, loading, signInAdmin, signInAdminWithGoogle, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/admin';
  const isOAuthReturn = location.search.includes('code=') || location.hash.includes('access_token');

  useEffect(() => {
    if (!loading && user && !isAdmin && isOAuthReturn) {
      addToast('This Google account does not have admin access.', 'error', 'LOCK');
      logout().catch(() => {});
      navigate('/admin-login', { replace: true });
    }
  }, [addToast, isAdmin, isOAuthReturn, loading, logout, navigate, user]);

  if (!loading && user && isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await signInAdmin(email, password);
      addToast('Admin login successful.', 'success', 'OK');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      addToast(error.message || 'Admin sign in failed.', 'error', 'LOCK');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    try {
      await signInAdminWithGoogle();
    } catch (error) {
      addToast(error.message || 'Google admin sign in failed.', 'error', 'ERR');
    }
  };

  return (
    <div className="login-page container section animate-fade-in">
      <div className="login-card glass">
        <h2 className="login-title">Admin Sign In</h2>
        <p className="login-subtitle">Admin accounts are assigned manually. Only profiles with the admin role can continue.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              className="input-base"
              placeholder="Enter admin email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              className="input-base"
              placeholder="Enter admin password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 login-submit" disabled={submitting || loading}>
            {submitting ? 'Checking access...' : 'Sign In as Admin'}
          </button>

          <button
            type="button"
            className="btn btn-outline w-100 mt-3"
            onClick={handleGoogleAdminLogin}
            disabled={submitting || loading}
          >
            Continue with Google
          </button>

          <p className="text-center mt-3">
            <Link to="/login" className="text-brand">Back to Customer Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
