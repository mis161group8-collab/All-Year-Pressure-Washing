import {
  ServiceItem,
  UserProfile,
  FieldTechnician,
  QuoteRequest,
  Appointment,
  BlockedSlot,
  PaymentRecord,
  ServiceArea,
  CustomerReview,
  CleaningSupply,
  DialogueMessage,
  AdminNotification
} from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_pressure_washing_1791508392680.jpg';
export const SIDING_IMAGE = '/src/assets/images/service_house_siding_1791508403037.jpg';
export const PATIO_IMAGE = '/src/assets/images/service_patio_driveway_1791508411471.jpg';
export const BEFORE_AFTER_IMAGE = '/src/assets/images/before_after_cleaning_1791509615681.jpg';

// Professional Category Photographs (No icons/symbols)
export const DRIVEWAY_CATEGORY_IMAGE = '/src/assets/images/driveway_cleaning_1793748397503.jpg';
export const HOUSE_CATEGORY_IMAGE = '/src/assets/images/house_siding_wash_1793748410192.jpg';
export const WINDOWS_CATEGORY_IMAGE = '/src/assets/images/windows_solar_wash_1793748423354.jpg';
export const COMMERCIAL_CATEGORY_IMAGE = '/src/assets/images/commercial_equipment_wash_1793748435694.jpg';

export const OFFICIAL_LOGO = '/assets/aistudio/MIS161_logo_6e549ad0.jpg';
export const OFFICIAL_BEFORE_AFTER = '/assets/aistudio/MIS161_before_after_88aff7c1.jpg';
export const SOLAR_BEFORE_OFFICIAL = '/assets/aistudio/solar_before_official.jpg';
export const SOLAR_AFTER_OFFICIAL = '/assets/aistudio/solar_after_official.jpg';

