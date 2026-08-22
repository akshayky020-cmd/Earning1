import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';

import { Layout } from './layouts/Layout';
import { AdminLayout } from './layouts/AdminLayout';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Plans } from './pages/Plans';
import { Wallet } from './pages/Wallet';
import { Deposit } from './pages/Deposit';
import { Withdraw } from './pages/Withdraw';
import { Profile } from './pages/Profile';
import { CheckIn } from './pages/CheckIn';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Invite } from './pages/Invite';
import { Support } from './pages/Support';
import { Team } from './pages/Team';
import { About } from './pages/About';
import { FinancialRecords } from './pages/FinancialRecords';
import { WithdrawRecords } from './pages/WithdrawRecords';
import { ProductHistory } from './pages/ProductHistory';
import { ChangePassword } from './pages/ChangePassword';
import { WatchAndEarn } from './pages/WatchAndEarn';
import { Home } from './pages/Home';
import { PaymentPage } from './pages/PaymentPage';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminFinances } from './pages/admin/AdminFinances';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminPaymentManagement } from './pages/admin/AdminPaymentManagement';
import { AdminDepositRequests } from './pages/admin/AdminDepositRequests';
import { AdminAds } from './pages/admin/AdminAds';

const queryClient = new QueryClient();

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="finances" element={<AdminFinances />} />
                <Route path="plans" element={<AdminPlans />} />
                <Route path="settings" element={<AdminPaymentManagement />} />
                <Route path="deposits" element={<AdminDepositRequests />} />
                <Route path="ads" element={<AdminAds />} />
              </Route>
            </Route>


            {/* User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/team" element={<Team />} />
                <Route path="/invite" element={<Invite />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<About />} />
                <Route path="/records/financial" element={<FinancialRecords />} />
                <Route path="/records/withdraw" element={<WithdrawRecords />} />
                <Route path="/records/product" element={<ProductHistory />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/watch-earn" element={<WatchAndEarn />} />
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
