import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Gauge, Calendar, Loader2, Fuel, Users } from 'lucide-react';
import { fetchCars } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        const data = await fetchCars();
        setCars(data);
      } catch (err) {
        console.error('Erreur chargement flotte', err);
        setError('Impossible de charger la flotte. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    loadCars();
  }, []);

  const getCarImageUrl = (car) => {
    if (car.photos && car.photos.length > 0) {
      const primary = car.photos.find((p) => p.is_primary) || car.photos[0];
      return `${API_URL}${primary.file_path}`;
    }
    return car.image_url || null;
  };

  return (
    <section id="fleet" className="py-24 bg-dark">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-gold uppercase tracking-[.25em] text-sm font-medium">
            Notre collection
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mt-4 mb-6">
            Flotte <span className="text-gold font-semibold">Premium</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto font-light">
            Chaque véhicule est rigoureusement sélectionné et entretenu pour vous offrir une expérience de conduite incomparable.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-gold mr-3" size={32} />
            <span className="text-gray-400">Chargement de la flotte...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-gold underline underline-offset-4 hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Aucun véhicule disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {cars.map((car, index) => {
                const imageUrl = getCarImageUrl(car);
                const photoCount = car.photos ? car.photos.length : car.image_url ? 1 : 0;

                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-500 hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/5 flex flex-col justify-between"
                  >
                    {index === 0 && (
                      <div className="absolute top-4 left-4 z-10 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Le plus demandé
                      </div>
                    )}

                    {photoCount > 1 && (
                      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                        {photoCount} photos
                      </div>
                    )}

                    <div>
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={car.name}
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <Car
                            size={90}
                            className="absolute inset-0 m-auto text-gold/40 group-hover:text-gold/60 transition"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>

                      <div className="p-6 lg:p-8">
                        <h3 className="text-2xl font-light mb-1.5 tracking-wide text-white">
                          {car.brand}{' '}
                          <span className="font-medium text-gold">{car.model}</span>
                        </h3>
                        <p className="text-gray-400 text-xs mb-6 uppercase tracking-wider">
                          {car.year} • {car.transmission} • {car.fuel_type || 'Essence'}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-gray-300">
                          <div className="flex items-center">
                            <Gauge size={16} className="text-gold mr-2 flex-shrink-0" />
                            <span className="font-light text-xs">{car.horsepower} ch</span>
                          </div>
                          <div className="flex items-center">
                            <Users size={16} className="text-gold mr-2 flex-shrink-0" />
                            <span className="font-light text-xs">{car.seats || 5} places</span>
                          </div>
                        </div>

                        <div className="mb-6 pt-4 border-t border-border flex items-baseline justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-400">
                            Tarif journalier
                          </span>
                          <span className="text-xl font-light text-white">
                            <span className="text-gold font-semibold">
                              {Number(car.price_per_day).toLocaleString()}
                            </span>{' '}
                            <span className="text-xs text-gray-400">FCFA/j</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 lg:px-8 lg:pb-8">
                      <Link
                        to={`/booking/${car.id}`}
                        className="block w-full text-center border border-gold text-gold hover:bg-gold hover:text-black font-medium py-3 rounded-md transition duration-300 uppercase tracking-wider text-xs"
                      >
                        Réserver ce véhicule
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-16">
              <Link
                to="/booking"
                className="text-gold underline underline-offset-4 hover:no-underline text-lg"
              >
                Voir toute la flotte →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Fleet;