// Yelp Before & After Project Pairs
export interface BeforeAfterProject {
  id: string;
  title: string;
  location: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export const BEFORE_AFTER_PROJECTS: BeforeAfterProject[] = [
  {
    id: 'solar-project',
    title: 'Rooftop Solar Array Deep Clean & Wash',
    location: 'Sacramento, CA',
    description: 'Deionized pure water washing removing baked-on dust, vehicle emissions, and bird droppings to restore peak photovoltaic output.',
    beforeImage: '/assets/aistudio/solar_before_official.jpg',
    afterImage: '/assets/aistudio/solar_after_official.jpg'
  },
  {
    id: 'patio-project',
    title: 'Backyard Paver Patio & Moss Eradication',
    location: 'Midtown Sacramento, CA',
    description: 'Years of shaded dampness, heavy joint moss, and dark algae removed without disturbing stone foundation.',
    beforeImage: '/src/assets/images/patio_before_1793748448730.jpg',
    afterImage: '/src/assets/images/patio_after_1793748461715.jpg'
  },
  {
    id: 'driveway-project',
    title: 'Residential Concrete Driveway & Oil Lift',
    location: 'Elk Grove, CA',
    description: 'Hot water rotary extraction removing embedded motor oil spots, tire tread marks, and sidewalk mildew.',
    beforeImage: '/src/assets/images/driveway_before_1793748475054.jpg',
    afterImage: '/src/assets/images/driveway_after_1793748488507.jpg'
  },
  {
    id: 'siding-project',
    title: 'Two-Story Home Siding & Wood Fence Revival',
    location: 'Folsom, CA',
    description: 'Low-pressure soft washing removing northern wall mildew and restoring natural cedar fence tone.',
    beforeImage: '/src/assets/images/siding_before_1793748504141.jpg',
    afterImage: '/src/assets/images/siding_after_1793748517294.jpg'
  }
];

export const YELP_PROFILE_URL = 'https://www.yelp.com/biz/all-year-pressure-washing-sacramento';

export const SACRAMENTO_LOCATION = {
  address: 'Sacramento Area',
  city: 'Sacramento',
  state: 'CA',
  zip: '95811',
  neighborhood: 'Sacramento & Surrounding Areas',
  fullAddress: 'Sacramento, CA',
  lat: 38.5816,
  lng: -121.4944,
  dispatchRadiusMiles: 35,
  phone: '(916) 397-1877',
  email: 'Allyearpressurewashing@gmail.com',
  yelpUrl: YELP_PROFILE_URL
};

export const VISIT_FEE_POLICY = {
  coreFee: 0,
  coreRadiusMiles: 35,
  extendedFee: 0,
  policyDescription: 'We offer free quotes for all pressure-washing projects, including on-site assessments. Contact us to discuss your cleaning needs and receive a personalized estimate.'
};

export const PRICING_POLICY = {
  minimumServicePrice: 250,
  summary: 'Our pressure-washing services start at $250. Pricing varies depending on the type of service and the specific needs of your property. All quotes are all-inclusive, covering fuel, travel expenses, and applicable taxes, so you know the quoted price before work begins.',
  freeEstimates: true,
  isAllInclusive: true
};

export const CLEANING_PRACTICES = {
  question: 'What cleaning products do you use?',
  answer: 'Depending on the condition of your property, some cleaning projects require only water. For surfaces with heavier buildup, we may use diluted outdoor bleach when necessary. We take precautions to protect surrounding plants and grass and help prevent cleaning chemicals from entering storm drains.',
  plantProtection: 'Nearby plants and grass are watered before and after chemical applications to reduce potential damage.',
  stormDrainProtection: 'Precautions are taken to keep chemical runoff out of storm drains.'
};

export interface ServiceDetailItem {
  id: string;
  name: string;
  shortDescription: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  shortDescription: string;
  image: string;
  subcategories: string[];
  detailedItems: ServiceDetailItem[];
}

export const MAIN_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'driveways-outdoor',
    name: 'Driveways & Outdoor Surfaces',
    shortDescription: 'Deep concrete and hardscape washing for driveways, patios, and walkways.',
    image: DRIVEWAY_CATEGORY_IMAGE,
    subcategories: [
      'Driveway Cleaning',
      'Sidewalk Cleaning',
      'Walkway Cleaning',
      'Patio Cleaning',
      'Garage Cleaning'
    ],
    detailedItems: [
      { id: 'driveway', name: 'Driveway Cleaning', shortDescription: 'Rotary cleaning to remove oil spots, tire tread marks, and road grime.' },
      { id: 'sidewalk', name: 'Sidewalk Cleaning', shortDescription: 'High-flow wash to restore safe, non-slip pedestrian curb appeal.' },
      { id: 'walkway', name: 'Walkway Cleaning', shortDescription: 'Detailed stone, brick, and concrete path revitalization.' },
      { id: 'patio', name: 'Patio Cleaning', shortDescription: 'Gentle yet thorough cleaning for pavers, flagstone, and concrete slabs.' },
      { id: 'garage', name: 'Garage Cleaning', shortDescription: 'Interior garage floor degreasing and dust washdown.' }
    ]
  },
  {
    id: 'house-building',
    name: 'House & Building Exteriors',
    shortDescription: 'Gentle low-pressure washing for siding, fences, decks, and gutters.',
    image: HOUSE_CATEGORY_IMAGE,
    subcategories: [
      'Siding Cleaning',
      'Building Exterior Cleaning',
      'Awning Cleaning',
      'Fence Cleaning',
      'Deck Cleaning',
      'Gutter Cleaning'
    ],
    detailedItems: [
      { id: 'siding', name: 'Siding Cleaning', shortDescription: 'Safe soft-wash to melt away mold, algae, and river dust without paint damage.' },
      { id: 'building', name: 'Building Exterior Cleaning', shortDescription: 'Full architectural facade washing for residential and multi-unit buildings.' },
      { id: 'awning', name: 'Awning Cleaning', shortDescription: 'Gentle fabric and vinyl canopy brightening.' },
      { id: 'fence', name: 'Fence Cleaning', shortDescription: 'Wood and vinyl fence restoration removing gray weathering and mildew.' },
      { id: 'deck', name: 'Deck Cleaning', shortDescription: 'Careful cleaning of composite and natural cedar decking.' },
      { id: 'gutter', name: 'Gutter Cleaning', shortDescription: 'Clearing downspouts and exterior gutter face brightening.' }
    ]
  },
  {
    id: 'windows-solar',
    name: 'Windows & Solar Panels',
    shortDescription: 'Streak-free window cleaning and energy-maximizing solar panel washes.',
    image: WINDOWS_CATEGORY_IMAGE,
    subcategories: [
      'Window Cleaning',
      'Window Pressure Washing',
      'Solar Panel Cleaning'
    ],
    detailedItems: [
      { id: 'window-clean', name: 'Window Cleaning', shortDescription: 'Streak-free glass washing for residential and commercial windows.' },
      { id: 'window-pw', name: 'Window Pressure Washing', shortDescription: 'Precision low-pressure frame and sill cleaning.' },
      { id: 'solar-clean', name: 'Solar Panel Cleaning', shortDescription: 'Pure-water wash to remove dust and optimize solar energy output.' }
    ]
  },
  {
    id: 'commercial-equipment',
    name: 'Commercial & Equipment Cleaning',
    shortDescription: 'Heavy-duty washing for commercial properties and industrial machinery.',
    image: COMMERCIAL_CATEGORY_IMAGE,
    subcategories: [
      'Heavy Equipment Cleaning',
      'Commercial Exterior Cleaning'
    ],
    detailedItems: [
      { id: 'heavy-equipment', name: 'Heavy Equipment Cleaning', shortDescription: 'Degreasing and mud removal for machinery and fleet vehicles.' },
      { id: 'commercial-exterior', name: 'Commercial Exterior Cleaning', shortDescription: 'Storefront, dumpster pad, and commercial entryway maintenance.' }
    ]
  }
];

export const REMOVAL_NEEDS_OPTIONS = [
  'Dirt or Grime',
  'Mold or Algae',
  'Oil or Grease',
  'Stains',
  'Not Sure',
  'Other'
];

