// AIConcierge.jsx
import { useState } from 'react';
import { MessageCircle, Sparkles, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../services/api';
import toast from 'react-hot-toast';

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour, je suis Baye, votre concierge DAKAR DRIVE. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(userMessage);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      toast.error('Erreur de communication avec le concierge');
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Désolé, je rencontre un problème technique. Veuillez réessayer.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant élégant */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-gold/10 backdrop-blur-sm border border-gold/30 text-gold p-4 rounded-full shadow-lg hover:bg-gold hover:text-black transition-all duration-300 group"
        aria-label="Ouvrir le concierge"
      >
        <Sparkles size={24} className="group-hover:scale-110 transition" />
      </button>

      {/* Drawer de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-card border-l border-border z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex justify-between items-center bg-dark/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <Sparkles className="text-gold" size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white">Baye, votre concierge</h3>
                  <p className="text-xs text-gray-400">Disponible 24h/24</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-dark/30">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gold text-black rounded-tr-none'
                        : 'bg-gray-800/80 text-white rounded-tl-none border border-white/5'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-5 border-t border-border bg-dark/50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 bg-black/30 border border-border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-gold transition placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold/90 text-black p-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Envoyer"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-3">
                Propulsé par Gemini AI · Réponses instantanées
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConcierge;