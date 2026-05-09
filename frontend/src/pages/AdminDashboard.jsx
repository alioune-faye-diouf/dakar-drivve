import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Car, Calendar, CreditCard, LogOut } from 'lucide-react';
import CarManagement from '../components/admin/CarManagement';
import BookingManagement from '../components/admin/BookingManagement';
import PaymentManagement from '../components/admin/PaymentManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cars');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <h2 className="text-xl font-light text-white mb-8">
          <span className="text-gold">DAKAR</span> ADMIN
        </h2>
        <nav className="space-y-2 flex-1">
          <Link
            to="/admin/dashboard/cars"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${
              activeTab === 'cars' ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('cars')}
          >
            <Car size={20} />
            <span>Voitures</span>
          </Link>
          <Link
            to="/admin/dashboard/bookings"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${
              activeTab === 'bookings' ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={20} />
            <span>Réservations</span>
          </Link>
          <Link
            to="/admin/dashboard/payments"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${
              activeTab === 'payments' ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={20} />
            <span>Paiements</span>
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition mt-auto"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="cars" element={<CarManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route index element={<CarManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;