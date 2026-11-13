import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

export interface MapLocation {
  id: string;
  name: string;
  county: string;
  x: number; // percentage in base map coordinate space (0 - 100)
  y: number;
  isHub?: boolean;
  inCorePolygon: boolean;
  highway: string;
  distanceMiles: number;
  visitFee: string;
  dispatchTime: string;
  keyServices: string;
}

// Exactly mapped to Yelp's Service Area map from Screenshot 2026-11-01 at 5.57.57 PM.png
export const YELP_MAP_LOCATIONS: MapLocation[] = [
  {
    id: 'sacramento',
    name: 'Sacramento (Central Hub)',
    county: 'Sacramento County',
    x: 52.0,
    y: 45.0,
    isHub: true,
    inCorePolygon: true,
    highway: 'I-80 / I-5 / Hwy 50 / Hwy 99',
    distanceMiles: 0,
    visitFee: '$0 On-Site Assessment (Core Hub)',
    dispatchTime: 'Immediate same-day dispatch',
    keyServices: 'Full residential soft wash, commercial concrete degreasing, eco closed-loop vacuum recovery.'
  },
  {
    id: 'roseville',
    name: 'Roseville',
    county: 'Placer County',
    x: 58.5,
    y: 36.5,
    inCorePolygon: true,
    highway: 'I-80 & Hwy 65',
    distanceMiles: 19,
    visitFee: '$0 Assessment when booking',
    dispatchTime: '20 - 30 mins',
    keyServices: 'Commercial retail flatwork, suburban siding soft washing, HOA curbside pressure washing.'
  },
  {
    id: 'rocklin',
    name: 'Rocklin',
    county: 'Placer County',
    x: 60.5,
    y: 33.5,
    inCorePolygon: true,
    highway: 'I-80 & Hwy 65',
    distanceMiles: 23,
    visitFee: '$0 Assessment when booking',
    dispatchTime: '25 - 35 mins',
    keyServices: 'Quarry stone, driveway oil remediation, 2-story stucco wash.'
  },
  {
    id: 'lincoln',
    name: 'Lincoln',
    county: 'Placer County',
    x: 58.0,
    y: 28.0,
    inCorePolygon: true,
    highway: 'Hwy 65 North',
    distanceMiles: 29,
    visitFee: '$0 Assessment when booking',
    dispatchTime: '30 - 40 mins',
    keyServices: 'Master-planned communities, tile roof cleaning, driveway restoration.'
  },
  {
    id: 'folsom',
    name: 'Folsom',
    county: 'Sacramento County',
    x: 63.5,
    y: 40.5,
    inCorePolygon: true,
    highway: 'Hwy 50 East',
    distanceMiles: 22,
    visitFee: '$0 Assessment when booking',
    dispatchTime: '25 - 35 mins',
    keyServices: 'Lakefront pavers, pool deck moss mitigation, plant-neutralized stucco rinse.'
  },
  {
    id: 'shingle-springs',
    name: 'Shingle Springs',
    county: 'El Dorado County',
    x: 68.5,
    y: 41.5,
    inCorePolygon: true,
    highway: 'Hwy 50 Foothills',
    distanceMiles: 38,
    visitFee: '$0 Assessment when booking (Foothill Zone)',
    dispatchTime: '40 - 50 mins',
    keyServices: 'Foothill cedar restoration, heavy pollen wash, steep roof low-pressure treatment.'
  },
  {
    id: 'elk-grove',
    name: 'Elk Grove',
    county: 'Sacramento County',
    x: 54.5,
    y: 56.5,
    inCorePolygon: true,
    highway: 'Hwy 99 & I-5 South',
    distanceMiles: 15,
    visitFee: '$0 On-Site Assessment (Core Zone)',
    dispatchTime: '15 - 25 mins',
    keyServices: 'Aggregate driveway oil extraction, vinyl siding wash, backyard pool surround.'
  },
  {
    id: 'galt',
    name: 'Galt',
    county: 'Sacramento County',
    x: 57.0,
    y: 64.5,
    inCorePolygon: true,
    highway: 'Hwy 99 South',
    distanceMiles: 26,
    visitFee: '$0 Assessment when booking',
    dispatchTime: '30 - 40 mins',
    keyServices: 'Agricultural property flatwork, perimeter fence wash, gutter cleaning.'
  },
  {
    id: 'lodi',
    name: 'Lodi',
    county: 'San Joaquin County',
    x: 58.0,
    y: 70.5,
    inCorePolygon: true,
    highway: 'Hwy 99 & Hwy 12',
    distanceMiles: 36,
    visitFee: '$0 Assessment when booking',
    dispatchTime: '35 - 45 mins',
    keyServices: 'Winery patio pavers, exterior siding mold wash, commercial parking spaces.'
  },
  {
    id: 'stockton',
    name: 'Stockton (Border Area)',
    county: 'San Joaquin County',
    x: 57.5,
    y: 80.0,
    inCorePolygon: false,
    highway: 'I-5 & Hwy 99',
    distanceMiles: 48,
    visitFee: '$45 Trip Fee (100% Credited Toward Service)',
    dispatchTime: 'Scheduled Appointment',
    keyServices: 'Industrial surface washing, warehouse pads, environmental vacuum reclaim.'
  },
  {
    id: 'fairfield',
    name: 'Fairfield',
    county: 'Solano County',
    x: 37.0,
    y: 64.5,
    inCorePolygon: true,
    highway: 'I-80 West & I-680',
    distanceMiles: 42,
    visitFee: '$0 Assessment when booking (Yelp Service Zone)',
    dispatchTime: '40 - 50 mins',
    keyServices: 'Coastal breeze salt & mildew siding wash, commercial pads, driveways.'
  },
  {
    id: 'vacaville',
    name: 'Vacaville',
    county: 'Solano County',
    x: 39.5,
    y: 58.5,
    inCorePolygon: true,
    highway: 'I-80 & I-505',
    distanceMiles: 34,
    visitFee: '$0 Assessment when booking (Yelp Service Zone)',
    dispatchTime: '35 - 45 mins',
    keyServices: 'Rotary driveway cleaning, commercial storefronts, stucco soft wash.'
  },
  {
    id: 'dixon',
    name: 'Dixon',
    county: 'Solano County',
    x: 43.5,
    y: 54.5,
    inCorePolygon: true,
    highway: 'I-80 Corridor',
    distanceMiles: 23,
    visitFee: '$0 Assessment when booking (Yelp Service Zone)',
    dispatchTime: '25 - 35 mins',
    keyServices: 'Concrete patio restoration, agricultural driveways, rust removal.'
  },
  {
    id: 'davis',
    name: 'Davis',
    county: 'Yolo County',
    x: 46.0,
    y: 48.5,
    inCorePolygon: true,
    highway: 'I-80 West & Hwy 113',
    distanceMiles: 15,
    visitFee: '$0 On-Site Assessment (Core Zone)',
    dispatchTime: '20 - 30 mins',
    keyServices: 'Eco plant-neutralized washing for sensitive gardens, bike path flatwork, historic siding.'
  },
  {
    id: 'woodland',
    name: 'Woodland',
    county: 'Yolo County',
    x: 45.0,
    y: 42.5,
    inCorePolygon: true,
    highway: 'I-5 & Hwy 113',
    distanceMiles: 20,
    visitFee: '$0 On-Site Assessment (Core Zone)',
    dispatchTime: '25 - 35 mins',
    keyServices: 'Historic downtown masonry, dust & pollen siding cleaning, concrete driveways.'
  }
];

