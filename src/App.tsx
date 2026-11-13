import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { LocationAndHoursSection } from './components/LocationAndHoursSection';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { CustomerPortal } from './components/CustomerPortal';
import { FieldTechnicianPortal } from './components/FieldTechnicianPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { QuoteRequestModal } from './components/QuoteRequestModal';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import { DialogueDrawer } from './components/DialogueDrawer';
import { MfaModal } from './components/MfaModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F7] text-[#222222]">
      <Navbar />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            {/* 1. Clean, Minimalist Hero */}
            <Hero />

            {/* 2. Services Section: Only Two Main Cards (Pressure Washing & Window Washing) */}
            <ServicesSection />

            {/* 3. About Section: Simple, honest, welcoming */}
            <AboutSection />

            {/* 4. Location & Hours: 2-column layout with interactive Sacramento map & hours schedule */}
            <LocationAndHoursSection />

            {/* 5. Customer Reviews: Real testimonials & Yelp proof */}
            <CustomerReviewsSection />
          </>
        )}

        {activeView === 'services' && (
          <div className="pt-2">
            <ServicesSection />
          </div>
        )}

        {activeView === 'areas' && (
          <div className="pt-2">
            <LocationAndHoursSection />
          </div>
        )}

        {activeView === 'customer_portal' && (
          <div className="bg-[#F8F9F7] min-h-[calc(100vh-140px)] text-[#222222]">
            <CustomerPortal />
          </div>
        )}

        {activeView === 'tech_portal' && (
          <div className="bg-[#F8F9F7] min-h-[calc(100vh-140px)] text-[#222222]">
            <FieldTechnicianPortal />
          </div>
        )}

        {activeView === 'admin_dashboard' && (
          <div className="bg-[#F8F9F7] min-h-[calc(100vh-140px)] text-[#222222]">
            <AdminDashboard />
          </div>
        )}
      </main>

      <Footer />

      {/* Global Modals & Dialogue Drawer */}
      <QuoteRequestModal />
      <AppointmentBookingModal />
      <DialogueDrawer />
      <MfaModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