export const TIMING_OPTIONS = [
  { id: 'asap', label: 'As Soon As Possible', description: 'Priority dispatch when available' },
  { id: 'flexible', label: "I'm Flexible", description: 'Anytime in the upcoming schedule' },
  { id: 'specific_date', label: 'Specific Date', description: 'Request a preferred service date' }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'environmental-remediation',
    name: 'Environmental Pollutant & Runoff Remediation',
    tagline: 'EPA Closed-Loop Berm Containment & California Clean Water Act Compliance',
    description: 'We capture contaminated wash water using vacuum dams to stop motor oil and heavy runoff from entering Sacramento river basins.',
    includes: [
      'Weighted berms blocking storm drains & gutter inlets',
      'Industrial citrus degreaser to dissolve grease & fuel',
      'Continuous closed-loop vacuum recovery (zero street runoff)',
      'Sacramento County eco disposal manifest'
    ],
    durationMinutes: 180,
    basePrice: 420,
    pricePerSqFt: 0.28,
    idealFor: 'Gas stations, automotive bays, dumpster pads, grease spills',
    image: HERO_IMAGE,
    recommendedFrequency: 'Monthly or on-demand',
    isEnvironmentalService: true
  },
  {
    id: 'house-wash',
    name: 'Whole House Soft Washing',
    tagline: 'Safe, low-pressure siding treatment that melts algae, mildew & river pollen',
    description: 'Our proprietary biodegradable detergent blend breaks down mold, mildew, river delta pollen, and spider webs without damaging stucco, HardiePlank, vinyl, or delicate exterior paint.',
    includes: [
      'Gentle low-pressure chemical foam wash (<150 PSI nozzle output)',
      'Pre-wetting & botanical plant neutralizer spray on delicate landscape',
      'Full exterior window frame, fascia, and soffit rinse',
      '100% biodegradable formula safe for Sacramento Delta pollinators'
    ],
    durationMinutes: 120,
    basePrice: 280,
    pricePerSqFt: 0.18,
    idealFor: 'Annual home curb appeal, stucco mildew, siding restoration',
    image: SIDING_IMAGE,
    recommendedFrequency: 'Once every 12 months'
  },
  {
    id: 'driveway-wash',
    name: 'Driveway & Concrete Surface Cleaning',
    tagline: 'Industrial rotary surface cleaning with zero zebra wand striping',
    description: 'Using high-pressure rotary surface cleaners with dual spinning 25-degree nozzles, we extract embedded oil spots, tire rubber, grime, and dark tannin stains from driveways and walkways.',
    includes: [
      'Biodegradable hydrocarbon degreaser pre-treatment on oil stains',
      '3500 PSI uniform rotary surface scrubbing (consistent streak-free finish)',
      'Curbside and sidewalk apron high-flow rinse',
      'Post-treatment efflorescence inhibitor application'
    ],
    durationMinutes: 90,
    basePrice: 250,
    pricePerSqFt: 0.22,
    idealFor: 'Driveways, concrete patios, sidewalks, front entryway aprons',
    image: PATIO_IMAGE,
    recommendedFrequency: 'Every 6 to 12 months'
  },
  {
    id: 'patio-deck',
    name: 'Paver Patio & Composite Deck Restoration',
    tagline: 'Deep cleaning that rejuvenates flagstone, pavers, Trex & cedar',
    description: 'Revive weathered interlocking pavers, flagstone, stamped concrete, and composite or cedar decking. Eliminates slippery moss, weed roots, and stubborn black mildew safely.',
    includes: [
      'Joint moss and weed eradication without blasting away base sand',
      'Surface level paver and edge stone gentle scrub',
      'Calibrated pressure (800-1200 PSI) for soft wood & composite decks',
      'Complete debris washdown and perimeter clearing'
    ],
    durationMinutes: 110,
    basePrice: 250,
    pricePerSqFt: 0.25,
    idealFor: 'Backyard entertaining spaces, pool surrounds, pergolas',
    image: PATIO_IMAGE,
    recommendedFrequency: 'Spring or early summer'
  },
  {
    id: 'roof-wash',
    name: 'Low-Pressure Roof Algae Treatment',
    tagline: 'Zero-pressure chemical application to eliminate black streak Gloeocapsa Magma',
    description: 'Black streaks on shingles are airborne algae feeding on limestone filler. We apply an ARMA-approved zero-pressure chemical spray that eradicates algae roots without dislodging shingle granules.',
    includes: [
      'Full roof inspection & downspout catchment diversion',
      'Soft-chemical application (strictly zero granule damage)',
      'Elimination of lichen, moss clusters, and black streaks',
      '2-year algae-free clean guarantee'
    ],
    durationMinutes: 150,
    basePrice: 380,
    pricePerSqFt: 0.32,
    idealFor: 'Asphalt shingle and concrete tile roofs showing dark stains',
    image: SIDING_IMAGE,
    recommendedFrequency: 'Every 2 to 3 years'
  },
  {
    id: 'gutter-cleaning',
    name: 'Gutter Interior & Exterior Brightening',
    tagline: 'Complete drainage flush plus electrostatic tiger-stripe fascia brightening',
    description: 'Clear trapped oak leaves and sludge from gutters and downspouts, followed by an exterior oxidation scrub that removes unsightly vertical black tiger stripes.',
    includes: [
      'Manual debris extraction & bagging for green waste disposal',
      'Downspout ground-level water flow test',
      'Gutter face electrostatic grime scrub with oxalic brightener',
      'Mess-free ground cleanup guarantee'
    ],
    durationMinutes: 75,
    basePrice: 250,
    pricePerSqFt: 0.15,
    idealFor: 'Clogged downspouts, spring and autumn Sacramento valley leaf fall',
    image: HERO_IMAGE,
    recommendedFrequency: 'Twice a year (Spring & Fall)'
  },
  {
    id: 'commercial-wash',
    name: 'Commercial Storefront & Retail Plaza Wash',
    tagline: 'Heavy-duty night and early morning cleaning for Sacramento businesses',
    description: 'Flexible scheduling to ensure zero disruption to retail patrons. We tackle grease traps, dumpster pads, drive-thrus, sidewalks, and architectural facades with hot water steam washing.',
    includes: [
      '200°F hot water high-pressure grease and gum dissolution',
      'Chewing gum extraction with specialized needle nozzles',
      'Storefront entryways, pillars, and canopy washing',
      'California Regional Water Quality Board compliant drainage control'
    ],
    durationMinutes: 240,
    basePrice: 490,
    pricePerSqFt: 0.20,
    idealFor: 'Retail plazas, restaurants, office complexes, HOA communities',
    image: HERO_IMAGE,
    recommendedFrequency: 'Monthly or Quarterly contracts'
  }
];

export const CLEANING_SUPPLIES: CleaningSupply[] = [
  {
    id: 'supply-1',
    name: 'Precision Sodium Hypochlorite (SH) Soft-Wash Blend',
    chemicalFormula: 'NaClO (1.5% – 2.5% active in-line dilution)',
    category: 'Eco Oxidizer',
    purpose: 'Kills mold, mildew, lichen, and algae spores at the root without destructive pressure.',
    ecoSafetyRating: 'EPA Eco-Compliant (Breaks down to salt & water within 24 hours)',
    dilutionRatio: '1:5 to 1:10 downstream metering',
    environmentalNotes: 'Rapidly photolyzes under sunlight. Does not bio-accumulate in soil or groundwater.',
    petAndPlantSafety: 'Surrounding vegetation is pre-soaked with fresh water and treated with Agent Green neutralizer.'
  },
  {
    id: 'supply-2',
    name: 'Apple Wash Bio-Surfactant Clinging Foam',
    chemicalFormula: 'Biodegradable Alkyl Polyglucoside surfactant matrix',
    category: 'Surfactant',
    purpose: 'Enhances dwell time on vertical walls, breaks surface tension, and allows solutions to cling without runoff.',
    ecoSafetyRating: '100% Biodegradable & Phosphate-Free',
    dilutionRatio: '1 oz per gallon of mix',
    environmentalNotes: 'Naturally derived from renewable coconut and plant sugars. Non-toxic to aquatic micro-organisms.',
    petAndPlantSafety: 'Completely pet-safe, non-caustic, and non-irritating after standard rinse.'
  },
  {
    id: 'supply-3',
    name: 'Citrus Force Industrial Hydrocarbon Degreaser',
    chemicalFormula: 'd-Limonene (cold-pressed orange terpene) + Sodium Metasilicate',
    category: 'Alkaline Degreaser',
    purpose: 'Breaks down automotive motor oil, transmission fluid, tire rubber, and heavy barbecue grease.',
    ecoSafetyRating: 'Zero VOC / Non-Petroleum Solvent',
    dilutionRatio: '1:4 for heavy motor oil / 1:10 for general concrete degreasing',
    environmentalNotes: 'Natural citrus solvent that saponifies grease without harsh butyl solvents or chlorinated chemicals.',
    petAndPlantSafety: 'Wash area is barricaded during active agitation; rinses cleanly into containment tanks.'
  },
  {
    id: 'supply-4',
    name: 'Agent Green Botanical Plant & Turf Neutralizer',
    chemicalFormula: 'Potassium Metabisulfite & humic acid botanical buffer',
    category: 'Plant Neutralizer',
    purpose: 'Instantly neutralizes chlorine oxidizer residues on leaves, grass blades, and garden soil.',
    ecoSafetyRating: 'Organic Grade Soil Enricher',
    dilutionRatio: 'Applied at 100% active mist onto garden borders',
    environmentalNotes: 'Converts active oxidizer into beneficial soil potassium sulfate and water.',
    petAndPlantSafety: 'Shields sensitive Japanese maples, hydrangeas, roses, and turfgrass from yellowing.'
  },
  {
    id: 'supply-5',
    name: 'Oxalic Wood & Masonry Brightening Acid',
    chemicalFormula: 'C2H2O4 (Organic Dicarboxylic Acid)',
    category: 'Wood Brightener',
    purpose: 'Eliminates rust stains, fertilizer burn spots, and restores natural honey tones to weathered wood siding and decks.',
    ecoSafetyRating: 'Organic naturally occurring plant acid',
    dilutionRatio: '6 oz per gallon of warm water',
    environmentalNotes: 'Neutralizes alkaline cleaners and restores wood pH to 5.5 ideal for staining.',
    petAndPlantSafety: 'Thoroughly water-rinsed; non-hazardous once dry.'
  },
  {
    id: 'supply-6',
    name: 'Hydrotek Closed-Loop Wastewater Recovery Dam',
    chemicalFormula: 'Physical Recovery: 15-Micron Polypropylene Silt Filter + Coalescing Oil Mat',
    category: 'Reclaim System',
    purpose: 'Captures 99.8% of wash water from enter-way drains to satisfy Sacramento Stormwater Compliance.',
    ecoSafetyRating: 'Gold Tier Clean Water Act Municipal Standard',
    dilutionRatio: 'Continuous vacuum loop (pumps 12 GPM into 100-gal holding tank)',
    environmentalNotes: 'Prevents toxic street hydrocarbons from reaching the Sacramento & American Rivers.',
    petAndPlantSafety: 'Zero chemical runoff into neighborhood ditches or storm basins.'
  }
];

export const INITIAL_CUSTOMERS: UserProfile[] = [
  {
    id: 'cust-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(916) 441-2099',
    address: '1824 23rd St, Midtown Sacramento, CA 95816',
    role: 'customer',
    notes: 'Historic Craftsman home. Delicate rose bushes along south brick driveway. Dogs inside during wash.',
    mfaEnabled: false
  },
  {
    id: 'cust-2',
    name: 'Robert Miller',
    email: 'robert.m@example.com',
    phone: '(916) 728-1144',
    address: '8401 Laguna Springs Dr, Elk Grove, CA 95758',
    role: 'customer',
    notes: '3-car exposed aggregate driveway with heavy oil drip spots from project car.',
    mfaEnabled: false
  },
  {
    id: 'cust-3',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '(916) 983-5520',
    address: '110 Natoma St, Folsom, CA 95630',
    role: 'customer',
    notes: 'Custom paver patio around swimming pool with heavy shaded moss build-up.',
    mfaEnabled: false
  }
];

