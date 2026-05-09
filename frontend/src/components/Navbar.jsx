// Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-3' 
        : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        <Link to="/" className="text-2xl font-light tracking-wider">
          <span className="text-white">DAKAR</span>
          <span className="text-gold font-medium">DRIVE</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10 text-sm uppercase tracking-widest font-light">
          <Link 
            to="/" 
            className={`hover:text-gold transition ${isActive('/') ? 'text-gold' : 'text-white/80'}`}
          >
            Accueil
          </Link>
          <button 
            onClick={() => handleNavClick('fleet')} 
            className="text-white/80 hover:text-gold transition"
          >
            Flotte
          </button>
          <Link 
            to="/booking" 
            className={`hover:text-gold transition ${isActive('/booking') ? 'text-gold' : 'text-white/80'}`}
          >
            Réservation
          </Link>
          <button 
            onClick={() => handleNavClick('contact')} 
            className="text-white/80 hover:text-gold transition"
          >
            Contact
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-t border-white/10 py-8">
          <div className="flex flex-col items-center space-y-8 text-lg font-light">
            <Link to="/" onClick={() => setMobileOpen(false)} className="hover:text-gold">Accueil</Link>
            <button onClick={() => handleNavClick('fleet')} className="hover:text-gold">Flotte</button>
            <Link to="/booking" onClick={() => setMobileOpen(false)} className="hover:text-gold">Réservation</Link>
            <button onClick={() => handleNavClick('contact')} className="hover:text-gold">Contact</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;