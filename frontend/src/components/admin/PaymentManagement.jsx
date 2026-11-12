import { useState, useEffect } from 'react';
import { fetchPayments } from '../../services/api';
import { CreditCard, Smartphone, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await fetchPayments();
        setPayments(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des paiements');
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        label: 'En attente',
        icon: Clock,
      },
      processing: {
        bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        label: 'En cours',
        icon: Clock,
      },
      success: {
        bg: 'bg-green-500/15 text-green-400 border-green-500/30',
        label: 'Payé avec succès',
        icon: CheckCircle,
      },
      failed: {
        bg: 'bg-red-500/15 text-red-400 border-red-500/30',
        label: 'Échoué',
        icon: XCircle,
      },
      cancelled: {
        bg: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
        label: 'Annulé',
        icon: AlertTriangle,
      },
    };
    const c = configs[status] || {
      bg: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      label: status,
      icon: Clock,
    };
    const Icon = c.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg}`}
      >
        <Icon size={12} />
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light text-white">Gestion des Paiements</h1>
          <p className="text-gray-500 text-sm mt-1">
            Suivi des transactions Wave et Orange Money via PayTech
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CreditCard size={36} className="mx-auto mb-2 text-gray-700" />
            <p>Aucun paiement enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark/50 border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">ID Transaction</th>
                  <th className="px-5 py-3.5">Réservation & Véhicule</th>
                  <th className="px-5 py-3.5">Moyen de paiement</th>
                  <th className="px-5 py-3.5">Téléphone client</th>
                  <th className="px-5 py-3.5">Montant</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Date & Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-4 font-mono text-gold text-xs">
                      #{payment.id}
                      {payment.transaction_id && (
                        <span className="block text-[10px] text-gray-500 truncate max-w-[120px]">
                          {payment.transaction_id}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs text-gold font-medium">
                        Réservation #{payment.bookingId}
                      </span>
                      {payment.booking?.car && (
                        <p className="text-sm text-white font-medium">
                          {payment.booking.car.brand} {payment.booking.car.model}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {payment.payment_method === 'wave' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <Smartphone size={12} />
                          Wave
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          <Smartphone size={12} />
                          Orange Money
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-mono text-gray-300 text-xs">
                      {payment.customer_phone}
                    </td>

                    <td className="px-5 py-4 font-medium text-white">
                      {Number(payment.amount).toLocaleString()} FCFA
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(payment.status)}</td>

                    <td className="px-5 py-4 text-right text-xs text-gray-400 font-mono">
                      {new Date(payment.created_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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

export default PaymentManagement;