export const INITIAL_TECHNICIANS: FieldTechnician[] = [
  {
    id: 'tech-1',
    name: 'Mike Vance',
    phone: '(916) 550-9281',
    email: 'mike.vance@allyearpressurewashing.com',
    avatar: 'MV',
    activeJobsCount: 2,
    vehicle: 'Truck #01 (3500 PSI Dual-Rig + Hot Water Boiler)'
  },
  {
    id: 'tech-2',
    name: 'Elena Gomez',
    phone: '(916) 550-9282',
    email: 'elena.gomez@allyearpressurewashing.com',
    avatar: 'EG',
    activeJobsCount: 1,
    vehicle: 'Truck #02 (Closed-Loop Vacuum Reclaim & Eco-Soft Wash Rig)'
  }
];

export const INITIAL_ADMIN: UserProfile = {
  id: 'admin-1',
  name: 'Marcus Ray',
  email: 'marcus.owner@allyearpressurewashing.com',
  phone: '(916) 397-1877',
  address: 'Sacramento, CA',
  role: 'admin',
  notes: 'Founder & Sacramento Dispatch Operations Lead',
  mfaEnabled: true
};

export const INITIAL_QUOTES: QuoteRequest[] = [
  {
    id: 'Q-1001',
    customerId: 'cust-1',
    customerName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(916) 441-2099',
    serviceId: 'driveway-wash',
    serviceName: 'Driveway & Concrete Surface Cleaning',
    propertyAddress: '1824 23rd St, Midtown Sacramento, CA 95816',
    areaDescription: 'Double car concrete driveway with heavy winter delta tannin stains and oil spot near garage.',
    squareFootage: 850,
    photos: [PATIO_IMAGE],
    status: 'quoted',
    estimatedPrice: 190,
    directPriceBreakdown: {
      basePrice: 190,
      sqFt: 850,
      sqFtRate: 0.22,
      sqFtCost: 187,
      visitFee: 0,
      visitFeeWaived: true,
      totalDirectPrice: 190
    },
    adminNotes: 'Core Sacramento zone: $0 visit fee applied. Customer requested plant neutralizer on rose bushes.',
    createdAt: '2026-10-06'
  },
  {
    id: 'Q-1002',
    customerId: 'cust-2',
    customerName: 'Robert Miller',
    email: 'robert.m@example.com',
    phone: '(916) 728-1144',
    serviceId: 'house-wash',
    serviceName: 'Whole House Soft Washing',
    propertyAddress: '8401 Laguna Springs Dr, Elk Grove, CA 95758',
    areaDescription: 'North-facing 2-story stucco home with heavy green algae accumulation under the eaves.',
    squareFootage: 2400,
    photos: [SIDING_IMAGE],
    status: 'reviewed',
    estimatedPrice: 388,
    directPriceBreakdown: {
      basePrice: 280,
      sqFt: 2400,
      sqFtRate: 0.18,
      sqFtCost: 432,
      visitFee: 0,
      visitFeeWaived: true,
      totalDirectPrice: 388
    },
    adminNotes: 'Elk Grove route on Thursday. Customer confirmed hose spigot at side yard.',
    createdAt: '2026-10-07'
  },
  {
    id: 'Q-1003',
    customerName: 'David Sterling',
    email: 'david.s@example.com',
    phone: '(916) 812-4490',
    serviceId: 'environmental-remediation',
    serviceName: 'Environmental Pollutant & Runoff Remediation',
    propertyAddress: '2400 Arden Way, Sacramento, CA 95825',
    areaDescription: 'Commercial strip plaza dumpster enclosure with oil runoff nearing city storm basin.',
    squareFootage: 1200,
    photos: [HERO_IMAGE],
    status: 'new',
    estimatedPrice: 516,
    directPriceBreakdown: {
      basePrice: 420,
      sqFt: 1200,
      sqFtRate: 0.28,
      sqFtCost: 336,
      visitFee: 0,
      visitFeeWaived: true,
      totalDirectPrice: 516
    },
    adminNotes: 'Requires closed-loop vacuum rig and polyurethane berm containment.',
    createdAt: '2026-10-08'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-501',
    quoteId: 'Q-1001',
    customerId: 'cust-1',
    customerName: 'Jane Doe',
    customerEmail: 'jane.doe@example.com',
    customerPhone: '(916) 441-2099',
    serviceId: 'driveway-wash',
    serviceName: 'Driveway & Concrete Surface Cleaning',
    serviceAddress: '1824 23rd St, Midtown Sacramento, CA 95816',
    scheduledDate: '2026-10-09',
    scheduledTime: '08:00 AM - 10:00 AM',
    technicianId: 'tech-1',
    technicianName: 'Mike Vance',
    status: 'scheduled',
    notes: 'Midtown location: $0 visit fee. Gate unlocked. Hose hookup on south wall. Pre-soak rose bushes.',
    price: 190,
    squareFootage: 850,
    paymentStatus: 'pending'
  },
  {
    id: 'APT-502',
    customerId: 'cust-2',
    customerName: 'Robert Miller',
    customerEmail: 'robert.m@example.com',
    customerPhone: '(916) 728-1144',
    serviceId: 'house-wash',
    serviceName: 'Whole House Soft Washing',
    serviceAddress: '8401 Laguna Springs Dr, Elk Grove, CA 95758',
    scheduledDate: '2026-10-09',
    scheduledTime: '10:30 AM - 12:30 PM',
    technicianId: 'tech-1',
    technicianName: 'Mike Vance',
    status: 'scheduled',
    notes: 'Elk Grove: 2-story stucco soft wash. Cover electrical outlets and pool equipment.',
    price: 388,
    squareFootage: 2400,
    paymentStatus: 'pending'
  },
  {
    id: 'APT-503',
    customerId: 'cust-3',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '(916) 983-5520',
    serviceId: 'patio-deck',
    serviceName: 'Paver Patio & Composite Deck Restoration',
    serviceAddress: '110 Natoma St, Folsom, CA 95630',
    scheduledDate: '2026-10-09',
    scheduledTime: '01:00 PM - 03:00 PM',
    technicianId: 'tech-2',
    technicianName: 'Elena Gomez',
    status: 'en_route',
    notes: 'Folsom paver restoration. Customer working from home. Zero bleach on lawn.',
    price: 260,
    squareFootage: 650,
    paymentStatus: 'invoiced'
  },
  {
    id: 'APT-489',
    customerId: 'cust-1',
    customerName: 'Jane Doe',
    customerEmail: 'jane.doe@example.com',
    customerPhone: '(916) 441-2099',
    serviceId: 'gutter-cleaning',
    serviceName: 'Gutter Interior & Exterior Brightening',
    serviceAddress: '1824 23rd St, Midtown Sacramento, CA 95816',
    scheduledDate: '2026-09-18',
    scheduledTime: '09:00 AM - 10:30 AM',
    technicianId: 'tech-2',
    technicianName: 'Elena Gomez',
    status: 'completed',
    notes: 'Cleared all sycamore leaves from downspouts. Oxalic scrub on exterior gutters.',
    technicianNotes: 'Completed full flush on all 4 downspouts. Handled east gutter seam reinforcement.',
    price: 150,
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    paidAt: '2026-09-18',
    completedAt: '2026-09-18 10:25 AM'
  },
  {
    id: 'APT-472',
    customerId: 'cust-2',
    customerName: 'Robert Miller',
    customerEmail: 'robert.m@example.com',
    customerPhone: '(916) 728-1144',
    serviceId: 'roof-wash',
    serviceName: 'Low-Pressure Roof Algae Treatment',
    serviceAddress: '8401 Laguna Springs Dr, Elk Grove, CA 95758',
    scheduledDate: '2026-08-14',
    scheduledTime: '08:00 AM - 11:00 AM',
    technicianId: 'tech-1',
    technicianName: 'Mike Vance',
    status: 'completed',
    notes: 'Full tile roof soft-wash with zero pressure damage.',
    technicianNotes: 'All dark streak gloeocapsa eradicated. Homeowner left verified 5-star Yelp review.',
    price: 380,
    paymentStatus: 'paid',
    paymentMethod: 'Online',
    paidAt: '2026-08-14',
    completedAt: '2026-08-14 10:55 AM'
  }
];

