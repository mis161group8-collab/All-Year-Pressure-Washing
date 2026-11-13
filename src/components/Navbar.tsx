import React, { useState } from 'react';
import { useApp, AppViewMode } from '../context/AppContext';
import {
  Menu,
  X,
  Calendar,
  MessageSquare,
  Phone,
  LogOut
} from 'lucide-react';
import { CONTACT_INFO } from '../data/initialData';

export const Navbar: React.FC = () => {
  const {
    firebaseUser,
    signOutUser,
    currentRole,
    activeView,
    setActiveView,
    switchToDedicatedView,
    setQuoteModalOpen,
    setBookingModalOpen,
    dialogueDrawerOpen,
    setDialogueDrawerOpen,
    dialogueMessages,
    adminNotifications
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadNotifs = adminNotifications ? adminNotifications.filter((n) => !n.read).length : 0;

  const handleNavClick = (view: AppViewMode) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    setActiveView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EEF1] text-[#222222] transition-colors shadow-xs">
      {/* Top Info & Portal Bar */}
      <div className="bg-[#F8F9F7] text-[#555555] text-xs py-1.5 px-4 sm:px-6 border-b border-[#E8EEF1]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#263F50]"></span>
            <span className="text-[#222222] font-semibold">Greater Sacramento</span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:inline">Mon–Sun 8:00 AM – 8:00 PM</span>
            <span className="hidden md:inline text-gray-300">·</span>
            <a href="tel:9163971877" className="hidden md:inline font-bold text-[#263F50] hover:underline">
              {CONTACT_INFO.phone}
            </a>
          </div>

          {/* Portal Switcher & Auth Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">
              Portals:
            </span>
            <div className="flex items-center bg-[#E8EEF1] p-0.5 rounded-full border border-gray-200">
              <button
                onClick={() => switchToDedicatedView('client')}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  currentRole === 'customer' && activeView === 'customer_portal'
                    ? 'bg-[#263F50] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#222222]'
                }`}
                title="Customer Portal"
              >
                Client
              </button>
              <button
                onClick={() => switchToDedicatedView('technical')}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  currentRole === 'technician' && activeView === 'tech_portal'
                    ? 'bg-[#263F50] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#222222]'
                }`}
                title="Field Technician route view"
              >
                Technical
              </button>
              <button
                onClick={() => switchToDedicatedView('admin')}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeView === 'admin_dashboard'
                    ? 'bg-[#263F50] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#222222]'
                }`}
                title="Admin Management console"
              >
                <span>Admin</span>
                {unreadNotifs > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                )}
              </button>
            </div>

            {firebaseUser && (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#D5E0E6] bg-white hover:bg-[#E8EEF1] text-[10px] font-semibold text-[#263F50] cursor-pointer"
                title={`Signed in as ${firebaseUser.email} — Click to sign out`}
              >
                <LogOut className="w-2.5 h-2.5" />
                <span>Sign Out</span>
              </button>
            )}

            {/* Transcripts drawer button */}
            <button
              onClick={() => setDialogueDrawerOpen(!dialogueDrawerOpen)}
              className="p-1 rounded-full text-[#555555] hover:text-[#263F50] hover:bg-[#E8EEF1] transition-colors relative cursor-pointer"
              title="View saved dialogue transcripts"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {dialogueMessages.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#263F50]"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Official Business Logo & Name */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group shrink-0 focus:outline-none cursor-pointer"
          >
            <img
              src="/assets/aistudio/MIS161_logo_6e549ad0.jpg"
              alt="All Year Pressure Washing Official Logo"
              className="h-12 sm:h-14 w-auto object-contain max-w-[200px] sm:max-w-[240px] transition-transform duration-200 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight text-[#222222] block leading-tight">
                All Year <span className="text-[#263F50] font-semibold">Pressure Washing</span>
              </span>
              <span className="text-[11px] text-[#555555] font-medium">
                Sacramento, California
              </span>
            </div>
          </button>

          {/* Center: Home, About Us, Services, Contact */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#555555]">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-[#263F50] transition-colors cursor-pointer ${
                activeView === 'home' ? 'text-[#263F50] font-bold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleScrollToSection('about-section')}
              className="hover:text-[#263F50] transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => handleScrollToSection('services-section')}
              className="hover:text-[#263F50] transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => handleScrollToSection('location-hours')}
              className="hover:text-[#263F50] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right: Rounded Muted Navy-Blue Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-rounded px-4 py-2.5 text-xs font-semibold text-[#263F50] bg-[#E8EEF1] hover:bg-[#DCE5EA] border border-[#D5E0E6] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#263F50]" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => setQuoteModalOpen(true)}
              className="btn-rounded px-5 py-2.5 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Request a Free Quote</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="sm:hidden btn-rounded px-3 py-1.5 text-xs font-semibold text-white bg-[#263F50]"
            >
              Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#222222] hover:bg-[#E8EEF1] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8EEF1] bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[#222222]">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F8F9F7] text-[#222222] font-semibold"
            >
              Home
            </button>
            <button
              onClick={() => handleScrollToSection('about-section')}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F8F9F7] text-[#555555]"
            >
              About Us
            </button>
            <button
              onClick={() => handleScrollToSection('services-section')}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F8F9F7] text-[#555555]"
            >
              Services
            </button>
            <button
              onClick={() => handleScrollToSection('location-hours')}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F8F9F7] text-[#555555]"
            >
              Contact
            </button>
            <button
              onClick={() => handleScrollToSection('reviews-section')}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F8F9F7] text-[#555555]"
            >
              Customer Reviews
            </button>
          </div>

          <div className="pt-3 border-t border-[#E8EEF1] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setQuoteModalOpen(true);
              }}
              className="btn-rounded w-full py-2.5 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] text-center"
            >
              Request a Free Quote
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setBookingModalOpen(true);
              }}
              className="btn-rounded w-full py-2.5 text-xs font-semibold text-[#263F50] bg-[#E8EEF1] hover:bg-[#DCE5EA] text-center"
            >
              Book Appointment
            </button>
            <a
              href="tel:9163971877"
              className="btn-rounded w-full py-2 text-xs font-semibold text-[#555555] bg-[#F8F9F7] border border-[#E8EEF1] text-center flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#263F50]" />
              <span>Call (916) 397-1877</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
