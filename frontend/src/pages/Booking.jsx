import { useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

const Booking = () => {
  const { carId } = useParams();

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-light text-center mb-12">
          <span className="text-gold font-semibold">Réservez</span> votre véhicule de luxe
        </h1>
        <BookingForm preselectedCarId={carId} />
      </div>
    </div>
  );
};

export default Booking;