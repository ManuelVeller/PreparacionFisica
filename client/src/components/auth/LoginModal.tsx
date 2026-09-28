import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { Dumbbell, UserCheck, ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('profe');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load saved credentials on mount if user had rememberMe checked
  useEffect(() => {
    const saved = StorageService.getSavedCredentials();
    if (saved) {
      setFullName(saved.name || '');
      setEmail(saved.email || '');
      setRole((saved.role as UserRole) || 'profe');
      setPassword('••••••••');
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setLoading(true);

    setTimeout(() => {
      const user: User = {
        id: role === 'profe' ? 'coach-main' : 'student-1',
        name: fullName,
        email: email,
        role: role,
        rememberMe
      };

      // Save credentials if selected
      StorageService.setSavedCredentials({
        name: fullName,
        email: email,
        role: role,
        remember: rememberMe
      });

      StorageService.setCurrentUser(user);
      setLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  // Quick fill demo shortcuts for easy testing
  const handleQuickDemo = (selectedRole: UserRole) => {
    if (selectedRole === 'profe') {
      setRole('profe');
      setFullName('Prof. Alejandro Gómez');
      setEmail('prof.alejandro@edufisica.ar');
      setPassword('password123');
    } else {
      setRole('alumno');
      setFullName('Martina Rossi');
      setEmail('martina@ejemplo.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-slate-100/60 to-emerald-50/40">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_-15px_rgba(15,23,42,0.08)] border border-slate-100 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            EduFísica Pro
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Plataforma de entrenamiento y visualización técnica
          </p>
        </div>

        {/* Role Selector Pill */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Selecciona tu Perfil
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setRole('profe')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                role === 'profe'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${role === 'profe' ? 'text-emerald-500' : 'text-slate-400'}`} />
              Profesor/a
            </button>

            <button
              type="button"
              onClick={() => setRole('alumno')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                role === 'alumno'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${role === 'alumno' ? 'text-emerald-500' : 'text-slate-400'}`} />
              Alumno/a
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Nombre y Apellido
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'profe' ? 'Ej. Juan Pérez' : 'Ej. Martina Rossi'}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">
                Contraseña
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Autoguardado / Remember option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
              />
              <span>Autoguardar credenciales</span>
            </label>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              {rememberMe ? 'Guardado activo' : 'Temporal'}
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-pulse">Ingresando...</span>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Pill Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Acceso rápido de prueba (1 clic):</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('profe')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-100 cursor-pointer"
            >
              Demo Profe
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('alumno')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-100 cursor-pointer"
            >
              Demo Alumna (Martina)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
