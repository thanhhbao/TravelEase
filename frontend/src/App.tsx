import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth';

// Pages
import Home from './pages/Home';
import HotelsList from './pages/hotels/HotelsList';
import HotelDetail from './pages/hotels/HotelDetail';
import Flights from './pages/flights/Flight';

// Dùng 1 component cho cả login & register
import AuthPage from './pages/auth/AuthPage';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import Bookings from './pages/dashboard/Bookings';
import Tickets from './pages/dashboard/Tickets';
import Profile from './pages/dashboard/Profile';
import Checkout from './pages/checkout/Checkout';

function App() {
  const { bootstrap, isBootstrapping } = useAuthStore();

  useEffect(() => {
    bootstrap(); // gọi /api/user để khôi phục phiên đăng nhập (nếu có)
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<HotelsList />} />
            <Route path="/hotels/:slug" element={<HotelDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/flights" element={<Flights />} />

            {/* Auth: cùng 1 component, tự nhận biết qua path (/login | /register) */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Protected */}
            <Route
              path="/my"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="bookings" element={<Bookings />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
