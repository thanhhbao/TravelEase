import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth';

// Pages
import Home from './pages/Home';
import HotelsList from './pages/hotels/HotelsList';
import HotelDetail from './pages/hotels/HotelDetail';
import Flights from './pages/flights/Flight';

// Dùng 1 component cho cả login & register
import AuthPage from './pages/auth/AuthPage';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import Bookings from './pages/dashboard/Bookings';
import Tickets from './pages/dashboard/Tickets';
import Profile from './pages/dashboard/Profile';
import Checkout from './pages/checkout/Checkout';
import FlightDetails from './pages/flights/FlightDetails';
import Services from './pages/Services';
import Contact from './pages/Contact';

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
      <ScrollToTop />
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
             <Route path="/flights/:id" element={<FlightDetails />} />

            {/* Auth: cùng 1 component, tự nhận biết qua path (/login | /register) */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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

            {/* Service Routes */}
            <Route path="/services" element={<Services />} />
            <Route path="/service/contact" element={<Contact />} />
            <Route path="/service/bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />
            <Route path="/cars" element={<Services />} />
            <Route path="/insurance" element={<Services />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                    <Link to="/" className="btn-primary">Go Home</Link>
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
