import React from 'react';
import { useApp } from '../context/AppContext';
import { Droplets, Phone, Mail, Clock, ExternalLink, Calendar, FileText, MapPin } from 'lucide-react';
import { CONTACT_INFO, YELP_PROFILE_URL } from '../data/initialData';

export const Footer: React.FC = () => {
  const { switchToDedicatedView, setQuoteModalOpen, setBookingModalOpen } = useApp();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact-footer" className="bg-[#E8EEF1] border-t border-[#D5E0E6] text-[#555555] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Overview */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/MIS161_logo_6e549ad0.jpg"
                alt="All Year Pressure Washing Official Logo"
                className="h-10 w-auto object-contain max-w-[160px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[#555555] text-xs leading-relaxed">
              Family-owned exterior cleaning service serving homeowners and commercial properties across Greater Sacramento.
            </p>
            <div>
              <a
                href={YELP_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F9F7] border border-[#D5E0E6] text-[#222222] font-semibold transition-colors text-xs shadow-2xs"
              >
                <span className="font-bold text-[#D32323]">Yelp</span>
                <span>Verified 5.0 Rating</span>
                <ExternalLink className="w-3 h-3 text-[#555555]" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#222222] uppercase tracking-wider text-[11px]">Navigation</h4>
            <ul className="space-y-2 text-[#555555] text-xs">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-[#263F50] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about-section')}
                  className="hover:text-[#263F50] transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('services-section')}
                  className="hover:text-[#263F50] transition-colors cursor-pointer"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('location-hours')}
                  className="hover:text-[#263F50] transition-colors cursor-pointer"
                >
                  Contact &amp; Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('reviews-section')}
                  className="hover:text-[#263F50] transition-colors cursor-pointer"
                >
                  Customer Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Phone */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#222222] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#263F50]" />
              <span>Operating Hours</span>
            </h4>
            <div className="space-y-1.5 text-xs text-[#555555]">
              <div className="font-semibold text-[#222222]">Monday – Sunday</div>
              <div>8:00 AM – 8:00 PM</div>
              <div className="text-[11px] text-[#777777]">Open all 7 days of the week</div>
            </div>

            <div className="pt-2">
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`}
                className="font-bold text-sm text-[#263F50] hover:underline flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#263F50]" />
                <span>{CONTACT_INFO.phone}</span>
              </a>
            </div>
          </div>

          {/* Col 4: Contact & Quotes */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#222222] uppercase tracking-wider text-[11px]">Get in Touch</h4>
            <div className="space-y-1.5 text-xs text-[#555555]">
              <a
                href="mailto:Allyearpressurewashing@gmail.com"
                className="hover:text-[#263F50] transition-colors block font-semibold text-[#222222] break-all"
              >
                Allyearpressurewashing@gmail.com
              </a>
              <div className="flex items-center gap-1 text-[#555555]">
                <MapPin className="w-3.5 h-3.5 text-[#263F50] shrink-0" />
                <span>Greater Sacramento area, CA</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="btn-rounded w-full py-2 px-3 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] text-center transition-colors shadow-2xs"
              >
                Request a Free Quote
              </button>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn-rounded w-full py-2 px-3 text-xs font-semibold text-[#263F50] bg-white hover:bg-[#F8F9F7] border border-[#D5E0E6] text-center transition-colors shadow-2xs"
              >
                Book Appointment
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & MIS 161 Portal Switcher */}
        <div className="mt-12 pt-6 border-t border-[#D5E0E6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <div>
            &copy; {new Date().getFullYear()} All Year Pressure Washing. All rights reserved. Sacramento, California.
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-medium text-[#777777]">Portal Access:</span>
            <button
              onClick={() => switchToDedicatedView('client')}
              className="hover:text-[#263F50] underline cursor-pointer"
            >
              Client View
            </button>
            <span>·</span>
            <button
              onClick={() => switchToDedicatedView('technical')}
              className="hover:text-[#263F50] underline cursor-pointer"
            >
              Technical View
            </button>
            <span>·</span>
            <button
              onClick={() => switchToDedicatedView('admin')}
              className="hover:text-[#263F50] underline cursor-pointer"
            >
              Admin View
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
