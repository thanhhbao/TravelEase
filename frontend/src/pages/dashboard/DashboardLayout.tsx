import { Outlet, Link, useLocation } from "react-router-dom";
import { Calendar, Plane, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function DashboardLayout() {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: "My Bookings", href: "/my/bookings", icon: Calendar },
    { name: "My Tickets", href: "/my/tickets", icon: Plane },
    { name: "Profile", href: "/my/profile", icon: User },
  ];

  const isActive = (href: string) => location.pathname.startsWith(href);

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('.active-tab');
      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink as HTMLElement;
        setIndicatorStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Manage your trips, tickets, and personal details in one place.
            </p>
          </div>
        </div>

        <nav className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={navRef} className="relative flex gap-2 overflow-x-auto py-3">
              {/* Sliding Indicator */}
              <div
                className="absolute bottom-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-full transition-all duration-450 ease-out"
                style={indicatorStyle}
              />
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ease-out relative z-10 ${
                    isActive(item.href)
                      ? "active-tab text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 font-semibold scale-105"
                      : "text-gray-600 hover:text-blue-600 hover:scale-102"
                  }`}
                >
                  <item.icon className={`h-4 w-4 transition-all duration-500 ${
                    isActive(item.href) 
                      ? "text-blue-600 scale-110" 
                      : "text-current"
                  }`} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}