export const SacramentoMapSection: React.FC = () => {
  const { sacramentoLocation, visitFeePolicy, yelpProfileUrl, setQuoteModalOpen } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(YELP_MAP_LOCATIONS[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapLayer, setMapLayer] = useState<'yelp-service' | 'highways' | 'zones'>('yelp-service');
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom helpers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 2.8));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.35).toFixed(2)), 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedLocation(YELP_MAP_LOCATIONS[0]);
  };

  // Center on a specific location
  const handleSelectLocation = (loc: MapLocation) => {
    setSelectedLocation(loc);
    if (zoomLevel > 1) {
      // Pan toward the location so it stays in view
      const targetPanX = (50 - loc.x) * (zoomLevel - 1) * 3;
      const targetPanY = (50 - loc.y) * (zoomLevel - 1) * 3;
      setPanOffset({
        x: Math.max(-150, Math.min(150, targetPanX)),
        y: Math.max(-120, Math.min(120, targetPanY))
      });
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Bound the pan
    const maxPan = 140 * (zoomLevel - 0.8);
    setPanOffset({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section id="sacramento-coverage" className="py-16 bg-[#080e16] border-b border-[#182638] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Badge & Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Yelp Verified Service Area & Operations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Based in Sacramento, CA
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Explore our verified Yelp coverage polygon. Operating 7 days a week from our central Sacramento dispatch hub with rapid response across Sacramento, Yolo, Solano, Placer, and El Dorado Counties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hours Banner */}
            <div className="px-4 py-2.5 rounded-2xl bg-[#0f1b29] border border-[#1c3048] flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Operating Hours</div>
                <div className="font-extrabold text-white">8:00 AM – 8:00 PM · All Days</div>
              </div>
            </div>

            <a
              href={yelpProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-rounded px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="font-black">yelp</span>
              <span>Coverage Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Visit Fee & Direct Price Policy Strip */}
        <div className="bg-gradient-to-r from-[#0d2033] via-[#0f2842] to-[#0c1c2e] text-white rounded-3xl p-5 mb-8 border border-[#1b3b5f] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <span>Transparent Sacramento Pricing Guarantee</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span className="text-slate-300">Open 8:00am – 8:00pm Daily</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                $0 On-Site Assessment in Sacramento Core Zone (&lt; 20 Miles)
              </div>
              <div className="text-xs text-slate-300">
                Any extended outer zone trip fee is <span className="text-sky-300 font-bold underline">100% credited</span> toward your invoice upon booking. No surprise dispatch fees.
              </div>
            </div>
          </div>

          <button
            onClick={() => setQuoteModalOpen(true)}
            className="btn-rounded px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            Get a quote access
          </button>
        </div>

        {/* Interactive Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Zoomable Map Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-[#0b1420] rounded-3xl p-5 sm:p-6 border border-[#18283a] shadow-2xl relative">
            
            {/* Map Top Bar with Zoom & Layer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Interactive Service Area Map (Yelp Polygon)
                </span>
              </div>

              {/* Zoom Buttons directly on map as requested */}
              <div className="flex items-center gap-1.5 bg-[#122133] p-1 rounded-xl border border-[#1e3a5a]">
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.8}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:text-white hover:bg-sky-500/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Zoom In (+)"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="px-2 text-xs font-mono font-bold text-sky-300 select-none">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:text-white hover:bg-sky-500/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <Minus className="w-4 h-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 active:scale-95 transition-all cursor-pointer ml-1"
                    title="Reset Zoom to 100%"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Viewport Frame */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative w-full aspect-[4/3] bg-[#070d14] rounded-2xl overflow-hidden border border-[#16273b] shadow-inner select-none ${
                zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
            >
              {/* Scalable & Pannable Container */}
              <div
                className="absolute inset-0 w-full h-full origin-center transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`
                }}
              >
                {/* Background Terrain & River Contours */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Subtle Grid Lines */}
                  <defs>
                    <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#101e2e" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid-pattern)" />

                  {/* Sacramento River flow (from Woodland/North down through Sacramento into Delta/Suisun) */}
                  <path
                    d="M 44,15 Q 43,30 46,38 T 50,46 T 49,58 T 43,72 T 35,85 T 28,95"
                    fill="none"
                    stroke="#1e446d"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* American River (from Folsom/Foothills into Discovery Park in Sacramento) */}
                  <path
                    d="M 72,38 Q 66,40 60,42 T 51,46"
                    fill="none"
                    stroke="#1e446d"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Major Highway Systems matching the screenshot */}
                  {/* Interstate 80: Fairfield -> Vacaville -> Dixon -> Davis -> Sacramento -> Roseville -> Rocklin */}
                  <path
                    d="M 32,70 L 37,64.5 L 40,58.5 L 43.5,54.5 L 46,48.5 L 52,45 L 58.5,36.5 L 61,33.5 L 68,26"
                    fill="none"
                    stroke="#2a3f5a"
                    strokeWidth="1.2"
                  />
                  {/* Interstate 5: Stockton -> Lodi -> Elk Grove -> Sacramento -> Woodland */}
                  <path
                    d="M 57.5,85 L 56.5,75 L 53.5,60 L 52,45 L 45.5,42.5 L 44,20"
                    fill="none"
                    stroke="#2a3f5a"
                    strokeWidth="1.2"
                  />
                  {/* Highway 50: Sacramento -> Folsom -> Shingle Springs -> Placerville */}
                  <path
                    d="M 52,45 L 59,43 L 63.5,40.5 L 68.5,41.5 L 78,41"
                    fill="none"
                    stroke="#2a3f5a"
                    strokeWidth="1.0"
                    strokeDasharray="2,1"
                  />
                  {/* Highway 99: Stockton -> Lodi -> Galt -> Elk Grove -> Sacramento */}
                  <path
                    d="M 58,85 L 58,70.5 L 57,64.5 L 54.5,56.5 L 52,45"
                    fill="none"
                    stroke="#2a3f5a"
                    strokeWidth="1.0"
                  />

                  {/* THE EXACT YELP SERVICE AREA POLYGON from Screenshot 2026-11-01 at 5.57.57 PM.png */}
                  {/* Vertices:
                      1. North: Lincoln / Rocklin area (58.5, 27)
                      2. East: Shingle Springs / Foothills (69, 41)
                      3. South-East: Lodi / Galt boundary (59, 72)
                      4. South-West: Fairfield / Solano (35, 68)
                      5. West: Vacaville (38, 57)
                      6. Mid-West: Dixon (42, 53)
                      7. North-West: Woodland (44, 40)
                  */}
                  <polygon
                    points="58.5,27 69,41 59,72 35,68 38,57 42,53 44,40"
                    fill="rgba(56, 189, 248, 0.16)"
                    stroke="#38bdf8"
                    strokeWidth="1.6"
                    strokeDasharray="4,2"
                    className="filter drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                  />

                  {/* Core 20-Mile Radius Circle from Sacramento */}
                  <circle
                    cx="52"
                    cy="45"
                    r="16"
                    fill="rgba(14, 165, 233, 0.05)"
                    stroke="#0284c7"
                    strokeWidth="0.8"
                    strokeDasharray="1,1"
                  />
                </svg>

                {/* Highway Badges on map */}
                <div className="absolute top-[43%] left-[48%] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-70">
                  <span className="px-1 py-0.5 rounded bg-blue-900/80 border border-blue-400 text-[8px] font-bold text-white">
                    I-80
                  </span>
                </div>
                <div className="absolute top-[51%] left-[54%] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-70">
                  <span className="px-1 py-0.5 rounded bg-blue-900/80 border border-blue-400 text-[8px] font-bold text-white">
                    I-5
                  </span>
                </div>
                <div className="absolute top-[41%] left-[62%] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-70">
                  <span className="px-1 py-0.5 rounded bg-blue-900/80 border border-blue-400 text-[8px] font-bold text-white">
                    US-50
                  </span>
                </div>

                {/* Location Markers */}
                {YELP_MAP_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation.id === loc.id;
                  const isHub = loc.isHub;

                  return (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none cursor-pointer"
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      title={`${loc.name} - ${loc.visitFee}`}
                    >
                      {/* Hub pulsing ring */}
                      {isHub && (
                        <div className="absolute inset-0 -m-2 rounded-full bg-sky-400/30 animate-ping pointer-events-none" />
                      )}

                      <div
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-lg ${
                          isSelected
                            ? 'bg-sky-400 text-slate-950 ring-2 ring-white scale-125 z-30'
                            : isHub
                            ? 'bg-sky-500 text-slate-950 font-black ring-1 ring-sky-300'
                            : loc.inCorePolygon
                            ? 'bg-[#102030]/90 text-sky-200 border border-[#234262] hover:bg-sky-900 hover:text-white'
                            : 'bg-[#1c1822]/90 text-amber-200 border border-amber-900/60 hover:bg-amber-900'
                        }`}
                      >
                        <MapPin className={`w-2.5 h-2.5 ${isSelected ? 'text-slate-950' : isHub ? 'text-slate-950' : 'text-sky-400'}`} />
                        <span>{loc.name.split('(')[0].trim()}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Map Bottom-Left Overlay Legend */}
                <div className="absolute bottom-3 left-3 bg-[#08121d]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#192d42] text-[10px] text-slate-300 space-y-1.5 pointer-events-none shadow-xl">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
                    <span>Sacramento Central Hub</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3.5 h-2 rounded border border-dashed border-sky-400 bg-sky-500/20 inline-block"></span>
                    <span>Yelp Guaranteed Service Polygon</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full border border-sky-400 inline-block"></span>
                    <span>$0 On-Site Assessment Core</span>
                  </div>
                </div>

                {/* Drag hint when zoomed */}
                {zoomLevel > 1 && (
                  <div className="absolute top-3 left-3 bg-[#0c1826]/80 px-2 py-1 rounded-md text-[10px] text-slate-400 pointer-events-none flex items-center gap-1">
                    <Layers className="w-3 h-3 text-sky-400" />
                    <span>Click and drag to pan map</span>
                  </div>
                )}
              </div>
            </div>

            {/* City Selector Quick Pills */}
            <div className="mt-4">
              <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Direct Location Select ({YELP_MAP_LOCATIONS.length} Areas)</span>
                <span className="text-sky-400 text-[10px]">Click any city to view specs</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {YELP_MAP_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className={`btn-rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-[#101c2a] text-slate-300 hover:bg-[#182a3e] hover:text-white border border-[#1a2d42]'
                      }`}
                    >
                      {loc.name.split('(')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Active Zone Details & Direct Price Access (5 cols) */}
          <div className="lg:col-span-5 bg-[#0b1420] rounded-3xl p-6 border border-[#18283a] shadow-2xl space-y-5">
            
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#18283a]">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-sky-400" />
                  <span>{selectedLocation.inCorePolygon ? 'Inside Yelp Service Polygon' : 'Extended Service Area'}</span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1.5">{selectedLocation.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{selectedLocation.county}</span>
                  <span>•</span>
                  <span>Transit via {selectedLocation.highway}</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-2xl bg-[#122133] border border-[#1e3a5a] text-sky-300 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Distance</span>
                <span className="text-sm font-black text-white">{selectedLocation.distanceMiles} mi</span>
              </div>
            </div>

            {/* Visit Fee & Dispatch Time Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0f1b29] border border-[#1a2e44]">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visit Fee Policy</div>
                <div className="text-sm font-black text-sky-300 mt-1">{selectedLocation.visitFee}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f1b29] border border-[#1a2e44]">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Typical Dispatch</div>
                <div className="text-sm font-black text-white mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{selectedLocation.dispatchTime}</span>
                </div>
              </div>
            </div>

            {/* Regional Washing Requirements & Focus */}
            <div className="p-4 rounded-2xl bg-[#0e1926] border border-[#182c42] text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Primary Services & Environmental SOP:</span>
              </div>
              <p className="leading-relaxed text-slate-300">{selectedLocation.keyServices}</p>
            </div>

            {/* Business Hours Note */}
            <div className="p-3.5 rounded-2xl bg-[#0a121d] border border-[#16273b] text-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-slate-300">
                <div className="font-bold text-white">Daily Operating Hours</div>
                <div className="text-[11px] text-slate-400">8:00am – 8:00pm all days of the week (Monday through Sunday)</div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="w-full btn-rounded py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get a quote access</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${sacramentoLocation.phone.replace(/[^\d]/g, '')}`}
                  className="btn-rounded py-2.5 bg-[#122133] hover:bg-[#182b42] text-slate-200 hover:text-white font-bold text-xs border border-[#1e3a5a] transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>(916) 397-1877</span>
                </a>

                <a
                  href={yelpProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rounded py-2.5 bg-[#161a22] hover:bg-[#202532] text-rose-400 hover:text-rose-300 font-bold text-xs border border-rose-900/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span className="font-black text-rose-500">yelp</span>
                  <span>View Reviews</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
