import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginAdmin, isTokenValid } from '../services/adminApi';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTokenValid()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await loginAdmin(data.email, data.password);
      localStorage.setItem('adminToken', response.access_token);
      toast.success('Authentification réussie');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Identifiants invalides ou accès non autorisé'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold/15 text-gold border border-gold/30 mb-3">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-light text-white tracking-wide">
            Espace <span className="text-gold font-semibold">Administration</span>
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
            Dakar Drive • Accès Restreint
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
              Email administrateur
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="admin@dakardrive.sn"
                className="w-full bg-dark border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-dark border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-gold/10 mt-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                Vérification...
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
