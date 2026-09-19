import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, setUser, showToast, setActivePage } = useLibrary();

  const [email, setEmail] = useState('muxiddin980001@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedPass) {
      setErrorMessage('Iltimos, administrator parolini kiriting.');
      return;
    }

    // Verify admin credentials
    const isAllowedEmail = trimmedEmail === 'muxiddin980001@gmail.com';
    const isCorrectPassword = trimmedPass === 'm2oo50304' || trimmedPass === 'm20050304';

    if (isAllowedEmail && isCorrectPassword) {
      setUser({
        id: 'admin-main',
        name: 'Muxiddin (Administrator)',
        email: 'muxiddin980001@gmail.com',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        joinedDate: '2024-01-01',
        stats: {
          booksRead: 154,
          readingHours: 320,
          favoriteCount: 42,
          audioListenedHours: 85
        }
      });
      showToast('Xush kelibsiz, Bosh administrator! 👑', 'success');
      closeAuthModal();
      setActivePage('admin');
    } else {
      setErrorMessage('Login yoki parol noto‘g‘ri! Ushbu tizimga faqat administrator kirishi mumkin.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#140E0A]/98 border border-amber-500/35 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] backdrop-blur-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#201710] transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="font-serif-title text-xl font-extrabold text-stone-100 tracking-tight">
            Administrator Kirish
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Saytda ommaviy ro‘yxatdan o‘tish yopilgan. Kutubxona kitobxoni uchun hisob talab etilmaydi.
          </p>
        </div>

        {/* Notice box */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-950/80 mb-5 text-xs text-stone-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Eslatma:</span> Kutubxonadagi barcha kitoblar, audio darsliklar va materiallar erkin o‘qish uchun ochiq. Faqat administrator kirish huquqiga ega.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Admin elektron pochtasi (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="muxiddin980001@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1D150F]/90 border border-amber-950/80 focus:border-amber-500 text-sm text-stone-100 placeholder-stone-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Admin paroli
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1D150F]/90 border border-amber-950/80 focus:border-amber-500 text-sm text-stone-100 placeholder-stone-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-[0.99]"
          >
            <span>Tizimga kirish</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            Bekor qilish va kutubxonaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
};
