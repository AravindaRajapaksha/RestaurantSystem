import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const { user, loading, signInCustomer, signUpCustomer, signInWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/';

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const result = await signUpCustomer({ email, password, fullName });

        if (result.session) {
          addToast('Account created successfully.', 'success', 'OK');
          navigate(redirectTo, { replace: true });
        } else {
          addToast('Account created. Check your email to confirm the account.', 'info', 'MAIL');
          setMode('signin');
        }
      } else {
        await signInCustomer(email, password);
        addToast('Signed in successfully.', 'success', 'OK');
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      addToast(error.message || 'Authentication failed.', 'error', 'ERR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      addToast(error.message || 'Google sign in failed.', 'error', 'ERR');
    }
  };

  return (
    <div className="login-page container section animate-fade-in">
      <div className="login-card glass">
        <div className="login-mode-switch">
          <button
            type="button"
            className={`mode-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Create Account
          </button>
        </div>

        <h2 className="login-title">{mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {mode === 'signup'
            ? 'Sign up to order, save your cart, and track your meals.'
            : 'Sign in to continue to RestoBite.'}
        </p>

        <p className="text-center text-secondary" style={{ marginBottom: '1rem', fontSize: '0.92rem' }}>
          Customer accounts are self-service. Admin access is granted manually by the system.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-base"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-base"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input-base"
              placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 login-submit" disabled={submitting || loading}>
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>

          <button type="button" className="btn btn-outline w-100 mt-3" onClick={handleGoogleLogin} disabled={submitting || loading}>
            Continue with Google
          </button>

          <p className="text-center mt-3">
            <Link to="/forgot-password" className="text-brand">Forgot password?</Link>
          </p>

          <p className="text-center mt-2">
            <Link to="/admin-login" className="text-brand">Admin Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
