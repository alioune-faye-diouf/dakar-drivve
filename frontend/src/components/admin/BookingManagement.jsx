import { useState, useEffect } from 'react';
import { fetchBookings } from '../../services/api';
import { getAdminToken } from '../../services/adminApi';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getAdminToken();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings(token);
        setBookings(data);
      } catch (error) {
        console.error('Erreur chargement réservations', error);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [token]);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
      completed: 'bg-blue-500/20 text-blue-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement des réservations...</div>;

  return (
    <div>
      <h1 className="text-2xl font-light text-white mb-6">Réservations</h1>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark/50 border-b border-border">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Véhicule</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border hover:bg-white/5">
                <td className="px-4 py-3">#{booking.id}</td>
                <td className="px-4 py-3">
                  <div>{booking.customer_name}</div>
                  <div className="text-xs text-gray-400">{booking.customer_email}</div>
                  <div className="text-xs text-gray-400">{booking.customer_phone}</div>
                </td>
                <td className="px-4 py-3">
                  {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">Du {booking.start_date}</div>
                  <div className="text-sm">au {booking.end_date}</div>
                </td>
                <td className="px-4 py-3">{booking.total_amount.toLocaleString()} FCFA</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">Aucune réservation</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManagement;