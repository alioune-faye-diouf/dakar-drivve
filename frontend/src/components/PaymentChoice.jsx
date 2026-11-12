import { useState } from 'react';
import { initiatePayment } from '../services/api';
import toast from 'react-hot-toast';

const PaymentChoice = ({ bookingData }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handlePayment = async (method) => {
    setSelectedMethod(method);
    setLoading(true);
    try {
      const { redirectUrl } = await initiatePayment({
        bookingId: bookingData.bookingId,
        payment_method: method,
        customer_phone: bookingData.customerPhone,
      });
      
      // Redirection vers PayTech
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error('Erreur lors de l\'initiation du paiement');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card p-8 rounded-lg border border-border">
      <h2 className="text-2xl font-semibold mb-6 text-center">Choisissez votre mode de paiement</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => handlePayment('wave')}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-[#1E3A8A] bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 transition group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-md p-1 flex items-center justify-center overflow-hidden">
              <img src="/wave.png" alt="Wave" className="w-full h-full object-contain" />
            </div>
            <span className="font-medium text-lg">Wave</span>
          </div>
          <span className="text-sm text-gray-400">Paiement mobile</span>
        </button>

        <button
          onClick={() => handlePayment('orange_money')}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-[#F60] bg-[#F60]/10 hover:bg-[#F60]/20 transition group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-md p-1 flex items-center justify-center overflow-hidden">
              <img src="/orange-money.png" alt="Orange Money" className="w-full h-full object-contain" />
            </div>
            <span className="font-medium text-lg">Orange Money</span>
          </div>
          <span className="text-sm text-gray-400">Paiement mobile</span>
        </button>
      </div>

      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
          <p className="mt-2 text-gray-400">Redirection vers la plateforme de paiement...</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-8 text-center">
        Paiement sécurisé via PayTech. Vos données sont cryptées.
      </p>
    </div>
  );
};

export default PaymentChoice;