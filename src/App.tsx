import React from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { PdfReader } from './components/reader/PdfReader';
import { AudioPlayer } from './components/audio/AudioPlayer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModal } from './components/auth/AuthModal';
import { AnimatedAtmosphere } from './components/common/AnimatedAtmosphere';

// Pages
import { HomePage } from './pages/HomePage';
import { AllBooksPage } from './pages/AllBooksPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailsPage } from './pages/CategoryDetailsPage';
import { AudioBooksPage } from './pages/AudioBooksPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AboutPage } from './pages/AboutPage';

const MainLayout: React.FC = () => {
  const { activePage, activeReadingBook } = useLibrary();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'books':
        return <AllBooksPage />;
      case 'book-details':
        return <BookDetailsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'category-details':
        return <CategoryDetailsPage />;
      case 'audio':
        return <AudioBooksPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminDashboard />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A08] text-stone-100 flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-white relative">
      {/* Animated Atmosphere Background (Ambient luxury orbs & floating motes, completely disabled during book reading) */}
      {!activeReadingBook && <AnimatedAtmosphere />}

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Auth Modal (Login / Register) */}
      <AuthModal />

      {/* Online PDF Reader View (Full Screen overlay when active) */}
      {activeReadingBook && <PdfReader />}

      {/* App Structure: Left Sidebar + Main Content Stream */}
      <div className="flex-1 flex min-h-screen">
        {/* Left Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          onCloseMobile={() => setIsMobileSidebarOpen(false)} 
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-24 lg:pb-16 lg:pl-[260px]">
          {/* Header */}
          <Header onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* Active Page View */}
          <main className="flex-1">
            {renderActivePage()}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Bottom Sticky Mini Audio Player */}
      <AudioPlayer />

      {/* Mobile Bottom Navigation Bar (Visible on phone/tablet screens) */}
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <MainLayout />
    </LibraryProvider>
  );
}