export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'block-1',
    date: '2026-10-12',
    timeSlot: 'All Day',
    reason: 'Sacramento Fleet Rig Pump Overhaul & Vacuum Dam Inspection'
  },
  {
    id: 'block-2',
    date: '2026-10-15',
    timeSlot: '03:30 PM - 05:30 PM',
    reason: 'Sacramento Delta High Wind Advisory (Exceeding 25 MPH)'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-801',
    appointmentId: 'APT-489',
    customerName: 'Jane Doe',
    amount: 150,
    method: 'Credit Card',
    status: 'paid',
    transactionRef: 'TXN-9843-SAC',
    date: '2026-09-18',
    notes: 'Paid on job completion in Midtown Sacramento'
  },
  {
    id: 'PAY-802',
    appointmentId: 'APT-472',
    customerName: 'Robert Miller',
    amount: 380,
    method: 'Online',
    status: 'paid',
    transactionRef: 'TXN-7231-ELK',
    date: '2026-08-14',
    notes: 'Bank transfer received for Elk Grove tile roof wash'
  }
];

export const INITIAL_SERVICE_AREAS: ServiceArea[] = [
  {
    id: 'area-1',
    name: 'Central & Downtown Sacramento (Hub Zone)',
    zipCodes: ['95811', '95814', '95816', '95818'],
    coverageRadius: 'Within 5 miles of Sacramento central core',
    responseTime: 'Immediate same-day or next-morning dispatch',
    visitFeePolicy: '$0 On-Site Visit Fee (Sacramento Core Zone)'
  },
  {
    id: 'area-2',
    name: 'East Sacramento, Land Park & Curtis Park',
    zipCodes: ['95819', '95822', '95820', '95826'],
    coverageRadius: 'Within 10 miles',
    responseTime: 'Next-day priority routing',
    visitFeePolicy: '$0 On-Site Visit Fee (Sacramento Core Zone)'
  },
  {
    id: 'area-3',
    name: 'Elk Grove & Laguna West',
    zipCodes: ['95624', '95757', '95758'],
    coverageRadius: '18 miles south via Hwy 99 / I-5',
    responseTime: 'Daily dedicated routes',
    visitFeePolicy: '$0 On-Site Visit Fee (Sacramento Core Zone)'
  },
  {
    id: 'area-4',
    name: 'Roseville, Rocklin & Citrus Heights',
    zipCodes: ['95661', '95678', '95677', '95610', '95621'],
    coverageRadius: '22 miles north via I-80',
    responseTime: 'Tuesday & Friday dedicated crews',
    visitFeePolicy: '$0 On-Site Visit Fee when booked'
  },
  {
    id: 'area-5',
    name: 'Folsom, El Dorado Hills & Rancho Cordova',
    zipCodes: ['95630', '95762', '95670'],
    coverageRadius: '24 miles east via Hwy 50',
    responseTime: 'Monday, Wednesday & Saturday routes',
    visitFeePolicy: '$0 On-Site Visit Fee when booked'
  },
  {
    id: 'area-6',
    name: 'Natomas, North Highlands & Arden-Arcade',
    zipCodes: ['95834', '95835', '95833', '95821', '95825'],
    coverageRadius: '12 miles north/east',
    responseTime: 'Daily fast dispatch',
    visitFeePolicy: '$0 On-Site Visit Fee (Sacramento Core Zone)'
  },
  {
    id: 'area-7',
    name: 'Davis, Woodland & Dixon (Yolo County)',
    zipCodes: ['95616', '95618', '95695', '95620'],
    coverageRadius: '15 - 25 miles west via I-80 & I-5',
    responseTime: 'Daily dedicated university & agricultural corridor dispatch',
    visitFeePolicy: '$0 On-Site Visit Fee (Core Covered)'
  },
  {
    id: 'area-8',
    name: 'Fairfield & Vacaville (Solano Corridor)',
    zipCodes: ['94533', '94534', '95687', '95688'],
    coverageRadius: '30 - 40 miles south-west via I-80',
    responseTime: 'Monday, Wednesday & Friday routes',
    visitFeePolicy: '$0 when booking (Yelp Service Zone)'
  },
  {
    id: 'area-9',
    name: 'Galt, Lodi & North Stockton',
    zipCodes: ['95632', '95240', '95242', '95209'],
    coverageRadius: '25 - 35 miles south via Hwy 99',
    responseTime: 'Daily southern corridor routes',
    visitFeePolicy: '$0 when booking (Yelp Service Zone)'
  },
  {
    id: 'area-10',
    name: 'Lincoln, Rocklin & Shingle Springs',
    zipCodes: ['95648', '95677', '95682'],
    coverageRadius: '25 - 35 miles north-east & foothills',
    responseTime: 'Tuesday, Thursday & Saturday routes',
    visitFeePolicy: '$0 when booking (Yelp Service Zone)'
  }
];

