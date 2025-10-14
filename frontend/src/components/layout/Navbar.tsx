import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Calendar, Plane, Home } from "lucide-react";
import { useAuthStore } from "../../store/auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };
  const avatarOf = (name?: string, url?: string) => {
    if (url) return url;
    const text = encodeURIComponent(name || "U");
    return `https://ui-avatars.com/api/?name=${text}&background=0D8ABC&color=fff&size=64&rounded=true`;
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Flights", href: "/flights" },
    { name: "Rooms", href: "/hotels" },
    { name: "Service", href: "/service" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-lg">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Plane className="h-10 w-10 text-gray-900 group-hover:text-gray-700 transition-colors duration-300" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900">TravelEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <img
                    src={avatarOf(user?.name, user?.avatar || undefined)}
                    onError={(e) => {
                      // nếu link mạng lỗi thì fallback ngay lập tức
                      (e.currentTarget as HTMLImageElement).src = avatarOf(user?.name);
                    }}
                    alt={user?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{user?.name || "User"}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                    <Link
                      to="/my/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/my/bookings"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                    <Link
                      to="/my/tickets"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Plane className="h-4 w-4" />
                      <span>My Tickets</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-5 py-2 font-medium hover:bg-gray-800 transition"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <img
                      src={user?.avatar || "https://via.placeholder.com/64x64.png?text=U"}
                      alt={user?.name || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user?.name || "User"}</p>
                      <p className="text-sm text-gray-500">{user?.email || ""}</p>
                    </div>
                  </div>
                  <Link
                    to="/my/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my/bookings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/my/tickets"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Tickets
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
