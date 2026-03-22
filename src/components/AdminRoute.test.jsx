import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminRoute from './AdminRoute';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderRoute = (authState) => {
  mockUseAuth.mockReturnValue(authState);

  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Admin Content</div>
            </AdminRoute>
          }
        />
        <Route path="/admin-login" element={<div>Admin Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminRoute', () => {
  it('renders children for authenticated admins', () => {
    renderRoute({ user: { id: '1' }, isAdmin: true, loading: false });
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects non-admin users to the admin login page', () => {
    renderRoute({ user: null, isAdmin: false, loading: false });
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });
});
