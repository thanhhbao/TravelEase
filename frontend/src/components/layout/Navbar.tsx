import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Calendar, Plane, Home, Shield, Building2 } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import logoImage from '/public/images/logo.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    { name: "Hotels", href: "/hotels" },
    { name: "Services", href: "/services" },
  ];

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [isUserMenuOpen]);

  return (
    <nav className="bg-sky-50/90 backdrop-blur-md sticky top-0 z-50 border-b border-sky-100 shadow-lg">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
          src={logoImage} 
          alt="TravelEase Logo" 
          className="h-10 w-10 object-cover"/>
            </div>
            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-800">
              TravelEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative font-medium transition-colors duration-200 group
                    ${
                      active
                        ? "text-sky-700" // màu chữ khi active
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300
                      ${
                        active
                          ? "w-full bg-sky-600" // underline khi active (xanh dương)
                          : "w-0 bg-gray-900 group-hover:w-full"
                      }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="group flex items-center space-x-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-gray-700 shadow-sm transition-all duration-200 hover:shadow hover:-translate-y-[1px]"
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
                  <div
                    className="dropdown-panel absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl ring-1 ring-black/5 z-50"
                    style={{ transformOrigin: "top right" }}
                  >
                    <div>
                      <div className="py-2">
                        {user?.capabilities?.canAccessAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        {(user?.roles?.includes("host") || user?.role === "host" || user?.capabilities?.canPostListings) && (
                          <Link
                            to="/host/workspace"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Building2 className="h-4 w-4" />
                            <span>Host Workspace</span>
                          </Link>
                        )}
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
                          className="flex w-full items-center space-x-2 px-4 py-2 text-left text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary rounded-full"
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
                      src={avatarOf(user?.name, user?.avatar || undefined)}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = avatarOf(user?.name);
                      }}
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
                  {user?.capabilities?.canAccessAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  {(user?.roles?.includes("host") || user?.role === "host" || user?.capabilities?.canPostListings) && (
                    <Link
                      to="/host/workspace"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Host Workspace
                    </Link>
                  )}
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
