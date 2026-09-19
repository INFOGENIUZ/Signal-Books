import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  BookOpen, 
  Clock, 
  Star, 
  Headphones, 
  Settings, 
  Lock, 
  Bell, 
  LogOut, 
  Check, 
  Shield, 
  Camera,
  Calendar
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export const ProfilePage: React.FC = () => {
  const { user, setUser, favorites, readingHistory, showToast, setActivePage } = useLibrary();

  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'notifications'>('info');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400">Profilni ko‘rish uchun tizimga kiring.</p>
      </div>
    );
  }

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      email
    });
    showToast('Profil ma’lumotlari saqlandi!', 'success');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Iltimos, maydonlarni to‘ldiring', 'error');
      return;
    }
    showToast('Parol muvaffaqiyatli yangilandi!', 'success');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Tizimdan muvaffaqiyatli chiqildi', 'info');
    setActivePage('home');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E140D] to-[#140D08] border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-500/40 shadow-xl"
            />
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-serif-title text-2xl font-extrabold text-stone-100">{user.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                user.role === 'ADMIN' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              }`}>
                {user.role === 'ADMIN' ? 'Administrator' : 'Kitobxon'}
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1 font-mono">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{user.email}</span>
            </p>
            <p className="text-[11px] text-stone-400 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>A’zo bo‘lgan sana: {user.joinedDate}</span>
            </p>
          </div>

          <div className="sm:ml-auto">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-[#130E09] hover:bg-rose-950/40 text-rose-400 border border-amber-950 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">O‘qilgan kitoblar</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono">
            {readingHistory.length} ta
          </div>
          <span className="text-[11px] text-stone-400 block">Joriy oydagi mutolaa</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">O‘qish vaqti</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono">
            {user.stats.readingHours} soat
          </div>
          <span className="text-[11px] text-stone-400 block">Kutubxona faolligi</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Sevimli kitoblar</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono">
            {favorites.length} ta
          </div>
          <span className="text-[11px] text-stone-400 block">Saqlangan asarlar</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Audio tinglangan</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono">
            {user.stats.audioListenedHours || 0} soat
          </div>
          <span className="text-[11px] text-stone-400 block">Ovozli kitoblar</span>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="rounded-3xl bg-[#16100B]/90 border border-amber-950/80 p-6 space-y-6 shadow-xl">
        {/* Sub-tabs */}
        <div className="flex border-b border-amber-950 text-xs font-bold gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 transition-colors relative flex items-center gap-2 ${
              activeTab === 'info' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Shaxsiy ma’lumotlar</span>
            {activeTab === 'info' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 transition-colors relative flex items-center gap-2 ${
              activeTab === 'security' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Xavfsizlik & Parol</span>
            {activeTab === 'security' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 transition-colors relative flex items-center gap-2 ${
              activeTab === 'notifications' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Bildirishnomalar</span>
            {activeTab === 'notifications' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            )}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">To‘liq ism</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">Elektron pochta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-[0_0_18px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.02] active:scale-95"
            >
              O‘zgarishlarni saqlash
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">Joriy parol</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">Yangi parol</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-[0_0_18px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.02] active:scale-95"
            >
              Parolni yangilash
            </button>
          </form>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F0A07] border border-amber-900/70">
              <div>
                <span className="text-xs font-bold text-stone-100 block">Yangi kitoblar bildirishnomasi</span>
                <span className="text-[11px] text-stone-400">Yangi PDF va audio asarlar qo‘shilganda xabar berish</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
