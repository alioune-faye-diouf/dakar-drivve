import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Fleet from '../components/Fleet';
import MapSection from '../components/MapSection';
import AIConcierge from '../components/AIConcierge';
import Contact from '../components/Contact';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Si un hash est présent dans l'URL, défiler vers la section correspondante
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Hero />
      <Fleet />
      <MapSection />
      <Contact />
      <AIConcierge />
    </>
  );
};

export default Home;