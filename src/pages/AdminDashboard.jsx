import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFoods } from '../context/FoodsContext';
import { useOrders } from '../context/OrdersContext';
import { Navigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, TrendingUp, Utensils } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ORDER_STATUSES } from '../lib/orders';
import './AdminDashboard.css';

const formatOrderDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const formatOrderStatus = (status) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const resolveBadgeClass = (status) => {
  if (status === 'delivered') return 'badge-success';
  if (status === 'preparing') return 'badge-info';
  if (status === 'out_for_delivery') return 'badge-warning';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-pending';
};

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { foods, loading, error } = useFoods();
  const { adminOrders, adminOrdersLoading, adminOrdersError, updateAdminOrderStatus } = useOrders();
  const { addToast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const fallbackImage = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=300';

  const aggregatedItems = adminOrders
    .flatMap((order) => order.order_items)
    .reduce((map, item) => {
      const key = item.food_id || item.item_name;
      const existing = map.get(key) || {
        name: item.item_name,
        sales: 0,
      };

      existing.sales += item.quantity;
      map.set(key, existing);
      return map;
    }, new Map());

  const topSellingItems = Array.from(aggregatedItems.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((item, index) => {
      const food = foods.find((entry) => entry.name === item.name);
      return {
        ...item,
        rank: index + 1,
        category: food?.category || 'Menu Item',
        image: food?.image || fallbackImage,
      };
    });

  const totalRevenue = adminOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = adminOrders.length;
  const activeUsers = new Set(adminOrders.map((order) => order.user_id)).size;
  const recentOrders = adminOrders.slice(0, 8);

  const maxSales = Math.max(...topSellingItems.map((item) => item.sales), 1);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await updateAdminOrderStatus(orderId, status);
      addToast(`Order updated to ${formatOrderStatus(status)}.`, 'success', 'OK');
    } catch (statusError) {
      addToast(statusError.message || 'Unable to update this order right now.', 'error', 'ERR');
    } finally {
      setUpdatingOrderId('');
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  return (
    <div className="admin-page container section animate-fade-in">
      <div className="admin-header mb-5">
        <h1>Admin Dashboard</h1>
        <p className="text-secondary">Overview of your restaurant's performance.</p>
      </div>

      {loading && (
        <div className="glass panel mb-4">
          <p className="text-secondary">Loading dashboard data from database...</p>
        </div>
      )}

      {adminOrdersLoading && (
        <div className="glass panel mb-4">
          <p className="text-secondary">Loading recent orders and revenue metrics...</p>
        </div>
      )}

      {error && (
        <div className="glass panel mb-4">
          <p style={{ color: 'var(--danger)' }}>Database error: {error}</p>
        </div>
      )}

      {adminOrdersError && (
        <div className="glass panel mb-4">
          <p style={{ color: 'var(--danger)' }}>Orders error: {adminOrdersError}</p>
        </div>
      )}

      <div className="stats-grid mb-5">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper w-revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">${totalRevenue.toFixed(2)}</h3>
            <p className="stat-trend trend-up"><TrendingUp size={14} /> Live from orders</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper w-orders">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{totalOrders}</h3>
            <p className="stat-trend trend-up"><TrendingUp size={14} /> Recorded checkouts</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper w-users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Users</p>
            <h3 className="stat-value">{activeUsers}</h3>
            <p className="stat-trend trend-up"><TrendingUp size={14} /> Customers with orders</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper w-revenue" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Utensils size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Items</p>
            <h3 className="stat-value">{foods.length}</h3>
            <p className="stat-trend text-secondary">Products on Menu</p>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        <div className="recent-orders glass panel">
          <h3 className="mb-4">Recent Orders Activity</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>
                      <div className="admin-customer-cell">
                        <strong>{order.customer_name}</strong>
                        <span>{order.customer_phone}</span>
                      </div>
                    </td>
                    <td>{formatOrderDate(order.created_at)}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <div className="status-control">
                        <span className={`badge ${resolveBadgeClass(order.status)}`}>
                          {formatOrderStatus(order.status)}
                        </span>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          disabled={updatingOrderId === order.id}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {formatOrderStatus(status)}
                            </option>
                          ))}
                        </select>
                        {updatingOrderId === order.id && (
                          <span className="status-saving">Saving...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!adminOrdersLoading && recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      No orders have been placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="popular-items glass panel">
          <div className="top-items-header">
            <h3>Top Selling Items</h3>
            <span className="top-items-subtext">Last 7 days</span>
          </div>
          <div className="top-item-list">
            {topSellingItems.map((item) => (
              <div key={item.name} className="top-item-card">
                <div className="top-item-main">
                  <span className="top-item-rank">#{item.rank}</span>
                  <img src={item.image} alt={item.name} className="top-item-thumb" />
                  <div className="top-item-info">
                    <h4>{item.name}</h4>
                    <p className="top-item-category">{item.category} Category</p>
                  </div>
                </div>
                <div className="top-item-sales-block">
                  <div className="top-item-sales">{item.sales} Sales</div>
                  <div className="sales-progress">
                    <span style={{ width: `${(item.sales / maxSales) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {!adminOrdersLoading && topSellingItems.length === 0 && (
              <p className="text-secondary">Top-selling items will appear after the first few orders come in.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
