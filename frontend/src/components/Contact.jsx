// Contact.jsx (version enrichie)
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'envoi (email ou API)
    alert('Message envoyé (simulation)');
  };

  return (
    <section id="contact" className="py-24 bg-dark border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <span className="text-gold uppercase tracking-[.25em] text-sm">Contactez-nous</span>
          <h2 className="text-4xl md:text-5xl font-light mt-4 mb-6">
            Une question ? <span className="text-gold font-semibold">Échangeons.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            Notre équipe est disponible pour répondre à toutes vos demandes, 24h/24 et 7j/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coordonnées */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card p-8 rounded-2xl border border-border">
              <Phone className="text-gold mb-4" size={28} />
              <h3 className="text-xl font-medium mb-2">Téléphone</h3>
              <a href="tel:+221331234567" className="text-gray-300 hover:text-gold text-lg block">+221 33 123 45 67</a>
              <a href="https://wa.me/221771234567" target="_blank" className="text-sm text-gold hover:underline block mt-2">WhatsApp</a>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border">
              <Mail className="text-gold mb-4" size={28} />
              <h3 className="text-xl font-medium mb-2">Email</h3>
              <a href="mailto:contact@dakardrive.sn" className="text-gray-300 hover:text-gold text-lg">contact@dakardrive.sn</a>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border">
              <MapPin className="text-gold mb-4" size={28} />
              <h3 className="text-xl font-medium mb-2">Adresse</h3>
              <p className="text-gray-300">Almadies, Dakar<br />Sénégal</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2 bg-card p-8 lg:p-10 rounded-2xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-dark border border-border rounded-lg px-5 py-4 text-white focus:outline-none focus:border-gold transition"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-dark border border-border rounded-lg px-5 py-4 text-white focus:outline-none focus:border-gold transition"
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-dark border border-border rounded-lg px-5 py-4 text-white focus:outline-none focus:border-gold transition resize-none"
                  placeholder="Votre message..."
                />
              </div>
              <button 
                type="submit"
                className="inline-flex items-center bg-gold hover:bg-gold/90 text-black font-medium px-8 py-4 rounded-lg transition"
              >
                Envoyer le message
                <Send size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;