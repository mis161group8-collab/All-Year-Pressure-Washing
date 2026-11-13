import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CONTACT_INFO, YELP_PROFILE_URL } from '../data/initialData';
import { Phone, Mail, Clock, MapPin, ExternalLink, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';

export const LocationAndHoursSection: React.FC = () => {
  const { setQuoteModalOpen, setBookingModalOpen } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Polygon coordinates matching the user's confirmed Sacramento Yelp service coverage screenshot
  const sacramentoServicePolygon: [number, number][] = [
    [38.8916, -121.2934], // Lincoln
    [38.7905, -121.2358], // Rocklin
    [38.7521, -121.2880], // Roseville
    [38.6780, -121.1761], // Folsom
    [38.6657, -120.9575], // Shingle Springs boundary
    [38.4088, -121.3716], // Elk Grove
    [38.2546, -121.2999], // Galt
    [38.1341, -121.2722], // Lodi
    [38.0000, -121.3100], // North Stockton perimeter
    [38.2494, -122.0405], // Fairfield
    [38.3566, -121.9877], // Vacaville
    [38.4455, -121.8233], // Dixon
    [38.5449, -121.7405], // Davis
    [38.6785, -121.7733], // Woodland
    [38.8916, -121.2934]  // Back to Lincoln
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent double initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [38.5816, -121.4944], // Sacramento, CA
        zoom: 9,
        scrollWheelZoom: true,
        zoomControl: true
      });

      // Standard clean OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      // Subtle, semi-transparent muted-blue overlay (#263F50)
      const serviceAreaOverlay = L.polygon(sacramentoServicePolygon, {
        color: '#263F50',
        weight: 2.5,
        fillColor: '#263F50',
        fillOpacity: 0.28
      }).addTo(map);

      serviceAreaOverlay.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <strong style="color: #263F50; font-size: 14px;">All Year Pressure Washing</strong><br/>
          <span style="font-size: 12px; color: #555555;">Greater Sacramento Service Area</span><br/>
          <span style="font-size: 11px; color: #777777;">Hours: Mon–Sun 8:00 AM – 8:00 PM</span>
        </div>
      `);

      // Sacramento central pin
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: #263F50;
            color: #FFFFFF;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            font-size: 14px;
            font-weight: bold;
          ">
            ★
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const sacramentoMarker = L.marker([38.5816, -121.4944], { icon: customIcon }).addTo(map);
      sacramentoMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 6px;">
          <strong style="color: #263F50; font-size: 14px;">Sacramento, California</strong><br/>
          <span style="font-size: 12px; color: #444444;">Dispatch Hub for Exterior On-Site Cleaning</span><br/>
          <span style="font-size: 11px; color: #263F50; font-weight: 600;">(916) 397-1877</span>
        </div>
      `);

      mapInstanceRef.current = map;

      // Invalidate size after initial render to avoid gray tile glitch
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section id="location-hours" className="py-16 lg:py-24 bg-[#F8F9F7] border-b border-[#E8EEF1] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-[#263F50] uppercase">
            Service Area &amp; Hours
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight mt-1.5">
            Proudly Serving the Sacramento Area
          </h2>
          <p className="mt-2 text-[#555555] text-sm sm:text-base">
            We provide on-site residential and commercial cleaning throughout Sacramento and neighboring cities.
          </p>
        </div>

        {/* Two-Column Layout: Real Interactive Leaflet Map + Business Hours & Confirmed Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: Real Interactive Leaflet Map with #263F50 semi-transparent overlay */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8EEF1] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#263F50]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#222222]">
                      Interactive Coverage Map
                    </h3>
                    <p className="text-xs text-[#555555]">
                      Zoom &amp; pan to explore our verified dispatch territory
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EEF1] text-[#263F50] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#263F50]" />
                  <span>Sacramento Dispatch</span>
                </div>
              </div>

              {/* Real Leaflet Map Container */}
              <div
                ref={mapContainerRef}
                className="w-full h-[400px] sm:h-[450px] rounded-2xl border border-[#E8EEF1] overflow-hidden shadow-inner"
                style={{ zIndex: 10 }}
              />
            </div>

            {/* Map footer note */}
            <div className="mt-4 pt-3 border-t border-[#E8EEF1] flex flex-wrap items-center justify-between gap-2 text-xs text-[#555555]">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-[#263F50]/30 border border-[#263F50]" />
                <span>Coverage includes Sacramento, Elk Grove, Roseville, Folsom, Davis &amp; surrounding areas</span>
              </div>
              <a
                href={YELP_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#263F50] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Yelp Service Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Column: Confirmed Business Hours & Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Confirmed Hours Card */}
            <div className="bg-white rounded-3xl border border-[#E8EEF1] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8EEF1] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#263F50]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#222222]">
                      Confirmed Operating Hours
                    </h3>
                    <span className="text-xs text-[#555555]">7 Days a Week</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  Open Today
                </div>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="font-semibold text-[#222222]">Monday – Sunday</span>
                  <span className="font-bold text-[#263F50]">8:00 AM – 8:00 PM</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed pt-1">
                  We schedule early morning, daytime, and late afternoon service visits 7 days a week to accommodate homeowner and commercial business schedules.
                </p>
              </div>
            </div>

            {/* Confirmed Contact Details Card */}
            <div className="bg-white rounded-3xl border border-[#E8EEF1] p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#222222] border-b border-[#E8EEF1] pb-3">
                Confirmed Contact Details
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8EEF1] text-[#263F50] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#263F50]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#777777]">Phone</div>
                    <a
                      href="tel:9163971877"
                      className="font-bold text-[#263F50] hover:underline"
                    >
                      (916) 397-1877
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8EEF1] text-[#263F50] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#263F50]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#777777]">Email</div>
                    <a
                      href="mailto:Allyearpressurewashing@gmail.com"
                      className="font-bold text-[#263F50] hover:underline break-all"
                    >
                      Allyearpressurewashing@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8EEF1] text-[#263F50] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#263F50]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#777777]">Location &amp; Service Model</div>
                    <div className="font-semibold text-[#222222]">
                      Greater Sacramento area, California
                    </div>
                    <div className="text-[11px] text-[#666666]">
                      100% on-site service · Mobile service truck dispatch
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-[#E8EEF1] flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="btn-rounded flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] text-center transition-colors cursor-pointer"
                >
                  Request a Free Quote
                </button>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="btn-rounded flex-1 py-2.5 px-4 text-xs font-semibold text-[#263F50] bg-[#E8EEF1] hover:bg-[#DCE5EA] text-center transition-colors cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
