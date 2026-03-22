/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createOrder, fetchOrders, updateOrderStatus } from '../lib/orders';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [myOrdersError, setMyOrdersError] = useState('');
  const [adminOrdersError, setAdminOrdersError] = useState('');

  const refreshMyOrders = useCallback(
    async (userId = user?.id) => {
      if (!userId) {
        setMyOrders([]);
        setMyOrdersError('');
        return [];
      }

      setMyOrdersLoading(true);
      setMyOrdersError('');

      try {
        const orders = await fetchOrders({ userId });
        setMyOrders(orders);
        return orders;
      } catch (error) {
        setMyOrders([]);
        setMyOrdersError(error.message || 'Unable to load your orders.');
        throw error;
      } finally {
        setMyOrdersLoading(false);
      }
    },
    [user?.id]
  );

  const refreshAdminOrders = useCallback(async () => {
    setAdminOrdersLoading(true);
    setAdminOrdersError('');

    try {
      const orders = await fetchOrders();
      setAdminOrders(orders);
      return orders;
    } catch (error) {
      setAdminOrders([]);
      setAdminOrdersError(error.message || 'Unable to load admin orders.');
      throw error;
    } finally {
      setAdminOrdersLoading(false);
    }
  }, []);

  const placeOrder = useCallback(
    async (payload) => {
      const order = await createOrder({
        user,
        ...payload,
      });

      setMyOrders((prev) => [order, ...prev]);

      if (isAdmin) {
        setAdminOrders((prev) => [order, ...prev]);
      }

      return order;
    },
    [isAdmin, user]
  );

  const updateAdminOrderStatus = useCallback(async (orderId, status) => {
    const updatedOrder = await updateOrderStatus(orderId, status);

    setAdminOrders((prev) =>
      prev.map((order) => (order.id === orderId ? updatedOrder : order))
    );
    setMyOrders((prev) =>
      prev.map((order) => (order.id === orderId ? updatedOrder : order))
    );

    return updatedOrder;
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setMyOrders([]);
      setAdminOrders([]);
      setMyOrdersError('');
      setAdminOrdersError('');
      return;
    }

    if (isAdmin) {
      setMyOrders([]);
      setMyOrdersError('');
      refreshAdminOrders().catch(() => {});
      return;
    }

    setAdminOrders([]);
    setAdminOrdersError('');
    refreshMyOrders(user.id).catch(() => {});
  }, [authLoading, isAdmin, refreshAdminOrders, refreshMyOrders, user]);

  return (
    <OrdersContext.Provider
      value={{
        myOrders,
        adminOrders,
        myOrdersLoading,
        adminOrdersLoading,
        myOrdersError,
        adminOrdersError,
        refreshMyOrders,
        refreshAdminOrders,
        placeOrder,
        updateAdminOrderStatus,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
