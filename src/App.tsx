import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/admin/DashboardPage';
import { LoginPage } from './pages/admin/LoginPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { ProductCreatePage } from './pages/admin/ProductCreatePage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { getAdminToken } from './services/apiClient';
import { DealsPage } from './pages/admin/DealsPage';
import { CouponsPage } from './pages/admin/CouponsPage';
import { LicensesPage } from './pages/admin/LicensesPage';
import { UsersPage } from './pages/admin/UsersPage';
import { ReviewsPage } from './pages/admin/ReviewsPage';
import { BlogPage } from './pages/admin/BlogPage';

function AdminGuard({ children }: { children: ReactNode }) {
  const hasToken = Boolean(getAdminToken());
  return (
    <ProtectedRoute isAllowed={hasToken} redirectTo="/admin/login">
      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/deals" element={<DealsPage/>} />
        <Route path="/admin/coupons" element={<CouponsPage/>} />
        <Route path="/admin/licenses" element={<LicensesPage/>} />
        <Route path="/admin/users" element={<UsersPage/>} />
        <Route path="/admin/reviews" element={<ReviewsPage/>} />
        <Route path="/admin/blog" element={<BlogPage/>} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <DashboardPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminGuard>
              <ProductsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/products/create"
          element={
            <AdminGuard>
              <ProductCreatePage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <AdminGuard>
              <ProductCreatePage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminGuard>
              <OrdersPage />
            </AdminGuard>
          }
        />

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
