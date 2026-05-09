import { useState, useEffect } from 'react';
import { fetchPayments } from '../../services/api';
import { getAdminToken } from '../../services/adminApi';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getAdminToken();

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await fetchPayments(token);
        setPayments(data);
      } catch (error) {
        console.error('Erreur chargement paiements', error);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, [token]);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      success: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      cancelled: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement des paiements...</div>;

  return (
    <div>
      <h1 className="text-2xl font-light text-white mb-6">Paiements</h1>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark/50 border-b border-border">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Réservation</th>
              <th className="px-4 py-3">Méthode</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border hover:bg-white/5">
                <td className="px-4 py-3">#{payment.id}</td>
                <td className="px-4 py-3">
                  #{payment.bookingId} - {payment.booking?.car?.brand} {payment.booking?.car?.model}
                </td>
                <td className="px-4 py-3">
                  {payment.payment_method === 'wave' ? 'Wave' : 'Orange Money'}
                </td>
                <td className="px-4 py-3">{payment.customer_phone}</td>
                <td className="px-4 py-3">{payment.amount.toLocaleString()} FCFA</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(payment.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">Aucun paiement</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;