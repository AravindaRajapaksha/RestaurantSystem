import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read this image file.'));
    reader.readAsDataURL(file);
  });

const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return 'RB';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
};

const formatOrderDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const Profile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    user,
    profile,
    loading,
    isAdmin,
    updateProfile,
    sendPasswordResetEmail,
    logout,
  } = useAuth();
  const {
    myOrders,
    adminOrders,
    myOrdersLoading,
    adminOrdersLoading,
    myOrdersError,
    adminOrdersError,
  } = useOrders();
  const avatarInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('account');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || user?.name || '');
  }, [profile?.full_name, user?.name]);

  useEffect(() => {
    setPhone(profile?.phone || user?.phone || '');
  }, [profile?.phone, user?.phone]);

  useEffect(() => {
    setAvatarUrl(profile?.avatar_url || user?.avatarUrl || '');
  }, [profile?.avatar_url, user?.avatarUrl]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const visibleOrders = isAdmin ? adminOrders : myOrders;
  const ordersLoading = isAdmin ? adminOrdersLoading : myOrdersLoading;
  const ordersError = isAdmin ? adminOrdersError : myOrdersError;
  const fallbackPhone = !isAdmin ? myOrders[0]?.customer_phone || '' : '';
  const displayPhone = profile?.phone || fallbackPhone || 'No phone number saved yet';
  const displayAvatar = profile?.avatar_url || user?.avatarUrl || '';
  const userInitials = getInitials(user.name);
  const joinedDate = profile?.created_at
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(profile.created_at))
    : 'Recently';

  const profileStats = [
    { label: isAdmin ? 'Managed Orders' : 'Orders Placed', value: String(visibleOrders.length) },
    { label: 'Account Role', value: isAdmin ? 'Administrator' : 'Customer' },
    { label: 'Member Since', value: joinedDate },
  ];

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      await updateProfile({ fullName, avatarUrl, phone });
      setIsEditingProfile(false);
      addToast('Profile updated successfully.', 'success', 'OK');
    } catch (error) {
      addToast(error.message || 'Unable to save your profile right now.', 'error', 'ERR');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = async (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast('Please choose an image file for the profile picture.', 'error', 'ERR');
      return;
    }

    try {
      const nextAvatar = await fileToDataUrl(file);
      setAvatarUrl(nextAvatar);
    } catch (error) {
      addToast(error.message || 'Unable to load this profile picture.', 'error', 'ERR');
    } finally {
      event.target.value = '';
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) {
      addToast('No email is available for this account.', 'error', 'ERR');
      return;
    }

    try {
      setSendingReset(true);
      await sendPasswordResetEmail(user.email);
      addToast(`Password reset email sent to ${user.email}.`, 'info', 'MAIL');
    } catch (error) {
      addToast(error.message || 'Unable to send reset email.', 'error', 'ERR');
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      addToast(error.message || 'Unable to log out.', 'error', 'ERR');
    } finally {
      setLoggingOut(false);
    }
  };

  const renderAccountSection = () => (
    <div className="glass profile-panel p-5 rounded-lg">
      <div className="profile-section-header">
        <div>
          <p className="profile-section-kicker">Account Details</p>
          <h2>{isEditingProfile ? 'Edit Your Profile' : 'Account Information'}</h2>
        </div>
        {!isEditingProfile && (
          <button type="button" className="btn btn-outline" onClick={() => setIsEditingProfile(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {isEditingProfile ? (
        <form className="profile-form" onSubmit={handleSaveProfile}>
          <div className="profile-avatar-editor glass-panel">
            <div className="profile-avatar-preview">
              {avatarUrl ? (
                <img src={avatarUrl} alt={`${user.name} profile`} className="profile-avatar-image" />
              ) : (
                <div className="avatar-circle avatar-circle-filled">
                  <span>{userInitials}</span>
                </div>
              )}
            </div>

            <div className="profile-avatar-fields">
              <div className="form-group">
                <label htmlFor="profile-avatar-url">Profile Picture URL</label>
                <input
                  id="profile-avatar-url"
                  type="url"
                  className="input-base"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Upload Picture
                </button>
                {avatarUrl && (
                  <button type="button" className="btn btn-outline" onClick={() => setAvatarUrl('')}>
                    Remove Picture
                  </button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={handleAvatarFileChange}
                />
              </div>

              <p className="profile-helper-text">
                Paste an image URL or upload a small photo to use as your profile picture.
              </p>
            </div>
          </div>

          <div className="info-grid">
            <div className="form-group">
              <label htmlFor="profile-full-name">Full Name</label>
              <input
                id="profile-full-name"
                type="text"
                className="input-base"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-base" value={user.email || ''} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                className="input-base"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="e.g. +1 234 567 8900"
              />
            </div>
          </div>

          <p className="profile-helper-text">
            Save your contact number here so checkout and profile details stay in sync.
          </p>

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setFullName(profile?.full_name || user.name || '');
                setPhone(profile?.phone || user?.phone || '');
                setAvatarUrl(profile?.avatar_url || user?.avatarUrl || '');
                setIsEditingProfile(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{user.name}</p>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <p>{user.email || 'No email available'}</p>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <p className={displayPhone === 'No phone number saved yet' ? 'info-value-muted' : ''}>
                {displayPhone}
              </p>
            </div>
            <div className="info-item">
              <label>Role</label>
              <p>{isAdmin ? 'Administrator' : 'Customer'}</p>
            </div>
          </div>

          <div className="profile-stat-grid">
            {profileStats.map((item) => (
              <div key={item.label} className="profile-stat-card glass-panel">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderOrdersSection = () => (
    <div className="glass profile-panel p-5 rounded-lg">
      <div className="profile-section-header">
        <div>
          <p className="profile-section-kicker">{isAdmin ? 'Platform Activity' : 'Your Orders'}</p>
          <h2>{isAdmin ? 'Recent Restaurant Orders' : 'Order History'}</h2>
        </div>
      </div>

      {ordersLoading && <p className="text-secondary">Loading order history...</p>}
      {ordersError && <p style={{ color: 'var(--danger)' }}>{ordersError}</p>}

      {!ordersLoading && !ordersError && visibleOrders.length === 0 && (
        <p className="text-secondary">
          {isAdmin
            ? 'No customer orders have been recorded yet.'
            : 'You have not placed any orders yet.'}
        </p>
      )}

      {!ordersLoading && !ordersError && visibleOrders.length > 0 && (
        <div className="orders-list">
          {visibleOrders.map((order) => (
            <div key={order.id} className="order-card p-4 mb-3 border-glass rounded-md">
              <div className="order-card-main">
                <div>
                  <h4 className="mb-1">{order.order_number}</h4>
                  <p className="text-sm text-secondary">{formatOrderDate(order.created_at)}</p>
                  <p className="text-sm text-secondary">
                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    {isAdmin ? ` - ${order.customer_name}` : ''}
                  </p>
                </div>
                <div className="order-side text-right">
                  <p className="text-brand font-bold mb-1">${order.total.toFixed(2)}</p>
                  <span
                    className="badge"
                    style={{
                      background:
                        order.status === 'delivered'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(249, 115, 22, 0.2)',
                      color:
                        order.status === 'delivered'
                          ? 'var(--success)'
                          : 'var(--brand-primary)',
                    }}
                  >
                    {order.status.replaceAll('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="order-meta-row">
                <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</span>
                <span>{order.customer_email || 'No email available'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsSection = () => (
    <div className="glass profile-panel p-5 rounded-lg">
      <div className="profile-section-header">
        <div>
          <p className="profile-section-kicker">Preferences</p>
          <h2>Settings</h2>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card glass-panel">
          <h3>Password and Security</h3>
          <p>Send yourself a password reset link using your current account email.</p>
          <button type="button" className="btn btn-outline" onClick={handleResetPassword} disabled={sendingReset}>
            {sendingReset ? 'Sending Reset Link...' : 'Send Reset Email'}
          </button>
        </div>

        <div className="settings-card glass-panel">
          <h3>Session</h3>
          <p>End your current session on this device and return to the sign-in page.</p>
          <button type="button" className="btn btn-outline" onClick={handleLogout} disabled={loggingOut}>
            <LogOut size={16} />
            {loggingOut ? 'Logging Out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminSection = () => (
    <div className="glass profile-panel p-5 rounded-lg">
      <div className="profile-section-header">
        <div>
          <p className="profile-section-kicker">Admin Tools</p>
          <h2>Admin Access</h2>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card glass-panel">
          <h3>Dashboard</h3>
          <p>Open the live revenue, order, and activity dashboard for the restaurant.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/admin')}>
            <LayoutDashboard size={16} />
            Open Dashboard
          </button>
        </div>

        <div className="settings-card glass-panel">
          <h3>Manage Menu</h3>
          <p>Create dishes, edit prices, and control featured deals shown across the app.</p>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/manage')}>
            Manage Items
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-page container section animate-fade-in">
      <div className="profile-layout">
        <div className="profile-sidebar glass">
          <div className="profile-avatar text-center pt-4">
            {displayAvatar ? (
              <img src={displayAvatar} alt={`${user.name} profile`} className="profile-avatar-image" />
            ) : (
              <div className="avatar-circle avatar-circle-filled">
                <span>{userInitials}</span>
              </div>
            )}
            <h3 className="mt-3">{user.name}</h3>
            <p className="text-secondary">{isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>

          <div className="profile-nav mt-5">
            <button
              type="button"
              className={`profile-nav-btn ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('account');
                setIsEditingProfile(false);
              }}
            >
              <User size={18} /> Account Details
            </button>
            <button
              type="button"
              className={`profile-nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('orders');
                setIsEditingProfile(false);
              }}
            >
              <Package size={18} /> Order History
            </button>
            <button
              type="button"
              className={`profile-nav-btn ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('settings');
                setIsEditingProfile(false);
              }}
            >
              <Settings size={18} /> Settings
            </button>
            {isAdmin && (
              <button
                type="button"
                className={`profile-nav-btn profile-admin-btn ${activeSection === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('admin');
                  setIsEditingProfile(false);
                }}
              >
                <ShieldAlert size={18} /> Admin Access
              </button>
            )}
          </div>
        </div>

        <div className="profile-content">
          {activeSection === 'account' && renderAccountSection()}
          {activeSection === 'orders' && renderOrdersSection()}
          {activeSection === 'settings' && renderSettingsSection()}
          {activeSection === 'admin' && isAdmin && renderAdminSection()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
