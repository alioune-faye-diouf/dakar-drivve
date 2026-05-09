// Hero.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Vidéo */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-wide mb-6">
            <span className="text-white">L'EXCELLENCE SUR LES</span>
            <br />
            <span className="text-gold font-semibold">ROUTES DU SÉNÉGAL</span>
          </h1>
          
          <p className="text-gray-300 text-lg md:text-2xl font-light max-w-3xl mx-auto mb-12">
            Vivez l'expérience du luxe automobile à Dakar.
            <br className="hidden md:block" />
            Mercedes, Range Rover, Porsche à votre service.
          </p>

          <Link 
            to="/booking" 
            className="group inline-flex items-center bg-gold hover:bg-gold/90 text-black font-medium px-8 py-4 rounded-sm uppercase tracking-widest text-sm transition-all transform hover:scale-105 shadow-lg"
          >
            Réserver maintenant
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={18} />
          </Link>
        </motion.div>
      </div>

      {/* Indicateur de scroll */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-3 bg-gold rounded-full mt-2"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;