export const BUSINESS_HOURS = [
  { days: 'Monday – Sunday (All 7 Days)', hours: '8:00 AM – 8:00 PM', status: 'Full Operations & Active Dispatch' },
  { days: 'Monday – Friday', hours: '8:00 AM – 8:00 PM', status: 'Residential & Commercial Dispatch' },
  { days: 'Saturday – Sunday', hours: '8:00 AM – 8:00 PM', status: 'Weekend Residential & Eco Remediation' }
];

export const CONTACT_INFO = {
  company: 'All Year Pressure Washing',
  phone: '(916) 397-1877',
  emergencyPhone: '(916) 397-1877',
  email: 'dispatch@allyearpressurewashing.com',
  address: 'Sacramento, CA',
  neighborhood: 'Sacramento & Surrounding Areas',
  headquarters: 'Sacramento, CA',
  license: 'California Contractor License #1084291 · Insured & EPA Reclaim Certified',
  guarantee: '100% Streak-Free & California Clean Water Act Compliant Guarantee',
  yelpUrl: YELP_PROFILE_URL,
  visitFeePolicy: 'Free On-Site Estimates in Greater Sacramento (<20 mi). $45 Extended trip fee is 100% credited upon booking.'
};

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-yelp-1',
    author: 'Daniel V.',
    neighborhood: 'Midtown Sacramento, CA',
    rating: 5,
    date: 'October 2, 2026',
    serviceId: 'driveway-wash',
    serviceName: 'Driveway & Concrete Cleaning',
    content: 'Found All Year Pressure Washing right here on Yelp after my HOA issued a warning about oil and tree pollen on our front driveway. Mike showed up on time at our Midtown home, explained the chemical breakdown of the degreaser, and used their rotary surface machine. Not a single wand streak! Best pressure washing team in Sacramento.',
    verifiedHomeowner: true,
    avatarInitial: 'D',
    source: 'yelp',
    yelpReviewUrl: YELP_PROFILE_URL
  },
  {
    id: 'rev-yelp-2',
    author: 'Claire R.',
    neighborhood: 'East Sacramento, CA',
    rating: 5,
    date: 'September 24, 2026',
    serviceId: 'house-wash',
    serviceName: 'Whole House Soft Washing',
    content: 'We live near the American River and have massive algae buildup on our north siding every fall. Elena used their low-pressure soft wash method and pre-treated our prized rose garden with botanical neutralizer so nothing was damaged. Our two-story siding looks like brand-new paint. 5 stars on Yelp without hesitation!',
    verifiedHomeowner: true,
    avatarInitial: 'C',
    source: 'yelp',
    yelpReviewUrl: YELP_PROFILE_URL
  },
  {
    id: 'rev-yelp-3',
    author: 'Marcus & Tara L.',
    neighborhood: 'Elk Grove, CA',
    rating: 5,
    date: 'September 15, 2026',
    serviceId: 'patio-deck',
    serviceName: 'Paver Patio & Composite Deck Restoration',
    content: 'Their direct price calculator gave us an instant quote with zero visit fee in Elk Grove. They brought high-grade eco surfactants, cleaned out the slippery black moss from our backyard pool pavers, and didn’t wash dangerous chemicals into the pool or yard. Honest, direct pricing and great communication.',
    verifiedHomeowner: true,
    avatarInitial: 'M',
    source: 'yelp',
    yelpReviewUrl: YELP_PROFILE_URL
  },
  {
    id: 'rev-yelp-4',
    author: 'Brendan H.',
    neighborhood: 'Folsom, CA',
    rating: 5,
    date: 'August 28, 2026',
    serviceId: 'roof-wash',
    serviceName: 'Low-Pressure Roof Algae Treatment',
    content: 'Our homeowner insurance sent a cancellation threat due to dark roof discoloration (Gloeocapsa magma algae). Marcus gave me a firm direct quote online with square footage pricing. Elena treated the shingles with zero high pressure so no granules came off. Inspection passed next week!',
    verifiedHomeowner: true,
    avatarInitial: 'B',
    source: 'yelp',
    yelpReviewUrl: YELP_PROFILE_URL
  },
  {
    id: 'rev-yelp-5',
    author: 'Sarah K.',
    neighborhood: 'Roseville, CA',
    rating: 5,
    date: 'August 12, 2026',
    serviceId: 'environmental-remediation',
    serviceName: 'Environmental Pollutant & Runoff Remediation',
    content: 'Our retail plaza in Roseville needed emergency grease recovery after an overflow. All Year Pressure Washing brought their vacuum containment dams to prevent dirty wastewater from polluting the city storm drains. Completely certified EPA closed-loop wash. True professionals who protect Sacramento waterways.',
    verifiedHomeowner: true,
    avatarInitial: 'S',
    source: 'yelp',
    yelpReviewUrl: YELP_PROFILE_URL
  },
  {
    id: 'rev-direct-6',
    author: 'Alicia Thorne',
    neighborhood: 'Land Park, Sacramento',
    rating: 5,
    date: 'July 30, 2026',
    serviceId: 'gutter-cleaning',
    serviceName: 'Gutter Brightening & Flush',
    content: 'Flushed out our clogged gutters and brightened the exterior gutter tiger stripes. The technician kept us updated via the client dialogue messenger the entire time. No mess left on the lawn or sidewalks.',
    verifiedHomeowner: true,
    avatarInitial: 'A',
    source: 'direct'
  }
];

