import React from 'react';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE, CONTACT_INFO } from '../data/initialData';
import { Calendar, FileText, Phone, Star, MapPin } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setQuoteModalOpen, setBookingModalOpen } = useApp();

  const scrollToLocation = () => {
    const el = document.getElementById('location-hours');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden border-b border-[#E8EEF1]">
      {/* Full-width hero image showing professional exterior pressure washing with semi-transparency */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Professional exterior pressure washing service in Sacramento"
          className="w-full h-full object-cover object-center opacity-85 scale-102"
          referrerPolicy="no-referrer"
        />
        {/* Subtle dark overlay to ensure readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#111A24]/90 via-[#192A38]/75 to-[#111A24]/60 backdrop-blur-[1px]" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white w-full">
        <div className="max-w-2xl space-y-6">
          
          {/* Service badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sacramento &amp; Surrounding Areas</span>
            <span className="text-white/40">·</span>
            <span>8:00 AM – 8:00 PM Daily</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18]">
            Professional Pressure Washing &amp; Window Cleaning
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-normal max-w-xl">
            Clean, reliable exterior cleaning for residential and commercial properties across Greater Sacramento. Request a free quote in just a few clicks.
          </p>

          {/* Action buttons with rounded muted navy blue and white styling */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="btn-rounded px-6 py-3.5 text-sm font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] shadow-lg shadow-black/25 transition-all flex items-center gap-2 cursor-pointer border border-[#3A5B74]"
            >
              <FileText className="w-4 h-4 text-sky-200" />
              <span>Request a Free Quote</span>
            </button>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-rounded px-5 py-3.5 text-sm font-semibold text-[#222222] bg-white hover:bg-[#F8F9F7] shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#263F50]" />
              <span>Book Appointment</span>
            </button>

            <a
              href={`tel:${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`}
              className="btn-rounded px-4 py-3.5 text-sm font-semibold text-white bg-black/30 hover:bg-black/45 border border-white/30 backdrop-blur-md transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-sky-300" />
              <span>{CONTACT_INFO.phone}</span>
            </a>
          </div>

          {/* Trust and Yelp Indicators */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-gray-300 border-t border-white/15">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium text-white">Yelp Verified 5-Star Service</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-gray-200">Residential &amp; Commercial</span>
            </div>
            <button
              onClick={scrollToLocation}
              className="flex items-center gap-1 text-sky-200 hover:text-white transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-300" />
              <span>View Service Map</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
