import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Calendar, CreditCard, LogOut, Tag, ShieldCheck } from 'lucide-react';
import CarManagement from '../components/admin/CarManagement';
import BookingManagement from '../components/admin/BookingManagement';
import PaymentManagement from '../components/admin/PaymentManagement';
import BrandManagement from '../components/admin/BrandManagement';
import { adminLogout } from '../services/adminApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const navItems = [
    {
      to: '/admin/dashboard/cars',
      icon: Car,
      label: 'Véhicules',
      exact: true,
      path: '/admin/dashboard/cars',
    },
    {
      to: '/admin/dashboard/brands',
      icon: Tag,
      label: 'Marques & Modèles',
      path: '/admin/dashboard/brands',
    },
    {
      to: '/admin/dashboard/bookings',
      icon: Calendar,
      label: 'Réservations',
      path: '/admin/dashboard/bookings',
    },
    {
      to: '/admin/dashboard/payments',
      icon: CreditCard,
      label: 'Paiements',
      path: '/admin/dashboard/payments',
    },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col justify-between">
        <div>
          {/* Logo / Title */}
          <div className="mb-8">
            <h2 className="text-xl font-light text-white tracking-wide">
              <span className="text-gold font-semibold">DAKAR</span> DRIVE
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gold/80 mt-1 uppercase tracking-wider font-medium">
              <ShieldCheck size={13} />
              <span>Administration Sécurisée</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.path ||
                (item.exact && currentPath === '/admin/dashboard');

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar / Logout */}
        <div className="pt-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition w-full text-left"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="cars" element={<CarManagement />} />
          <Route path="brands" element={<BrandManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route index element={<CarManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