export const INITIAL_DIALOGUE: DialogueMessage[] = [
  {
    id: 'msg-1',
    threadId: 'cust-1',
    customerName: 'Jane Doe',
    senderRole: 'client',
    senderName: 'Jane Doe (Midtown)',
    message: 'Hello! I have an 850 sq ft concrete driveway on 23rd St in Midtown Sacramento with some older oil drips. Do you charge an upfront visit fee to come check it?',
    timestamp: '2026-10-06 09:14 AM'
  },
  {
    id: 'msg-2',
    threadId: 'cust-1',
    customerName: 'Jane Doe',
    senderRole: 'admin',
    senderName: 'Marcus Ray (Sacramento Dispatch)',
    message: 'Hi Jane! Midtown Sacramento is in our core service zone, so there is $0 visit fee! Based on your 850 sq ft driveway, our direct locked price is $190 including citrus degreaser pre-treatment.',
    timestamp: '2026-10-06 09:22 AM',
    directPrice: 190
  },
  {
    id: 'msg-3',
    threadId: 'cust-1',
    customerName: 'Jane Doe',
    senderRole: 'client',
    senderName: 'Jane Doe (Midtown)',
    message: 'That sounds perfect. Will the chemical run into my rose garden? I am very protective of those plants.',
    timestamp: '2026-10-06 09:30 AM'
  },
  {
    id: 'msg-4',
    threadId: 'cust-1',
    customerName: 'Jane Doe',
    senderRole: 'technician',
    senderName: 'Mike Vance (Assigned Field Tech)',
    message: 'Good morning Jane! I will be running Truck #01 on your job. We carry Agent Green botanical plant neutralizer and pre-soak all garden beds with pure water prior to the wash. Your rose bushes will be completely shielded.',
    timestamp: '2026-10-06 09:45 AM'
  },
  {
    id: 'msg-5',
    threadId: 'cust-2',
    customerName: 'Robert Miller',
    senderRole: 'client',
    senderName: 'Robert Miller (Elk Grove)',
    message: 'Can I get a direct price for a 2,400 sq ft two-story stucco house in Elk Grove? Is there a travel fee out here?',
    timestamp: '2026-10-07 11:05 AM'
  },
  {
    id: 'msg-6',
    threadId: 'cust-2',
    customerName: 'Robert Miller',
    senderRole: 'admin',
    senderName: 'Marcus Ray (Sacramento Dispatch)',
    message: 'Hi Robert! Elk Grove is well within our 20-mile Sacramento core perimeter, so your on-site assessment fee is $0. For a 2,400 sq ft home at our soft-wash rate of $0.18/sq ft, your direct locked price is $388 all-in. No hidden surcharges.',
    timestamp: '2026-10-07 11:15 AM',
    directPrice: 388
  }
];

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-101',
    type: 'quote_access',
    title: 'New Quote Access Request: Driveway & Concrete Cleaning',
    customerName: 'Jane Doe',
    customerEmail: 'jane.doe@example.com',
    customerPhone: '(916) 441-2099',
    serviceName: 'Driveway & Concrete Surface Cleaning',
    propertyAddress: 'Midtown Sacramento, CA',
    squareFootage: 850,
    estimatedPrice: 190,
    timestamp: '10 mins ago',
    read: false,
    notes: 'Customer requested direct quote access. Automated email alert sent to admin.'
  },
  {
    id: 'notif-102',
    type: 'quote_access',
    title: 'New Quote Access Request: Whole House Soft Washing',
    customerName: 'Robert Miller',
    customerEmail: 'robert.m@example.com',
    customerPhone: '(916) 728-1144',
    serviceName: 'Whole House Soft Washing',
    propertyAddress: 'Elk Grove, CA',
    squareFootage: 2400,
    estimatedPrice: 388,
    timestamp: '45 mins ago',
    read: true,
    notes: 'Quote access approved. Customer reviewing locked price.'
  }
];
