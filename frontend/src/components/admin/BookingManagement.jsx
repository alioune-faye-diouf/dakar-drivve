import { useState, useEffect } from 'react';
import { fetchBookings, updateBookingStatus } from '../../services/api';
import { Calendar, Phone, Mail, Car, Check, X, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
];

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateBookingStatus(id, newStatus);
      toast.success(`Statut de la réservation #${id} mis à jour : ${newStatus}`);
      await loadBookings();
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        label: 'En attente',
      },
      confirmed: {
        bg: 'bg-green-500/15 text-green-400 border-green-500/30',
        label: 'Confirmée',
      },
      completed: {
        bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        label: 'Terminée',
      },
      cancelled: {
        bg: 'bg-red-500/15 text-red-400 border-red-500/30',
        label: 'Annulée',
      },
    };
    const c = configs[status] || {
      bg: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg}`}
      >
        {c.label}
      </span>
    );
  };

  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-white">Gestion des Réservations</h1>
          <p className="text-gray-500 text-sm mt-1">
            {bookings.length} demande{bookings.length !== 1 ? 's' : ''} enregistrée
            {bookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtre par statut */}
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === opt.value
                  ? 'bg-gold text-black'
                  : 'bg-card border border-border text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar size={36} className="mx-auto mb-2 text-gray-700" />
            <p>Aucune réservation trouvée pour ce filtre.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark/50 border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Réf</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Véhicule réservé</th>
                  <th className="px-5 py-3.5">Période de location</th>
                  <th className="px-5 py-3.5">Montant total</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-4 font-mono font-medium text-gold text-xs">
                      #{booking.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{booking.customer_name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <Mail size={11} /> {booking.customer_email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone size={11} /> {booking.customer_phone}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {booking.car ? (
                        <div>
                          <p className="font-medium text-white text-sm">
                            {booking.car.brand} {booking.car.model}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Number(booking.car.price_per_day).toLocaleString()} FCFA/j
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-xs">Véhicule non défini</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs text-gray-300">
                        Du <strong className="text-white">{booking.start_date}</strong>
                      </div>
                      <div className="text-xs text-gray-300">
                        au <strong className="text-white">{booking.end_date}</strong>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-white font-medium">
                        {Number(booking.total_amount).toLocaleString()} FCFA
                      </span>
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(booking.status)}</td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              disabled={updatingId === booking.id}
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="px-2.5 py-1 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 rounded text-xs font-medium transition"
                              title="Confirmer la réservation"
                            >
                              Confirmer
                            </button>
                            <button
                              disabled={updatingId === booking.id}
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded text-xs font-medium transition"
                              title="Annuler la réservation"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            disabled={updatingId === booking.id}
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="px-2.5 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded text-xs font-medium transition"
                            title="Marquer comme terminée"
                          >
                            Clôturer
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            disabled={updatingId === booking.id}
                            onClick={() => handleStatusChange(booking.id, 'pending')}
                            className="px-2 py-1 text-gray-500 hover:text-gray-300 text-xs transition"
                          >
                            Réouvrir
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-blue-400" /> Archivée
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
