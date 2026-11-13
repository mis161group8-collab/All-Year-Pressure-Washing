export type UserRole = 'customer' | 'technician' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  notes?: string;
  mfaEnabled?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  includes: string[];
  durationMinutes: number;
  basePrice: number;
  pricePerSqFt?: number;
  idealFor: string;
  image: string;
  recommendedFrequency: string;
  isEnvironmentalService?: boolean;
}

export interface DirectPriceBreakdown {
  basePrice: number;
  sqFt: number;
  sqFtRate: number;
  sqFtCost: number;
  visitFee: number;
  visitFeeWaived: boolean;
  totalDirectPrice: number;
}

export interface QuoteRequest {
  id: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  mainCategory?: string;
  subcategories?: string[];
  removalNeeds?: string[];
  otherRemovalDetails?: string;
  timingPreference?: 'asap' | 'flexible' | 'specific_date';
  preferredDate?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyAddress: string;
  areaDescription: string;
  squareFootage?: number;
  photos: string[];
  status: 'new' | 'reviewed' | 'quoted' | 'accepted' | 'declined';
  estimatedPrice?: number;
  directPriceBreakdown?: DirectPriceBreakdown;
  adminNotes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  quoteId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  serviceAddress: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. "08:00 AM - 10:00 AM"
  technicianId: string;
  technicianName: string;
  status: 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  technicianNotes?: string;
  price: number;
  paymentStatus: 'pending' | 'invoiced' | 'paid' | 'overdue' | 'refunded';
  paymentMethod?: 'Credit Card' | 'Check' | 'Cash' | 'Bank Transfer' | 'Online';
  paidAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  squareFootage?: number;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot?: string; // specific slot or "All Day"
  reason: string;
}

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  customerName: string;
  amount: number;
  method: 'Credit Card' | 'Check' | 'Cash' | 'Bank Transfer' | 'Online';
  status: 'paid' | 'pending' | 'refunded';
  transactionRef: string;
  date: string;
  notes?: string;
}

export interface FieldTechnician {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  activeJobsCount: number;
  vehicle: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zipCodes: string[];
  coverageRadius: string;
  responseTime: string;
  visitFeePolicy: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  neighborhood: string;
  rating: number; // 1-5
  date: string;
  serviceId: string;
  serviceName: string;
  content: string;
  verifiedHomeowner: boolean;
  avatarInitial: string;
  source: 'yelp' | 'direct';
  yelpReviewUrl?: string;
}

export interface CleaningSupply {
  id: string;
  name: string;
  chemicalFormula?: string;
  category: 'Surfactant' | 'Eco Oxidizer' | 'Alkaline Degreaser' | 'Plant Neutralizer' | 'Wood Brightener' | 'Reclaim System';
  purpose: string;
  ecoSafetyRating: string;
  dilutionRatio: string;
  environmentalNotes: string;
  petAndPlantSafety: string;
}

export interface DialogueMessage {
  id: string;
  threadId: string; // e.g. customer ID, quote ID, or general
  customerName: string;
  senderRole: 'client' | 'admin' | 'technician';
  senderName: string;
  message: string;
  timestamp: string;
  quoteId?: string;
  appointmentId?: string;
  directPrice?: number;
}

export interface AdminNotification {
  id: string;
  type: 'quote_access' | 'system' | 'message';
  title: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  propertyAddress: string;
  squareFootage?: number;
  estimatedPrice?: number;
  timestamp: string;
  read: boolean;
  notes?: string;
}
