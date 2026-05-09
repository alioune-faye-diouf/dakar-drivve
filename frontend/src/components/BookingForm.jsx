import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { fetchCars, createBooking } from '../services/api';
import PaymentChoice from './PaymentChoice';
import toast from 'react-hot-toast';

const schema = z.object({
  car_id: z.string().min(1, 'Veuillez choisir un véhicule'),
  customer_name: z.string().min(2, 'Nom requis'),
  customer_email: z.string().email('Email invalide'),
  customer_phone: z.string().regex(/^(77|78|76|70)\d{7}$/, 'Numéro de téléphone sénégalais invalide (ex: 77XXXXXXX)'),
  start_date: z.string().min(1, 'Date de début requise'),
  end_date: z.string().min(1, 'Date de fin requise'),
});

const BookingForm = ({ preselectedCarId }) => {
  const [cars, setCars] = useState([]);
  const [bookingId, setBookingId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      car_id: preselectedCarId || '',
    }
  });

  useEffect(() => {
    const loadCars = async () => {
      try {
        const data = await fetchCars();
        setCars(data);
        if (preselectedCarId) {
          setValue('car_id', preselectedCarId.toString());
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des véhicules');
      }
    };
    loadCars();
  }, [preselectedCarId]);

  const selectedCarId = watch('car_id');
  const selectedCar = cars.find(c => c.id === parseInt(selectedCarId));

  // Calcul du prix total estimé
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  let estimatedTotal = 0;
  if (selectedCar && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    estimatedTotal = days * selectedCar.price_per_day;
  }

  const onSubmit = async (data) => {
    try {
      const booking = await createBooking({
        ...data,
        car_id: parseInt(data.car_id),
      });
      setBookingId(booking.id);
      setBookingData({
        bookingId: booking.id,
        amount: booking.total_amount,
        customerPhone: data.customer_phone,
      });
      setShowPayment(true);
    } catch (error) {
      toast.error('Erreur lors de la création de la réservation');
    }
  };

  if (showPayment && bookingData) {
    return <PaymentChoice bookingData={bookingData} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-card p-8 rounded-lg border border-border">
      <h2 className="text-2xl font-semibold mb-6 text-gold">Formulaire de réservation</h2>
      
      <div className="space-y-6">
        {/* Véhicule */}
        <div>
          <label className="block text-sm font-medium mb-2">Véhicule</label>
          <select 
            {...register('car_id')}
            className="w-full bg-dark border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
          >
            <option value="">Sélectionnez un véhicule</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>
                {car.brand} {car.model} - {car.price_per_day.toLocaleString()} FCFA/jour
              </option>
            ))}
          </select>
          {errors.car_id && <p className="text-red-500 text-sm mt-1">{errors.car_id.message}</p>}
        </div>

        {/* Informations client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom complet</label>
            <input 
              {...register('customer_name')}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
            />
            {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              {...register('customer_email')}
              type="email"
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
            />
            {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Téléphone (format 77XXXXXXX)</label>
          <input 
            {...register('customer_phone')}
            placeholder="77 123 45 67"
            className="w-full bg-dark border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
          />
          {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone.message}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date de début</label>
            <input 
              {...register('start_date')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
            />
            {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de fin</label>
            <input 
              {...register('end_date')}
              type="date"
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
            />
            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>}
          </div>
        </div>

        {/* Résumé */}
        {estimatedTotal > 0 && (
          <div className="bg-dark/50 p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <span>Total estimé :</span>
              <span className="text-xl font-bold text-gold">{estimatedTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-gold hover:bg-gold/90 text-black font-semibold py-3 rounded-lg transition"
        >
          Continuer vers le paiement
        </button>
      </div>
    </form>
  );
};

export default BookingForm;