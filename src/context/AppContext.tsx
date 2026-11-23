import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  writeBatch,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  buildFirestoreErrorInfo,
  formatFirestoreErrorMessage
} from '../firebase';
import {
  UserRole,
  UserProfile,
  ServiceItem,
  QuoteRequest,
  Appointment,
  BlockedSlot,
  SlotAvailability,
  BusinessInfo,
  DispatchRosterEntry,
  PaymentRecord,
  FieldTechnician,
  ServiceArea,
  CustomerReview,
  CleaningSupply,
  DialogueMessage,
  DirectPriceBreakdown,
  AdminNotification,
  StaffAccount
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_SERVICE_AREAS,
  INITIAL_REVIEWS,
  CLEANING_SUPPLIES,
  SACRAMENTO_LOCATION,
  VISIT_FEE_POLICY,
  YELP_PROFILE_URL,
  DEFAULT_BUSINESS_INFO
} from '../data/initialData';

const BOOTSTRAPPED_ADMIN_EMAIL = 'mis161group8@gmail.com';
const SACRAMENTO_TZ = 'America/Los_Angeles';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export type AppViewMode =
  | 'home'
  | 'services'
  | 'areas'
  | 'supplies'
  | 'customer_portal'
  | 'tech_portal'
  | 'admin_dashboard';

export function getSacramentoNow(): { dateStr: string; minutesSinceMidnight: number } {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: SACRAMENTO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  const timeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: SACRAMENTO_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).formatToParts(now);

  const hourPart = Number(timeParts.find((p) => p.type === 'hour')?.value || '0') % 24;
  const minPart = Number(timeParts.find((p) => p.type === 'minute')?.value || '0');
  return { dateStr, minutesSinceMidnight: hourPart * 60 + minPart };
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + days));
  return dt.toISOString().split('T')[0];
}

export function parseSlotStartMinutes(timeSlot: string): number | null {
  const startPart = timeSlot.split('-')[0]?.trim() || '';
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(startPart);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export function toSlotKey(date: string, timeSlot: string): string {
  return `slot_${date}_${timeSlot.replace(/[^a-zA-Z0-9]+/g, '_')}`.replace(/_+$/, '').slice(0, 128);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'FT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function toDateString(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp) {
    return val.toDate().toISOString().split('T')[0];
  }
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString().split('T')[0];
  }
  return getSacramentoNow().dateStr;
}

function mapDocToQuote(id: string, data: DocumentData): QuoteRequest {
  const photos = Array.isArray(data.photos)
    ? data.photos.filter((p): p is string => typeof p === 'string').slice(0, 5)
    : [];
  return {
    id,
    customerId: data.customerId ? String(data.customerId) : undefined,
    customerName: String(data.customerName || ''),
    email: String(data.email || ''),
    phone: String(data.phone || ''),
    serviceId: String(data.serviceId || ''),
    serviceName: String(data.serviceName || ''),
    mainCategory: data.mainCategory ? String(data.mainCategory) : undefined,
    subcategories: Array.isArray(data.subcategories) ? data.subcategories : undefined,
    removalNeeds: Array.isArray(data.removalNeeds) ? data.removalNeeds : undefined,
    otherRemovalDetails: data.otherRemovalDetails ? String(data.otherRemovalDetails) : undefined,
    timingPreference: data.timingPreference,
    preferredDate: data.preferredDate ? String(data.preferredDate) : undefined,
    streetAddress: data.streetAddress ? String(data.streetAddress) : undefined,
    city: data.city ? String(data.city) : undefined,
    state: data.state ? String(data.state) : undefined,
    zipCode: data.zipCode ? String(data.zipCode) : undefined,
    propertyAddress: String(data.propertyAddress || ''),
    areaDescription: String(data.areaDescription || ''),
    squareFootage: typeof data.squareFootage === 'number' ? data.squareFootage : undefined,
    photos,
    photoCount: typeof data.photoCount === 'number' ? data.photoCount : photos.length,
    status: data.status || 'new',
    estimatedPrice: typeof data.estimatedPrice === 'number' ? data.estimatedPrice : undefined,
    adminNotes: data.adminNotes ? String(data.adminNotes) : undefined,
    createdAt: data.createdDate ? String(data.createdDate) : toDateString(data.createdAt)
  };
}

function mapDocToAppointment(id: string, data: DocumentData): Appointment {
  return {
    id,
    quoteId: data.quoteId ? String(data.quoteId) : undefined,
    customerId: String(data.customerId || ''),
    customerName: String(data.customerName || ''),
    customerEmail: String(data.customerEmail || ''),
    customerPhone: String(data.customerPhone || ''),
    serviceId: String(data.serviceId || ''),
    serviceName: String(data.serviceName || ''),
    serviceAddress: String(data.serviceAddress || ''),
    scheduledDate: String(data.scheduledDate || ''),
    scheduledTime: String(data.scheduledTime || ''),
    technicianId: String(data.technicianId || ''),
    technicianName: String(data.technicianName || ''),
    technicianEmail: data.technicianEmail ? String(data.technicianEmail) : undefined,
    status: data.status || 'scheduled',
    notes: data.notes ? String(data.notes) : undefined,
    technicianNotes: data.technicianNotes ? String(data.technicianNotes) : undefined,
    price: Number(data.price || 0),
    paymentStatus: data.paymentStatus || 'pending',
    paymentMethod: data.paymentMethod,
    paidAt: data.paidAt ? String(data.paidAt) : undefined,
    completedAt: data.completedAt ? String(data.completedAt) : undefined,
    cancellationReason: data.cancellationReason ? String(data.cancellationReason) : undefined,
    squareFootage: typeof data.squareFootage === 'number' ? data.squareFootage : undefined
  };
}

function mapDocToMessage(id: string, data: DocumentData): DialogueMessage {
  return {
    id,
    threadId: String(data.threadId || ''),
    customerName: String(data.customerName || ''),
    senderRole: data.senderRole || 'client',
    senderName: String(data.senderName || ''),
    message: String(data.message || ''),
    timestamp: String(data.timestamp || ''),
    quoteId: data.quoteId ? String(data.quoteId) : undefined,
    appointmentId: data.appointmentId ? String(data.appointmentId) : undefined,
    directPrice: typeof data.directPrice === 'number' ? data.directPrice : undefined,
    assignedTechIds: Array.isArray(data.assignedTechIds) ? data.assignedTechIds : undefined,
    assignedTechEmails: Array.isArray(data.assignedTechEmails) ? data.assignedTechEmails : undefined
  };
}

function getReadableAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  if (code === 'auth/popup-blocked') {
    return 'Browser blocked the Google sign-in pop-up. Please allow pop-ups for this site and click "Continue with Google" again.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in window was closed before completing sign-in.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'A sign-in pop-up is already open. Please finish or close it and try again.';
  }
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return `This domain (${host}) is not authorized in Firebase Authentication. Add "${host}" under Firebase Console → Authentication → Settings → Authorized domains.`;
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in method is not enabled in Firebase Authentication yet. Enable it under Firebase Console → Authentication → Sign-in method.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email address or password. Please check your credentials or use "Forgot password?".';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password must be at least 6 characters long.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return message || 'Authentication failed. Please try again.';
}

interface AppContextType {
  // Firebase Authentication & RBAC state
  firebaseUser: User | null;
  authReady: boolean;
  isEmailVerified: boolean;
  isBootstrappedAdmin: boolean;
  isAdminAuthorized: boolean;
  isTechAuthorized: boolean;
  customerProfileExists: boolean;
  profileLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  firestoreError: string | null;
  clearFirestoreError: () => void;

  // Auth actions
  signInWithGoogle: (portalType?: 'customer' | 'technical' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createAccountWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<void>;
  refreshAuthUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;

  // Staff & Admin authorization directories
  staffAccounts: StaffAccount[];
  adminAccounts: StaffAccount[];
  grantStaffAccess: (data: {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    vehicle?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  revokeStaffAccess: (uid: string) => Promise<void>;

  // Editable business details & Sacramento timezone helpers
  businessInfo: BusinessInfo;
  updateBusinessInfo: (updates: Partial<BusinessInfo>) => Promise<{ success: boolean; error?: string }>;
  todayLA: string;
  tomorrowLA: string;

  // Session & view state
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  activeCustomerId: string;
  setActiveCustomerId: (id: string) => void;
  selectedTechnicianId: string;
  setSelectedTechnicianId: (id: string) => void;
  adminAuthenticated: boolean;
  adminProfile: UserProfile;

  // Dedicated Views: Client, Technical, Admin
  switchToDedicatedView: (mode: 'client' | 'technical' | 'admin') => void;

  // Location & Yelp Info
  sacramentoLocation: typeof SACRAMENTO_LOCATION;
  visitFeePolicy: typeof VISIT_FEE_POLICY;
  yelpProfileUrl: string;

  // Data entities (Cloud Firestore + static service catalog)
  services: ServiceItem[];
  customers: UserProfile[];
  technicians: FieldTechnician[];
  quotes: QuoteRequest[];
  appointments: Appointment[];
  techAppointments: Appointment[];
  blockedSlots: BlockedSlot[];
  payments: PaymentRecord[];
  serviceAreas: ServiceArea[];
  reviews: CustomerReview[];
  cleaningSupplies: CleaningSupply[];
  dialogueMessages: DialogueMessage[];
  adminNotifications: AdminNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  clearNotification: (id: string) => Promise<void>;

  // Dynamic Direct Price Calculator
  calculateDirectPrice: (serviceId: string, sqFt: number, addressOrZip?: string) => DirectPriceBreakdown;

  // Dialogue & Transcript Persistence
  sendDialogueMessage: (
    threadId: string,
    customerName: string,
    senderRole: 'client' | 'admin' | 'technician',
    senderName: string,
    message: string,
    directPrice?: number,
    quoteId?: string,
    appointmentId?: string
  ) => Promise<DialogueMessage | null>;
  downloadDialogueTranscript: (threadId: string) => void;
  copyDialogueTranscript: (threadId: string) => Promise<boolean>;

  // Reviews
  addReview: (review: Omit<CustomerReview, 'id' | 'date' | 'avatarInitial'>) => void;

  // Quote actions
  submitQuoteRequest: (quoteData: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>) => Promise<QuoteRequest | null>;
  updateQuoteStatus: (quoteId: string, status: QuoteRequest['status'], estimatedPrice?: number, adminNotes?: string) => Promise<void>;
  convertQuoteToAppointment: (quoteId: string, scheduledDate: string, scheduledTime: string, technicianId: string) => Promise<Appointment | null>;

  // Appointment actions
  bookAppointment: (bookingData: {
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceAddress: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
    squareFootage?: number;
  }) => Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  modifyAppointment: (id: string, date: string, time: string, technicianId?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  addManualAppointment: (data: Omit<Appointment, 'id' | 'status' | 'paymentStatus'>) => Promise<{ success: boolean; error?: string; appointment?: Appointment }>;
  markAppointmentCompleted: (id: string, techNotes?: string) => Promise<void>;
  updateTechnicianJobStatus: (id: string, status: Appointment['status'], technicianNotes?: string) => Promise<void>;

  // Blocked slots & double-booking prevention
  blockSlot: (date: string, timeSlot: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  unblockSlot: (id: string) => Promise<void>;
  isSlotAvailable: (date: string, timeSlot: string, excludeAppointmentId?: string, targetTechnicianId?: string) => { available: boolean; conflictReason?: string };

  // Profile actions
  updateCustomerProfile: (updatedProfile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateCustomerRecordByAdmin: (customerId: string, updatedData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;

  // Payment actions
  recordPayment: (paymentData: {
    appointmentId: string;
    amount: number;
    method: PaymentRecord['method'];
    notes?: string;
  }) => Promise<PaymentRecord | null>;
  updatePaymentStatus: (appointmentId: string, status: Appointment['paymentStatus'], method?: PaymentRecord['method']) => Promise<void>;

  // Active Modals & Views
  quoteModalOpen: boolean;
  setQuoteModalOpen: (open: boolean) => void;
  preselectedServiceForQuote: string | null;
  setPreselectedServiceForQuote: (serviceId: string | null) => void;
  bookingModalOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  preselectedServiceForBooking: string | null;
  setPreselectedServiceForBooking: (serviceId: string | null) => void;
  dialogueDrawerOpen: boolean;
  setDialogueDrawerOpen: (open: boolean) => void;
  activeDialogueThreadId: string;
  setActiveDialogueThreadId: (threadId: string) => void;
  activeView: AppViewMode;
  setActiveView: (view: AppViewMode) => void;

  // Selected categories for quote questionnaire
  selectedQuoteCategory: string | null;
  setSelectedQuoteCategory: (category: string | null) => void;
  selectedQuoteSubcategories: string[];
  setSelectedQuoteSubcategories: (subs: string[]) => void;

  // Notifications
  toasts: ToastNotification[];
  addToast: (message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [serviceAreas] = useState<ServiceArea[]>(INITIAL_SERVICE_AREAS);
  const [cleaningSupplies] = useState<CleaningSupply[]>(CLEANING_SUPPLIES);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);

  // Firebase Auth & Role Authorization state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authVersion, setAuthVersion] = useState<number>(0);
  const [hasAdminDoc, setHasAdminDoc] = useState<boolean>(false);
  const [hasStaffDoc, setHasStaffDoc] = useState<boolean>(false);
  const [ownStaffDoc, setOwnStaffDoc] = useState<StaffAccount | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Firestore-backed collections
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [customerProfileDoc, setCustomerProfileDoc] = useState<UserProfile | null>(null);
  const [customerProfileExists, setCustomerProfileExists] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [customerAppointments, setCustomerAppointments] = useState<Appointment[]>([]);
  const [techAppointments, setTechAppointments] = useState<Appointment[]>([]);
  const [adminAppointments, setAdminAppointments] = useState<Appointment[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [slotAvailabilityMap, setSlotAvailabilityMap] = useState<Record<string, SlotAvailability>>({});
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<StaffAccount[]>([]);

  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');

  // Modal & Navigation state
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [preselectedServiceForQuote, setPreselectedServiceForQuote] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [preselectedServiceForBooking, setPreselectedServiceForBooking] = useState<string | null>(null);
  const [dialogueDrawerOpen, setDialogueDrawerOpen] = useState<boolean>(false);
  const [activeDialogueThreadId, setActiveDialogueThreadId] = useState<string>('');
  const [activeView, setActiveView] = useState<AppViewMode>('home');
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<string | null>(null);
  const [selectedQuoteSubcategories, setSelectedQuoteSubcategories] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const todayLA = getSacramentoNow().dateStr;
  const tomorrowLA = addDaysToDateStr(todayLA, 1);

  const addToast = (message: string, type: ToastNotification['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAuthError = () => setAuthError(null);
  const clearFirestoreError = () => setFirestoreError(null);

  const reportFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const info = buildFirestoreErrorInfo(error, operationType, path);
    console.error('Firestore Error: ', JSON.stringify(info));
    setFirestoreError(formatFirestoreErrorMessage(error));
  };

  const isEmailVerified = Boolean(firebaseUser?.emailVerified);
  const isBootstrappedAdmin = Boolean(
    firebaseUser &&
      firebaseUser.emailVerified &&
      firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL
  );
  const isAdminAuthorized = Boolean(isEmailVerified && (isBootstrappedAdmin || hasAdminDoc));
  const isTechAuthorized = Boolean(isEmailVerified && (isAdminAuthorized || hasStaffDoc));

  // Combine scoped appointments safely without duplicates
  const appointments = useMemo(() => {
    if (isAdminAuthorized) {
      return adminAppointments;
    }
    const merged = new Map<string, Appointment>();
    customerAppointments.forEach((a) => merged.set(a.id, a));
    techAppointments.forEach((a) => merged.set(a.id, a));
    return Array.from(merged.values());
  }, [isAdminAuthorized, adminAppointments, customerAppointments, techAppointments]);

  // Dynamic assignable FieldTechnicians derived from Firestore /staff, own /staff/{uid}, or non-PII dispatchRoster
  const technicians: FieldTechnician[] = useMemo(() => {
    const countActive = (techId: string, techEmail?: string) =>
      appointments.filter(
        (a) =>
          a.status !== 'cancelled' &&
          a.status !== 'completed' &&
          (a.technicianId === techId ||
            (techEmail && a.technicianEmail?.toLowerCase() === techEmail.toLowerCase()))
      ).length;

    if (staffAccounts.length > 0) {
      return staffAccounts.map((st) => ({
        id: st.uid,
        name: st.name,
        phone: st.phone || businessInfo.phone,
        email: st.email,
        avatar: getInitials(st.name),
        activeJobsCount: countActive(st.uid, st.email),
        vehicle: st.vehicle || 'Sacramento Mobile Service Rig'
      }));
    }

    if (ownStaffDoc) {
      return [
        {
          id: ownStaffDoc.uid,
          name: ownStaffDoc.name,
          phone: ownStaffDoc.phone || businessInfo.phone,
          email: ownStaffDoc.email,
          avatar: getInitials(ownStaffDoc.name),
          activeJobsCount: countActive(ownStaffDoc.uid, ownStaffDoc.email),
          vehicle: ownStaffDoc.vehicle || 'Sacramento Mobile Service Rig'
        }
      ];
    }

    if (businessInfo.dispatchRoster.length > 0) {
      return businessInfo.dispatchRoster.map((entry) => ({
        id: entry.id,
        name: entry.name,
        phone: businessInfo.phone,
        email: '',
        avatar: getInitials(entry.name),
        activeJobsCount: countActive(entry.id),
        vehicle: entry.vehicle || 'Sacramento Mobile Service Rig'
      }));
    }

    return [];
  }, [staffAccounts, ownStaffDoc, businessInfo, appointments]);

  // Keep selectedTechnicianId aligned with dynamic technicians list
  useEffect(() => {
    if (technicians.length === 0) {
      if (selectedTechnicianId) setSelectedTechnicianId('');
      return;
    }
    if (!selectedTechnicianId || !technicians.some((t) => t.id === selectedTechnicianId)) {
      if (ownStaffDoc && technicians.some((t) => t.id === ownStaffDoc.uid)) {
        setSelectedTechnicianId(ownStaffDoc.uid);
      } else {
        setSelectedTechnicianId(technicians[0].id);
      }
    }
  }, [technicians, selectedTechnicianId, ownStaffDoc]);

  // Listen to Firebase Auth state and load /admins/{uid} & /staff/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setFirestoreError(null);

      if (!user) {
        setHasAdminDoc(false);
        setHasStaffDoc(false);
        setOwnStaffDoc(null);
        setCustomers([]);
        setCustomerProfileDoc(null);
        setCustomerProfileExists(false);
        setProfileLoading(false);
        setQuotes([]);
        setCustomerAppointments([]);
        setTechAppointments([]);
        setAdminAppointments([]);
        setPayments([]);
        setDialogueMessages([]);
        setAdminNotifications([]);
        setStaffAccounts([]);
        setAdminAccounts([]);
        setActiveDialogueThreadId('');
        setAuthReady(true);
        return;
      }

      setActiveDialogueThreadId((prev) => prev || user.uid);

      try {
        const [adminSnap, staffSnap] = await Promise.all([
          getDoc(doc(db, 'admins', user.uid)).catch(() => null),
          getDoc(doc(db, 'staff', user.uid)).catch(() => null)
        ]);

        setHasAdminDoc(Boolean(adminSnap?.exists() && adminSnap.data()?.role === 'admin'));
        const staffValid = Boolean(staffSnap?.exists() && staffSnap.data()?.role === 'technician');
        setHasStaffDoc(staffValid);
        const d = staffSnap?.data();
        if (staffValid && staffSnap && d) {
          setOwnStaffDoc({
            uid: staffSnap.id,
            email: String(d.email || ''),
            name: String(d.name || ''),
            role: 'technician',
            technicianId: d.technicianId ? String(d.technicianId) : staffSnap.id,
            phone: d.phone ? String(d.phone) : undefined,
            vehicle: d.vehicle ? String(d.vehicle) : undefined
          });
          setSelectedTechnicianId(staffSnap.id);
        } else {
          setOwnStaffDoc(null);
        }
      } catch (err) {
        reportFirestoreError(err, OperationType.GET, `admins/${user.uid}`);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Re-evaluate /admins/{uid} & /staff/{uid} when refreshAuthUser triggers authVersion increment
  useEffect(() => {
    if (authVersion === 0 || !firebaseUser) return;
    let active = true;
    const reloadRoles = async () => {
      const [adminSnap, staffSnap] = await Promise.all([
        getDoc(doc(db, 'admins', firebaseUser.uid)).catch(() => null),
        getDoc(doc(db, 'staff', firebaseUser.uid)).catch(() => null)
      ]);
      if (!active) return;
      setHasAdminDoc(Boolean(adminSnap?.exists() && adminSnap.data()?.role === 'admin'));
      const staffValid = Boolean(staffSnap?.exists() && staffSnap.data()?.role === 'technician');
      setHasStaffDoc(staffValid);
      const d = staffSnap?.data();
      if (staffValid && staffSnap && d) {
        setOwnStaffDoc({
          uid: staffSnap.id,
          email: String(d.email || ''),
          name: String(d.name || ''),
          role: 'technician',
          technicianId: d.technicianId ? String(d.technicianId) : staffSnap.id,
          phone: d.phone ? String(d.phone) : undefined,
          vehicle: d.vehicle ? String(d.vehicle) : undefined
        });
      } else {
        setOwnStaffDoc(null);
      }
    };
    void reloadRoles();
    return () => {
      active = false;
    };
  }, [authVersion, firebaseUser]);

  // 1. Public Blocked Slots, Slot Availability, and Business Info listeners (no PII)
  useEffect(() => {
    const unsubBlocked = onSnapshot(
      collection(db, 'blockedSlots'),
      (snap) => {
        const list: BlockedSlot[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            date: String(data.date || ''),
            timeSlot: data.timeSlot ? String(data.timeSlot) : 'All Day',
            reason: String(data.reason || '')
          };
        });
        setBlockedSlots(list);
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'blockedSlots')
    );

    const unsubAvailability = onSnapshot(
      collection(db, 'slotAvailability'),
      (snap) => {
        const map: Record<string, SlotAvailability> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          map[d.id] = {
            id: d.id,
            date: String(data.date || ''),
            timeSlot: String(data.timeSlot || ''),
            bookedCount: Number(data.bookedCount || 0),
            appointmentIds: Array.isArray(data.appointmentIds) ? data.appointmentIds.map(String) : [],
            bookedTechIds: Array.isArray(data.bookedTechIds) ? data.bookedTechIds.map(String) : []
          };
        });
        setSlotAvailabilityMap(map);
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'slotAvailability')
    );

    const unsubBusiness = onSnapshot(
      doc(db, 'siteConfig', 'business'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const roster: DispatchRosterEntry[] = Array.isArray(d.dispatchRoster)
            ? d.dispatchRoster
                .filter((r): r is DispatchRosterEntry => Boolean(r && typeof r.id === 'string' && typeof r.name === 'string'))
                .map((r) => ({ id: r.id, name: r.name, vehicle: r.vehicle }))
            : [];
          setBusinessInfo({
            id: 'business',
            companyName: String(d.companyName || DEFAULT_BUSINESS_INFO.companyName),
            phone: String(d.phone || DEFAULT_BUSINESS_INFO.phone),
            email: String(d.email || DEFAULT_BUSINESS_INFO.email),
            address: String(d.address || DEFAULT_BUSINESS_INFO.address),
            hoursSummary: String(d.hoursSummary || DEFAULT_BUSINESS_INFO.hoursSummary),
            daysOpen: String(d.daysOpen || DEFAULT_BUSINESS_INFO.daysOpen),
            dailyHours: String(d.dailyHours || DEFAULT_BUSINESS_INFO.dailyHours),
            hoursNote: String(d.hoursNote || DEFAULT_BUSINESS_INFO.hoursNote),
            crewCapacity: Math.max(1, Number(d.crewCapacity || DEFAULT_BUSINESS_INFO.crewCapacity)),
            dispatchRoster: roster
          });
        } else {
          setBusinessInfo(DEFAULT_BUSINESS_INFO);
        }
      },
      (err) => reportFirestoreError(err, OperationType.GET, 'siteConfig/business')
    );

    return () => {
      unsubBlocked();
      unsubAvailability();
      unsubBusiness();
    };
  }, []);

  // 2. Signed-in user profile document listener (/customers/{uid})
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setCustomerProfileDoc(null);
      setCustomerProfileExists(false);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const unsubProfile = onSnapshot(
      doc(db, 'customers', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCustomerProfileDoc({
            id: snap.id,
            name: String(data.name || ''),
            email: String(data.email || ''),
            phone: String(data.phone || ''),
            address: String(data.address || ''),
            role: 'customer',
            notes: data.notes ? String(data.notes) : ''
          });
          setCustomerProfileExists(true);
        } else {
          setCustomerProfileDoc(null);
          setCustomerProfileExists(false);
        }
        setProfileLoading(false);
      },
      (err) => {
        setProfileLoading(false);
        reportFirestoreError(err, OperationType.GET, `customers/${firebaseUser.uid}`);
      }
    );

    return () => unsubProfile();
  }, [authReady, firebaseUser]);

  // 3. Firestore collection listeners scoped strictly by authorization & firestore.rules
  useEffect(() => {
    if (!authReady || !firebaseUser) return;

    const unsubscribers: Array<() => void> = [];

    if (isAdminAuthorized) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'customers'),
          (snap) => {
            setCustomers(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  name: String(data.name || ''),
                  email: String(data.email || ''),
                  phone: String(data.phone || ''),
                  address: String(data.address || ''),
                  role: 'customer',
                  notes: data.notes ? String(data.notes) : ''
                };
              })
            );
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'customers')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'quotes'),
          (snap) => {
            setQuotes(snap.docs.map((d) => mapDocToQuote(d.id, d.data())));
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'quotes')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'appointments'),
          (snap) => {
            setAdminAppointments(snap.docs.map((d) => mapDocToAppointment(d.id, d.data())));
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'appointments')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'payments'),
          (snap) => {
            setPayments(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  appointmentId: String(data.appointmentId || ''),
                  customerName: String(data.customerName || ''),
                  amount: Number(data.amount || 0),
                  method: data.method || 'Credit Card',
                  status: data.status || 'paid',
                  transactionRef: String(data.transactionRef || ''),
                  date: String(data.date || ''),
                  notes: data.notes ? String(data.notes) : undefined
                };
              })
            );
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'payments')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'adminNotifications'),
          (snap) => {
            setAdminNotifications(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  type: data.type || 'quote_access',
                  title: String(data.title || ''),
                  customerName: String(data.customerName || ''),
                  customerEmail: String(data.customerEmail || ''),
                  customerPhone: String(data.customerPhone || ''),
                  serviceName: String(data.serviceName || ''),
                  propertyAddress: String(data.propertyAddress || ''),
                  squareFootage: typeof data.squareFootage === 'number' ? data.squareFootage : undefined,
                  estimatedPrice: typeof data.estimatedPrice === 'number' ? data.estimatedPrice : undefined,
                  timestamp: data.timestamp ? String(data.timestamp) : toDateString(data.createdAt),
                  read: Boolean(data.read),
                  notes: data.notes ? String(data.notes) : undefined
                };
              })
            );
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'adminNotifications')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'dialogueMessages'),
          (snap) => {
            const list = snap.docs.map((d) => mapDocToMessage(d.id, d.data()));
            list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
            setDialogueMessages(list);
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'dialogueMessages')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'staff'),
          (snap) => {
            setStaffAccounts(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  uid: d.id,
                  email: String(data.email || ''),
                  name: String(data.name || ''),
                  role: 'technician',
                  technicianId: data.technicianId ? String(data.technicianId) : d.id,
                  phone: data.phone ? String(data.phone) : undefined,
                  vehicle: data.vehicle ? String(data.vehicle) : undefined
                };
              })
            );
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'staff')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'admins'),
          (snap) => {
            setAdminAccounts(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  uid: d.id,
                  email: String(data.email || ''),
                  name: String(data.name || ''),
                  role: 'admin'
                };
              })
            );
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'admins')
        )
      );
    } else {
      // Customer-scoped queries
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'quotes'), where('customerId', '==', firebaseUser.uid)),
          (snap) => {
            setQuotes(snap.docs.map((d) => mapDocToQuote(d.id, d.data())));
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'quotes')
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'appointments'), where('customerId', '==', firebaseUser.uid)),
          (snap) => {
            setCustomerAppointments(snap.docs.map((d) => mapDocToAppointment(d.id, d.data())));
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'appointments')
        )
      );

      // Dialogue messages: own thread + assigned technician threads (merged)
      const ownMessagesMap = new Map<string, DialogueMessage>();
      const techIdMessagesMap = new Map<string, DialogueMessage>();
      const techEmailMessagesMap = new Map<string, DialogueMessage>();

      const flushDialogue = () => {
        const combined = new Map<string, DialogueMessage>();
        ownMessagesMap.forEach((v, k) => combined.set(k, v));
        techIdMessagesMap.forEach((v, k) => combined.set(k, v));
        techEmailMessagesMap.forEach((v, k) => combined.set(k, v));
        const list = Array.from(combined.values());
        list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        setDialogueMessages(list);
      };

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'dialogueMessages'), where('threadId', '==', firebaseUser.uid)),
          (snap) => {
            ownMessagesMap.clear();
            snap.docs.forEach((d) => ownMessagesMap.set(d.id, mapDocToMessage(d.id, d.data())));
            flushDialogue();
          },
          (err) => reportFirestoreError(err, OperationType.LIST, 'dialogueMessages')
        )
      );

      if (isTechAuthorized) {
        const lowerEmail = firebaseUser.email?.toLowerCase();
        const techByIdMap = new Map<string, Appointment>();
        const techByEmailMap = new Map<string, Appointment>();

        const flushTechAppts = () => {
          const combined = new Map<string, Appointment>();
          techByIdMap.forEach((v, k) => combined.set(k, v));
          techByEmailMap.forEach((v, k) => combined.set(k, v));
          setTechAppointments(Array.from(combined.values()));
        };

        unsubscribers.push(
          onSnapshot(
            query(collection(db, 'appointments'), where('technicianId', '==', firebaseUser.uid)),
            (snap) => {
              techByIdMap.clear();
              snap.docs.forEach((d) => techByIdMap.set(d.id, mapDocToAppointment(d.id, d.data())));
              flushTechAppts();
            },
            (err) => reportFirestoreError(err, OperationType.LIST, 'appointments')
          )
        );

        unsubscribers.push(
          onSnapshot(
            query(collection(db, 'dialogueMessages'), where('assignedTechIds', 'array-contains', firebaseUser.uid)),
            (snap) => {
              techIdMessagesMap.clear();
              snap.docs.forEach((d) => techIdMessagesMap.set(d.id, mapDocToMessage(d.id, d.data())));
              flushDialogue();
            },
            (err) => reportFirestoreError(err, OperationType.LIST, 'dialogueMessages')
          )
        );

        if (lowerEmail) {
          unsubscribers.push(
            onSnapshot(
              query(collection(db, 'appointments'), where('technicianEmail', '==', lowerEmail)),
              (snap) => {
                techByEmailMap.clear();
                snap.docs.forEach((d) => techByEmailMap.set(d.id, mapDocToAppointment(d.id, d.data())));
                flushTechAppts();
              },
              (err) => reportFirestoreError(err, OperationType.LIST, 'appointments')
            )
          );

          unsubscribers.push(
            onSnapshot(
              query(collection(db, 'dialogueMessages'), where('assignedTechEmails', 'array-contains', lowerEmail)),
              (snap) => {
                techEmailMessagesMap.clear();
                snap.docs.forEach((d) => techEmailMessagesMap.set(d.id, mapDocToMessage(d.id, d.data())));
                flushDialogue();
              },
              (err) => reportFirestoreError(err, OperationType.LIST, 'dialogueMessages')
            )
          );
        }
      } else {
        setTechAppointments([]);
      }
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [authReady, firebaseUser, isAdminAuthorized, isTechAuthorized]);

  // Derived active user profiles
  const adminProfile: UserProfile = {
    id: firebaseUser?.uid || 'admin',
    name: firebaseUser?.displayName || 'Dispatch Administrator',
    email: firebaseUser?.email || BOOTSTRAPPED_ADMIN_EMAIL,
    phone: businessInfo.phone,
    address: businessInfo.address,
    role: 'admin'
  };

  const currentUser: UserProfile = useMemo(() => {
    if (currentRole === 'admin' && isAdminAuthorized) {
      return adminProfile;
    }
    if (currentRole === 'technician' && ownStaffDoc) {
      return {
        id: ownStaffDoc.uid,
        name: ownStaffDoc.name,
        email: ownStaffDoc.email,
        phone: ownStaffDoc.phone || businessInfo.phone,
        address: businessInfo.address,
        role: 'technician'
      };
    }
    if (customerProfileDoc) {
      return {
        ...customerProfileDoc,
        role: isAdminAuthorized ? 'admin' : isTechAuthorized && currentRole === 'technician' ? 'technician' : 'customer'
      };
    }
    return {
      id: firebaseUser?.uid || '',
      name: firebaseUser?.displayName || '',
      email: firebaseUser?.email || '',
      phone: '',
      address: '',
      role: currentRole,
      notes: ''
    };
  }, [currentRole, isAdminAuthorized, isTechAuthorized, ownStaffDoc, customerProfileDoc, firebaseUser, businessInfo]);

  const setCurrentUser = (_user: UserProfile) => {
    // Derived from Firebase Auth + Firestore
  };

  const setActiveCustomerId = (id: string) => {
    setActiveDialogueThreadId(id);
  };

  // =========================================================================
  // Authentication Methods
  // =========================================================================

  // IMPORTANT: Call signInWithPopup synchronously on the first line before any await
  const signInWithGoogle = (
    _portalType?: 'customer' | 'technical' | 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    return signInWithPopup(auth, googleProvider)
      .then(() => {
        addToast('Signed in with Google successfully.', 'success');
        return { success: true };
      })
      .catch((error: unknown) => {
        const msg = getReadableAuthError(error);
        setAuthError(msg);
        addToast(msg, 'error');
        return { success: false, error: msg };
      });
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!cred.user.emailVerified) {
        addToast('Signed in. Please verify your email address to unlock saving records.', 'warning');
      } else {
        addToast('Signed in successfully.', 'success');
      }
      return { success: true };
    } catch (error) {
      const msg = getReadableAuthError(error);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const createAccountWithEmail = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await sendEmailVerification(cred.user);
      setFirebaseUser({ ...cred.user } as User);
      addToast(`Account created! Verification link sent to ${email.trim()}.`, 'success');
      return { success: true };
    } catch (error) {
      const msg = getReadableAuthError(error);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      addToast(`Verification email re-sent to ${auth.currentUser.email}.`, 'success');
    } catch (error) {
      addToast(getReadableAuthError(error), 'error');
    }
  };

  const refreshAuthUser = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      setFirebaseUser(auth.currentUser);
      setAuthVersion((v) => v + 1);
      if (auth.currentUser.emailVerified) {
        addToast('Email verified! Full portal features unlocked.', 'success');
      } else {
        addToast('Email is still unverified. Click the link in your inbox first.', 'warning');
      }
    } catch (error) {
      addToast(getReadableAuthError(error), 'error');
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addToast(`Password reset link sent to ${email.trim()}.`, 'success');
      return { success: true };
    } catch (error) {
      const msg = getReadableAuthError(error);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      addToast('Signed out successfully.', 'info');
    } catch (error) {
      addToast(getReadableAuthError(error), 'error');
    }
  };

  // Helper to persist non-PII business config + dispatch roster
  const saveBusinessConfigDoc = async (next: BusinessInfo): Promise<void> => {
    await setDoc(doc(db, 'siteConfig', 'business'), {
      id: 'business',
      companyName: next.companyName.trim().slice(0, 160),
      phone: next.phone.trim().slice(0, 30),
      email: next.email.trim().slice(0, 200),
      address: next.address.trim().slice(0, 300),
      hoursSummary: next.hoursSummary.trim().slice(0, 120),
      daysOpen: next.daysOpen.trim().slice(0, 120),
      dailyHours: next.dailyHours.trim().slice(0, 120),
      hoursNote: next.hoursNote.trim().slice(0, 500),
      crewCapacity: Math.max(1, Math.min(20, Math.round(next.crewCapacity || 1))),
      dispatchRoster: next.dispatchRoster.slice(0, 10).map((r) => ({
        id: r.id.slice(0, 80),
        name: r.name.slice(0, 120),
        ...(r.vehicle ? { vehicle: r.vehicle.slice(0, 160) } : {})
      })),
      updatedAt: serverTimestamp()
    });
  };

  const updateBusinessInfo = async (
    updates: Partial<BusinessInfo>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdminAuthorized) {
      return { success: false, error: 'Administrator verification required.' };
    }
    const merged: BusinessInfo = {
      ...businessInfo,
      ...updates,
      id: 'business'
    };
    if (!merged.companyName.trim() || !merged.phone.trim() || merged.phone.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'Company name and a valid phone number are required.' };
    }
    if (!merged.email.trim() || !merged.email.includes('@')) {
      return { success: false, error: 'A valid contact email address is required.' };
    }
    if (!merged.hoursSummary.trim() || !merged.daysOpen.trim() || !merged.dailyHours.trim()) {
      return { success: false, error: 'Operating hours and open days cannot be empty.' };
    }

    try {
      await saveBusinessConfigDoc(merged);
      addToast('Business contact & hours updated across website.', 'success');
      return { success: true };
    } catch (err) {
      reportFirestoreError(err, OperationType.WRITE, 'siteConfig/business');
      return { success: false, error: formatFirestoreErrorMessage(err) };
    }
  };

  // Staff / Technician RBAC management (Admin only) + non-PII dispatchRoster sync
  const grantStaffAccess = async (data: {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    vehicle?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isAdminAuthorized) {
      return { success: false, error: 'Administrator verification required.' };
    }
    const cleanUid = data.uid.trim();
    const cleanEmail = data.email.trim().toLowerCase().slice(0, 200);
    const cleanName = data.name.trim().slice(0, 120);
    const cleanPhone = (data.phone || '').trim().slice(0, 30);
    const cleanVehicle = (data.vehicle || 'Sacramento Mobile Service Rig').trim().slice(0, 160);

    if (!cleanUid || !/^[a-zA-Z0-9_-]+$/.test(cleanUid)) {
      return { success: false, error: 'Please provide a valid Firebase User UID (alphanumeric, hyphens, or underscores).' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid technician email address.' };
    }
    if (!cleanName) {
      return { success: false, error: 'Please provide the technician full name.' };
    }

    try {
      await setDoc(doc(db, 'staff', cleanUid), {
        uid: cleanUid,
        email: cleanEmail,
        name: cleanName,
        technicianId: cleanUid,
        ...(cleanPhone ? { phone: cleanPhone } : {}),
        vehicle: cleanVehicle,
        role: 'technician'
      });

      const updatedRoster: DispatchRosterEntry[] = [
        ...businessInfo.dispatchRoster.filter((r) => r.id !== cleanUid),
        { id: cleanUid, name: cleanName, vehicle: cleanVehicle }
      ].slice(0, 10);

      await saveBusinessConfigDoc({
        ...businessInfo,
        dispatchRoster: updatedRoster,
        crewCapacity: Math.max(1, updatedRoster.length)
      });

      addToast(`Granted field technician access to ${cleanName}.`, 'success');
      return { success: true };
    } catch (err) {
      reportFirestoreError(err, OperationType.WRITE, `staff/${cleanUid}`);
      return { success: false, error: formatFirestoreErrorMessage(err) };
    }
  };

  const revokeStaffAccess = async (uid: string) => {
    if (!isAdminAuthorized) return;
    try {
      await deleteDoc(doc(db, 'staff', uid));
      const updatedRoster = businessInfo.dispatchRoster.filter((r) => r.id !== uid);
      await saveBusinessConfigDoc({
        ...businessInfo,
        dispatchRoster: updatedRoster,
        crewCapacity: Math.max(1, updatedRoster.length)
      });
      addToast('Technician access revoked.', 'info');
    } catch (err) {
      reportFirestoreError(err, OperationType.DELETE, `staff/${uid}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  // =========================================================================
  // Portal Switching & Utilities
  // =========================================================================

  const switchToDedicatedView = (mode: 'client' | 'technical' | 'admin') => {
    if (mode === 'client') {
      setCurrentRole('customer');
      if (firebaseUser) setActiveDialogueThreadId(firebaseUser.uid);
      setActiveView('customer_portal');
    } else if (mode === 'technical') {
      setCurrentRole('technician');
      setActiveView('tech_portal');
    } else if (mode === 'admin') {
      setCurrentRole('admin');
      setActiveView('admin_dashboard');
    }
  };

  const handleSetRole = (role: UserRole) => {
    if (role === 'customer') switchToDedicatedView('client');
    else if (role === 'technician') switchToDedicatedView('technical');
    else if (role === 'admin') switchToDedicatedView('admin');
  };

  const calculateDirectPrice = (serviceId: string, sqFt: number, _addressOrZip?: string): DirectPriceBreakdown => {
    const srv = services.find((s) => s.id === serviceId) || services[0];
    const basePrice = Math.max(250, srv.basePrice || 250);
    const sqFtRate = srv.pricePerSqFt || 0.2;
    const extraSqFt = Math.max(0, sqFt - 500);
    const sqFtCost = Math.round(extraSqFt * sqFtRate);
    const totalDirectPrice = Math.max(250, basePrice + sqFtCost);

    return {
      basePrice,
      sqFt,
      sqFtRate,
      sqFtCost,
      visitFee: 0,
      visitFeeWaived: true,
      totalDirectPrice
    };
  };

  // Synchronizes /dialogueThreads/{customerId} and existing thread messages with active assigned technicians
  const syncDialogueThreadAccess = async (customerId: string): Promise<{ assignedTechIds: string[]; assignedTechEmails: string[] }> => {
    if (!customerId || !firebaseUser || !isEmailVerified) {
      return { assignedTechIds: [], assignedTechEmails: [] };
    }
    try {
      const apptSnap = await getDocs(query(collection(db, 'appointments'), where('customerId', '==', customerId)));
      const techIdSet = new Set<string>();
      const techEmailSet = new Set<string>();

      apptSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'cancelled') return;
        const tid = typeof data.technicianId === 'string' ? data.technicianId.trim() : '';
        if (tid && tid !== 'unassigned-dispatch') techIdSet.add(tid);
        const temail = typeof data.technicianEmail === 'string' ? data.technicianEmail.trim().toLowerCase() : '';
        if (temail) techEmailSet.add(temail);
      });

      const assignedTechIds = Array.from(techIdSet).slice(0, 10);
      const assignedTechEmails = Array.from(techEmailSet).slice(0, 10);

      await setDoc(doc(db, 'dialogueThreads', customerId), {
        threadId: customerId,
        assignedTechIds,
        assignedTechEmails,
        updatedAt: serverTimestamp()
      });

      const msgSnap = await getDocs(query(collection(db, 'dialogueMessages'), where('threadId', '==', customerId)));
      if (!msgSnap.empty) {
        const batch = writeBatch(db);
        let dirty = false;
        msgSnap.docs.forEach((mDoc) => {
          const mData = mDoc.data();
          const prevIds = JSON.stringify(mData.assignedTechIds || []);
          const prevEmails = JSON.stringify(mData.assignedTechEmails || []);
          if (prevIds !== JSON.stringify(assignedTechIds) || prevEmails !== JSON.stringify(assignedTechEmails)) {
            batch.update(mDoc.ref, { assignedTechIds, assignedTechEmails });
            dirty = true;
          }
        });
        if (dirty) {
          await batch.commit();
        }
      }

      return { assignedTechIds, assignedTechEmails };
    } catch {
      return { assignedTechIds: [], assignedTechEmails: [] };
    }
  };

  // Helper to ensure the signed-in user has a /customers/{uid} doc in Firestore (allows clearing optional address & notes)
  const upsertCustomerProfileDoc = async (
    targetUid: string,
    info: { name: string; email: string; phone: string; address?: string; notes?: string }
  ) => {
    const cleanName = (info.name || 'Customer').trim().slice(0, 120) || 'Customer';
    const cleanEmail = (info.email || 'customer@example.com').trim().slice(0, 200);
    const digits = (info.phone || '').replace(/\D/g, '');
    const cleanPhone = (digits.length >= 7 ? info.phone : '(916) 555-0100').trim().slice(0, 30);
    const cleanAddress = (info.address ?? '').trim().slice(0, 300);
    const cleanNotes = (info.notes ?? '').trim().slice(0, 1000);

    const ref = doc(db, 'customers', targetUid);
    const existingSnap = await getDoc(ref);

    if (existingSnap.exists()) {
      await updateDoc(ref, {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        ...(info.address !== undefined ? { address: cleanAddress } : {}),
        ...(info.notes !== undefined ? { notes: cleanNotes } : {}),
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(ref, {
        uid: targetUid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
        notes: cleanNotes,
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  };

  // =========================================================================
  // Firestore Mutations (Quotes, Appointments, Blocked Slots, CRM, Payments)
  // =========================================================================

  const sendDialogueMessage = async (
    threadId: string,
    customerName: string,
    senderRole: 'client' | 'admin' | 'technician',
    senderName: string,
    message: string,
    directPrice?: number,
    quoteId?: string,
    appointmentId?: string
  ): Promise<DialogueMessage | null> => {
    if (!firebaseUser || !isEmailVerified) {
      addToast('Please sign in with a verified email to send messages.', 'warning');
      return null;
    }

    const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const timestamp = `${getSacramentoNow().dateStr} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    const targetThread = senderRole === 'client' ? firebaseUser.uid : threadId || firebaseUser.uid;

    // Fetch thread access list so assigned technicians can see the full thread cleanly
    let assignedTechIds: string[] = [];
    let assignedTechEmails: string[] = [];
    try {
      const threadSnap = await getDoc(doc(db, 'dialogueThreads', targetThread));
      if (threadSnap.exists()) {
        const td = threadSnap.data();
        assignedTechIds = Array.isArray(td.assignedTechIds) ? td.assignedTechIds.slice(0, 10) : [];
        assignedTechEmails = Array.isArray(td.assignedTechEmails) ? td.assignedTechEmails.slice(0, 10) : [];
      }
    } catch {
      // Proceed cleanly if thread doc does not exist yet
    }

    const payload: Record<string, unknown> = {
      id: msgId,
      threadId: targetThread,
      customerName: (customerName || 'Customer').trim().slice(0, 120),
      senderRole,
      senderName: (senderName || 'User').trim().slice(0, 120),
      message: message.trim().slice(0, 2000),
      timestamp: timestamp.slice(0, 40),
      assignedTechIds,
      assignedTechEmails,
      createdAt: serverTimestamp()
    };

    if (quoteId) payload.quoteId = quoteId;
    if (appointmentId) payload.appointmentId = appointmentId;
    if (typeof directPrice === 'number' && !Number.isNaN(directPrice) && directPrice >= 0) {
      payload.directPrice = directPrice;
    }

    try {
      await setDoc(doc(db, 'dialogueMessages', msgId), payload);
      addToast('Message sent and saved to dialogue log.', 'success');
      return {
        id: msgId,
        threadId: targetThread,
        customerName: String(payload.customerName),
        senderRole,
        senderName: String(payload.senderName),
        message: String(payload.message),
        timestamp: String(payload.timestamp),
        quoteId,
        appointmentId,
        directPrice,
        assignedTechIds,
        assignedTechEmails
      };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `dialogueMessages/${msgId}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
      return null;
    }
  };

  const downloadDialogueTranscript = (threadId: string) => {
    const msgs = dialogueMessages.filter((m) => m.threadId === threadId);
    if (msgs.length === 0) {
      addToast('No dialogue found for this customer record.', 'warning');
      return;
    }

    const customerName = msgs[0]?.customerName || 'Customer';
    let content = `=======================================================\n`;
    content += `ALL YEAR PRESSURE WASHING - OFFICIAL DIALOGUE RECORD\n`;
    content += `Sacramento Operations Hub: ${businessInfo.address}\n`;
    content += `Customer Thread: ${customerName} (ID: ${threadId})\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `Phone: ${businessInfo.phone} | Yelp: ${YELP_PROFILE_URL}\n`;
    content += `=======================================================\n\n`;

    msgs.forEach((m, idx) => {
      content += `[${idx + 1}] ${m.timestamp} - ${m.senderName} (${m.senderRole.toUpperCase()}):\n`;
      content += `${m.message}\n`;
      if (m.directPrice !== undefined) {
        content += `>>> Quoted Price: $${m.directPrice}\n`;
      }
      content += `-------------------------------------------------------\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AllYearPW-Dialogue-${customerName.replace(/\s+/g, '_')}-${threadId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast(`Downloaded dialogue transcript for ${customerName}!`, 'success');
  };

  const copyDialogueTranscript = async (threadId: string): Promise<boolean> => {
    const msgs = dialogueMessages.filter((m) => m.threadId === threadId);
    if (msgs.length === 0) {
      addToast('No dialogue found to copy.', 'warning');
      return false;
    }

    const customerName = msgs[0]?.customerName || 'Customer';
    let text = `All Year Pressure Washing - Dialogue Transcript with ${customerName}\n`;
    msgs.forEach((m) => {
      text += `[${m.timestamp}] ${m.senderName}: ${m.message}${m.directPrice !== undefined ? ` (Estimate: $${m.directPrice})` : ''}\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      addToast('Dialogue copied to clipboard!', 'success');
      return true;
    } catch {
      addToast('Could not access clipboard automatically.', 'error');
      return false;
    }
  };

  const addReview = (newRevData: Omit<CustomerReview, 'id' | 'date' | 'avatarInitial'>) => {
    const newRev: CustomerReview = {
      ...newRevData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      avatarInitial: newRevData.author ? newRevData.author[0].toUpperCase() : 'H',
      source: 'direct'
    };
    setReviews((prev) => [newRev, ...prev]);
    addToast('Thank you for sharing your review!', 'success');
  };

  const markNotificationRead = async (id: string) => {
    if (!isAdminAuthorized) return;
    try {
      await updateDoc(doc(db, 'adminNotifications', id), { read: true });
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `adminNotifications/${id}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const clearNotification = async (id: string) => {
    if (!isAdminAuthorized) return;
    try {
      await deleteDoc(doc(db, 'adminNotifications', id));
    } catch (err) {
      reportFirestoreError(err, OperationType.DELETE, `adminNotifications/${id}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const isSlotAvailable = (
    date: string,
    timeSlot: string,
    excludeAppointmentId?: string,
    targetTechnicianId?: string
  ): { available: boolean; conflictReason?: string } => {
    if (!date || !timeSlot) {
      return { available: false, conflictReason: 'Please choose both a date and arrival window.' };
    }

    const nowLA = getSacramentoNow();
    if (date < nowLA.dateStr) {
      return {
        available: false,
        conflictReason: 'Cannot schedule an appointment on a past date.'
      };
    }

    if (date === nowLA.dateStr) {
      const slotStartMinutes = parseSlotStartMinutes(timeSlot);
      if (slotStartMinutes !== null && nowLA.minutesSinceMidnight >= slotStartMinutes) {
        return {
          available: false,
          conflictReason: `The ${timeSlot} window has already passed for today (Sacramento time).`
        };
      }
    }

    const blocked = blockedSlots.find((b) => b.date === date && (b.timeSlot === 'All Day' || b.timeSlot === timeSlot));
    if (blocked) {
      return {
        available: false,
        conflictReason: `Unavailable — blocked by dispatch administration (${blocked.reason}).`
      };
    }

    const slotKey = toSlotKey(date, timeSlot);
    const sharedSlot = slotAvailabilityMap[slotKey];

    const existingActiveLocal = appointments.filter(
      (a) =>
        a.scheduledDate === date &&
        a.scheduledTime === timeSlot &&
        a.status !== 'cancelled' &&
        a.id !== excludeAppointmentId
    );

    const activeIds = new Set<string>(existingActiveLocal.map((a) => a.id));
    if (sharedSlot) {
      sharedSlot.appointmentIds.forEach((aid) => {
        if (aid !== excludeAppointmentId) activeIds.add(aid);
      });
    }

    const effectiveCapacity = Math.max(1, technicians.length || businessInfo.crewCapacity || 1);

    if (targetTechnicianId && targetTechnicianId !== 'unassigned-dispatch') {
      const localTechBusy = existingActiveLocal.some((a) => a.technicianId === targetTechnicianId);
      const sharedTechBusy = Boolean(
        sharedSlot &&
          !excludeAppointmentId &&
          sharedSlot.bookedTechIds.includes(targetTechnicianId)
      );
      if (localTechBusy || sharedTechBusy) {
        return {
          available: false,
          conflictReason: `Selected technician is already committed during this slot (${timeSlot}).`
        };
      }
    }

    if (activeIds.size >= effectiveCapacity) {
      return {
        available: false,
        conflictReason: `All Sacramento service crews are booked for ${date} at ${timeSlot}. Please select another time.`
      };
    }

    return { available: true };
  };

  // Feature 1, 9, 14: No automatic price assigned on newly submitted quotes; persist compressed photos
  const submitQuoteRequest = async (
    quoteData: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<QuoteRequest | null> => {
    if (!firebaseUser || !isEmailVerified) {
      addToast('Please sign in with a verified email address to submit a quote request.', 'warning');
      return null;
    }

    const ownerUid = firebaseUser.uid;
    const quoteId = `Q-${Date.now()}`;
    const createdDate = getSacramentoNow().dateStr;
    const sanitizedPhotos = (quoteData.photos || [])
      .filter((p): p is string => typeof p === 'string' && p.length <= 160000)
      .slice(0, 5);

    const payload: Record<string, unknown> = {
      id: quoteId,
      customerId: ownerUid,
      customerName: quoteData.customerName.trim().slice(0, 120),
      email: quoteData.email.trim().slice(0, 200),
      phone: quoteData.phone.trim().slice(0, 30),
      serviceId: quoteData.serviceId.trim().slice(0, 80),
      serviceName: quoteData.serviceName.trim().slice(0, 160),
      propertyAddress: quoteData.propertyAddress.trim().slice(0, 300),
      photos: sanitizedPhotos,
      photoCount: sanitizedPhotos.length,
      status: 'new',
      createdDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (quoteData.mainCategory) payload.mainCategory = quoteData.mainCategory.slice(0, 120);
    if (quoteData.subcategories?.length) payload.subcategories = quoteData.subcategories.slice(0, 10).map((s) => s.slice(0, 120));
    if (quoteData.removalNeeds?.length) payload.removalNeeds = quoteData.removalNeeds.slice(0, 10).map((s) => s.slice(0, 120));
    if (quoteData.otherRemovalDetails) payload.otherRemovalDetails = quoteData.otherRemovalDetails.slice(0, 500);
    if (quoteData.timingPreference) payload.timingPreference = quoteData.timingPreference;
    if (quoteData.timingPreference === 'specific_date' && quoteData.preferredDate) {
      payload.preferredDate = quoteData.preferredDate.slice(0, 20);
    }
    if (quoteData.streetAddress) payload.streetAddress = quoteData.streetAddress.slice(0, 200);
    if (quoteData.city) payload.city = quoteData.city.slice(0, 100);
    if (quoteData.state) payload.state = quoteData.state.slice(0, 30);
    if (quoteData.zipCode) payload.zipCode = quoteData.zipCode.slice(0, 20);
    if (quoteData.areaDescription) payload.areaDescription = quoteData.areaDescription.slice(0, 2000);
    if (typeof quoteData.squareFootage === 'number' && !Number.isNaN(quoteData.squareFootage) && quoteData.squareFootage >= 0) {
      payload.squareFootage = quoteData.squareFootage;
    }

    try {
      await upsertCustomerProfileDoc(ownerUid, {
        name: quoteData.customerName,
        email: quoteData.email,
        phone: quoteData.phone,
        address: quoteData.propertyAddress
      });

      await setDoc(doc(db, 'quotes', quoteId), payload);

      const notifId = `notif-${Date.now()}`;
      const notifPayload: Record<string, unknown> = {
        id: notifId,
        customerId: ownerUid,
        type: 'quote_access',
        title: `Quote Request: ${quoteData.serviceName}`.slice(0, 160),
        customerName: quoteData.customerName.trim().slice(0, 120),
        customerEmail: quoteData.email.trim().slice(0, 200),
        customerPhone: quoteData.phone.trim().slice(0, 30),
        serviceName: quoteData.serviceName.trim().slice(0, 160),
        propertyAddress: quoteData.propertyAddress.trim().slice(0, 300),
        timestamp: 'Just now',
        read: false,
        notes: 'Customer submitted quote request. Owner review required before setting estimate.',
        createdAt: serverTimestamp()
      };
      if (typeof quoteData.squareFootage === 'number' && !Number.isNaN(quoteData.squareFootage)) {
        notifPayload.squareFootage = quoteData.squareFootage;
      }
      await setDoc(doc(db, 'adminNotifications', notifId), notifPayload);

      await sendDialogueMessage(
        ownerUid,
        quoteData.customerName,
        'client',
        quoteData.customerName,
        `Submitted quote request for ${quoteData.serviceName} at ${quoteData.propertyAddress}. Awaiting owner review and personalized estimate.`,
        undefined,
        quoteId
      );

      addToast('Quote request submitted! The owner will review and provide your estimate.', 'success');
      return {
        ...quoteData,
        photos: sanitizedPhotos,
        photoCount: sanitizedPhotos.length,
        id: quoteId,
        customerId: ownerUid,
        status: 'new',
        createdAt: createdDate
      };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `quotes/${quoteId}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
      return null;
    }
  };

  const updateQuoteStatus = async (
    quoteId: string,
    status: QuoteRequest['status'],
    estimatedPrice?: number,
    adminNotes?: string
  ) => {
    if (!isAdminAuthorized) return;
    try {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp()
      };
      if (typeof estimatedPrice === 'number' && !Number.isNaN(estimatedPrice) && estimatedPrice >= 0) {
        updates.estimatedPrice = estimatedPrice;
      }
      if (adminNotes !== undefined) {
        updates.adminNotes = adminNotes.slice(0, 1000);
      }
      await updateDoc(doc(db, 'quotes', quoteId), updates);
      addToast(`Quote #${quoteId} status updated to: ${status.toUpperCase()}`, 'info');
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `quotes/${quoteId}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const convertQuoteToAppointment = async (
    quoteId: string,
    scheduledDate: string,
    scheduledTime: string,
    technicianId: string
  ): Promise<Appointment | null> => {
    if (!isAdminAuthorized) return null;
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    const tech = technicians.find((t) => t.id === technicianId) || technicians[0];
    if (!tech) {
      addToast('No authorized field technician available. Add a technician under Security & Roles first.', 'error');
      return null;
    }

    const avail = isSlotAvailable(scheduledDate, scheduledTime, undefined, tech.id);
    if (!avail.available) {
      addToast(avail.conflictReason || 'Selected time slot is unavailable.', 'error');
      return null;
    }

    const apptId = `APT-${Date.now()}`;
    const customerId = quote.customerId || firebaseUser?.uid || '';
    if (!customerId) return null;
    const price = Math.max(250, quote.estimatedPrice || 250);
    const slotKey = toSlotKey(scheduledDate, scheduledTime);

    const payload: Record<string, unknown> = {
      id: apptId,
      quoteId: quote.id,
      customerId,
      customerName: quote.customerName.slice(0, 120),
      customerEmail: quote.email.slice(0, 200),
      customerPhone: quote.phone.slice(0, 30),
      serviceId: quote.serviceId.slice(0, 80),
      serviceName: quote.serviceName.slice(0, 160),
      serviceAddress: quote.propertyAddress.slice(0, 300),
      scheduledDate,
      scheduledTime,
      technicianId: tech.id,
      technicianName: tech.name,
      ...(tech.email ? { technicianEmail: tech.email.toLowerCase() } : {}),
      status: 'scheduled',
      notes: `Converted from Quote #${quote.id}. ${quote.areaDescription || ''}`.slice(0, 1000),
      price,
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (typeof quote.squareFootage === 'number') {
      payload.squareFootage = quote.squareFootage;
    }

    try {
      await runTransaction(db, async (tx) => {
        const slotRef = doc(db, 'slotAvailability', slotKey);
        const siteRef = doc(db, 'siteConfig', 'business');
        const [slotSnap, siteSnap] = await Promise.all([tx.get(slotRef), tx.get(siteRef)]);

        const capacity = Math.max(
          1,
          Number(siteSnap.exists() ? siteSnap.data()?.crewCapacity : technicians.length || businessInfo.crewCapacity || 1)
        );
        const currentIds: string[] = slotSnap.exists() && Array.isArray(slotSnap.data()?.appointmentIds)
          ? slotSnap.data()!.appointmentIds
          : [];
        const currentTechIds: string[] = slotSnap.exists() && Array.isArray(slotSnap.data()?.bookedTechIds)
          ? slotSnap.data()!.bookedTechIds
          : [];

        if (currentTechIds.includes(tech.id)) {
          throw new Error(`${tech.name} is already booked for ${scheduledDate} (${scheduledTime}).`);
        }
        if (currentIds.length >= capacity) {
          throw new Error(`All crews are booked for ${scheduledDate} (${scheduledTime}).`);
        }

        const nextIds = [...currentIds, apptId];
        const nextTechIds = [...currentTechIds, tech.id];

        tx.set(slotRef, {
          id: slotKey,
          date: scheduledDate,
          timeSlot: scheduledTime,
          bookedCount: nextIds.length,
          appointmentIds: nextIds,
          bookedTechIds: nextTechIds,
          updatedAt: serverTimestamp()
        });
        tx.set(doc(db, 'appointments', apptId), payload);
        tx.update(doc(db, 'quotes', quoteId), {
          status: 'accepted',
          updatedAt: serverTimestamp()
        });
      });

      await syncDialogueThreadAccess(customerId);
      await sendDialogueMessage(
        customerId,
        quote.customerName,
        'admin',
        adminProfile.name,
        `Appointment confirmed for ${scheduledDate} (${scheduledTime}) with ${tech.name}. Service estimate: $${price}.`,
        price,
        quote.id,
        apptId
      );
      addToast(`Appointment #${apptId} successfully created from Quote #${quoteId}!`, 'success');
      return {
        id: apptId,
        quoteId: quote.id,
        customerId,
        customerName: String(payload.customerName),
        customerEmail: String(payload.customerEmail),
        customerPhone: String(payload.customerPhone),
        serviceId: String(payload.serviceId),
        serviceName: String(payload.serviceName),
        serviceAddress: String(payload.serviceAddress),
        scheduledDate,
        scheduledTime,
        technicianId: tech.id,
        technicianName: tech.name,
        technicianEmail: tech.email ? tech.email.toLowerCase() : undefined,
        status: 'scheduled',
        notes: String(payload.notes),
        price,
        squareFootage: quote.squareFootage,
        paymentStatus: 'pending'
      };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `appointments/${apptId}`);
      addToast(err instanceof Error ? err.message : formatFirestoreErrorMessage(err), 'error');
      return null;
    }
  };

  const bookAppointment = async (bookingData: {
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceAddress: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
    squareFootage?: number;
  }): Promise<{ success: boolean; appointment?: Appointment; error?: string }> => {
    if (!firebaseUser || !isEmailVerified) {
      return { success: false, error: 'Please sign in with a verified email address to confirm an appointment.' };
    }

    const availability = isSlotAvailable(bookingData.scheduledDate, bookingData.scheduledTime);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

    const ownerUid = firebaseUser.uid;
    const service = services.find((s) => s.id === bookingData.serviceId);
    const breakdown = calculateDirectPrice(
      bookingData.serviceId,
      bookingData.squareFootage || 600,
      bookingData.serviceAddress
    );

    const apptId = `APT-${Date.now()}`;
    const serviceName = (service ? service.name : 'Pressure Washing Service').slice(0, 160);
    const slotKey = toSlotKey(bookingData.scheduledDate, bookingData.scheduledTime);

    try {
      await upsertCustomerProfileDoc(ownerUid, {
        name: bookingData.customerName,
        email: bookingData.customerEmail,
        phone: bookingData.customerPhone,
        address: bookingData.serviceAddress
      });

      const bookedTech = await runTransaction(db, async (tx) => {
        const slotRef = doc(db, 'slotAvailability', slotKey);
        const siteRef = doc(db, 'siteConfig', 'business');
        const [slotSnap, siteSnap] = await Promise.all([tx.get(slotRef), tx.get(siteRef)]);

        const roster: DispatchRosterEntry[] =
          siteSnap.exists() && Array.isArray(siteSnap.data()?.dispatchRoster)
            ? siteSnap.data()!.dispatchRoster
            : technicians.map((t) => ({ id: t.id, name: t.name, vehicle: t.vehicle }));

        const capacity = Math.max(
          1,
          Number(siteSnap.exists() ? siteSnap.data()?.crewCapacity : roster.length || businessInfo.crewCapacity || 1)
        );

        const currentIds: string[] = slotSnap.exists() && Array.isArray(slotSnap.data()?.appointmentIds)
          ? slotSnap.data()!.appointmentIds
          : [];
        const currentTechIds: string[] = slotSnap.exists() && Array.isArray(slotSnap.data()?.bookedTechIds)
          ? slotSnap.data()!.bookedTechIds
          : [];

        if (currentIds.length >= capacity) {
          throw new Error(`All Sacramento service crews are booked for ${bookingData.scheduledDate} at ${bookingData.scheduledTime}.`);
        }

        const freeRosterTech = roster.find((r) => !currentTechIds.includes(r.id)) || roster[0];
        const techId = freeRosterTech?.id || 'unassigned-dispatch';
        const techName = freeRosterTech?.name || 'Sacramento Dispatch Crew';
        const knownTech = technicians.find((t) => t.id === techId);

        const nextIds = [...currentIds, apptId];
        const nextTechIds = techId !== 'unassigned-dispatch' ? [...currentTechIds, techId] : currentTechIds;

        const payload: Record<string, unknown> = {
          id: apptId,
          customerId: ownerUid,
          customerName: bookingData.customerName.trim().slice(0, 120),
          customerEmail: bookingData.customerEmail.trim().slice(0, 200),
          customerPhone: bookingData.customerPhone.trim().slice(0, 30),
          serviceId: bookingData.serviceId.slice(0, 80),
          serviceName,
          serviceAddress: bookingData.serviceAddress.trim().slice(0, 300),
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: bookingData.scheduledTime,
          technicianId: techId,
          technicianName: techName,
          ...(knownTech?.email ? { technicianEmail: knownTech.email.toLowerCase() } : {}),
          status: 'scheduled',
          price: breakdown.totalDirectPrice,
          paymentStatus: 'pending',
          squareFootage: bookingData.squareFootage || 600,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        if (bookingData.notes?.trim()) {
          payload.notes = bookingData.notes.trim().slice(0, 1000);
        }

        tx.set(slotRef, {
          id: slotKey,
          date: bookingData.scheduledDate,
          timeSlot: bookingData.scheduledTime,
          bookedCount: nextIds.length,
          appointmentIds: nextIds,
          bookedTechIds: nextTechIds,
          updatedAt: serverTimestamp()
        });
        tx.set(doc(db, 'appointments', apptId), payload);

        return { techId, techName, techEmail: knownTech?.email?.toLowerCase(), notes: payload.notes ? String(payload.notes) : undefined };
      });

      await syncDialogueThreadAccess(ownerUid);
      await sendDialogueMessage(
        ownerUid,
        bookingData.customerName,
        'client',
        bookingData.customerName,
        `Booked appointment for ${bookingData.scheduledDate} at ${bookingData.scheduledTime}. Address: ${bookingData.serviceAddress}.`,
        breakdown.totalDirectPrice,
        undefined,
        apptId
      );

      addToast(`Appointment #${apptId} booked successfully for ${bookingData.scheduledDate}!`, 'success');
      return {
        success: true,
        appointment: {
          id: apptId,
          customerId: ownerUid,
          customerName: bookingData.customerName.trim().slice(0, 120),
          customerEmail: bookingData.customerEmail.trim().slice(0, 200),
          customerPhone: bookingData.customerPhone.trim().slice(0, 30),
          serviceId: bookingData.serviceId.slice(0, 80),
          serviceName,
          serviceAddress: bookingData.serviceAddress.trim().slice(0, 300),
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: bookingData.scheduledTime,
          technicianId: bookedTech.techId,
          technicianName: bookedTech.techName,
          technicianEmail: bookedTech.techEmail,
          status: 'scheduled',
          notes: bookedTech.notes,
          squareFootage: bookingData.squareFootage || 600,
          price: breakdown.totalDirectPrice,
          paymentStatus: 'pending'
        }
      };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `appointments/${apptId}`);
      const msg = err instanceof Error ? err.message : formatFirestoreErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  const modifyAppointment = async (
    id: string,
    date: string,
    time: string,
    technicianId?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const existing = appointments.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Appointment not found' };

    const targetTechId = technicianId || existing.technicianId;
    const availability = isSlotAvailable(date, time, id, targetTechId);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

    const techObj = isAdminAuthorized && technicianId ? technicians.find((t) => t.id === technicianId) : null;
    const oldSlotKey = toSlotKey(existing.scheduledDate, existing.scheduledTime);
    const newSlotKey = toSlotKey(date, time);
    const sameSlot = oldSlotKey === newSlotKey;

    try {
      await runTransaction(db, async (tx) => {
        const apptRef = doc(db, 'appointments', id);
        const oldSlotRef = doc(db, 'slotAvailability', oldSlotKey);
        const newSlotRef = doc(db, 'slotAvailability', newSlotKey);
        const siteRef = doc(db, 'siteConfig', 'business');

        const reads = sameSlot
          ? await Promise.all([tx.get(apptRef), tx.get(oldSlotRef), tx.get(siteRef)])
          : await Promise.all([tx.get(apptRef), tx.get(oldSlotRef), tx.get(siteRef), tx.get(newSlotRef)]);

        const apptSnap = reads[0];
        const oldSlotSnap = reads[1];
        const siteSnap = reads[2];
        const newSlotSnap = sameSlot ? reads[1] : reads[3];

        if (!apptSnap.exists()) {
          throw new Error('Appointment record no longer exists.');
        }

        const currentAppt = apptSnap.data();
        const prevTechId = String(currentAppt.technicianId || '');
        const nextTechId = techObj ? techObj.id : prevTechId;
        const capacity = Math.max(
          1,
          Number(siteSnap.exists() ? siteSnap.data()?.crewCapacity : technicians.length || businessInfo.crewCapacity || 1)
        );

        if (sameSlot) {
          const curIds: string[] = oldSlotSnap.exists() && Array.isArray(oldSlotSnap.data()?.appointmentIds)
            ? oldSlotSnap.data()!.appointmentIds
            : [];
          const curTechs: string[] = oldSlotSnap.exists() && Array.isArray(oldSlotSnap.data()?.bookedTechIds)
            ? oldSlotSnap.data()!.bookedTechIds
            : [];

          let updatedTechs = [...curTechs];
          if (techObj && prevTechId !== nextTechId) {
            const removeIdx = updatedTechs.indexOf(prevTechId);
            if (removeIdx !== -1) updatedTechs.splice(removeIdx, 1);
            if (updatedTechs.includes(nextTechId)) {
              throw new Error(`${techObj.name} is already committed to another job during ${time}.`);
            }
            if (nextTechId !== 'unassigned-dispatch') updatedTechs.push(nextTechId);
          }

          const finalIds = curIds.includes(id) ? curIds : [...curIds, id];
          tx.set(oldSlotRef, {
            id: oldSlotKey,
            date,
            timeSlot: time,
            bookedCount: finalIds.length,
            appointmentIds: finalIds,
            bookedTechIds: updatedTechs,
            updatedAt: serverTimestamp()
          });
        } else {
          const newSlotData = newSlotSnap?.exists() ? newSlotSnap.data() : undefined;
          const newIds: string[] = newSlotData && Array.isArray(newSlotData.appointmentIds)
            ? newSlotData.appointmentIds.filter((x: string) => x !== id)
            : [];
          const newTechs: string[] = newSlotData && Array.isArray(newSlotData.bookedTechIds)
            ? [...newSlotData.bookedTechIds]
            : [];

          if (newIds.length >= capacity) {
            throw new Error(`All Sacramento service crews are booked for ${date} at ${time}.`);
          }
          if (nextTechId && nextTechId !== 'unassigned-dispatch' && newTechs.includes(nextTechId)) {
            throw new Error(`Assigned technician is already booked during ${date} (${time}).`);
          }

          // Remove from old slot if present
          if (oldSlotSnap.exists()) {
            const oldIds: string[] = (oldSlotSnap.data()?.appointmentIds || []).filter((x: string) => x !== id);
            const oldTechs: string[] = Array.isArray(oldSlotSnap.data()?.bookedTechIds)
              ? [...oldSlotSnap.data()!.bookedTechIds]
              : [];
            const removeIdx = prevTechId ? oldTechs.indexOf(prevTechId) : -1;
            if (removeIdx !== -1) oldTechs.splice(removeIdx, 1);
            tx.set(oldSlotRef, {
              id: oldSlotKey,
              date: String(currentAppt.scheduledDate || existing.scheduledDate),
              timeSlot: String(currentAppt.scheduledTime || existing.scheduledTime),
              bookedCount: oldIds.length,
              appointmentIds: oldIds,
              bookedTechIds: oldTechs,
              updatedAt: serverTimestamp()
            });
          }

          const nextNewIds = [...newIds, id];
          const nextNewTechs = nextTechId && nextTechId !== 'unassigned-dispatch' ? [...newTechs, nextTechId] : newTechs;
          tx.set(newSlotRef, {
            id: newSlotKey,
            date,
            timeSlot: time,
            bookedCount: nextNewIds.length,
            appointmentIds: nextNewIds,
            bookedTechIds: nextNewTechs,
            updatedAt: serverTimestamp()
          });
        }

        const updates: Record<string, unknown> = {
          scheduledDate: date,
          scheduledTime: time,
          updatedAt: serverTimestamp()
        };
        if (techObj) {
          updates.technicianId = techObj.id;
          updates.technicianName = techObj.name;
          if (techObj.email) updates.technicianEmail = techObj.email.toLowerCase();
        }
        if (notes !== undefined) {
          updates.notes = notes.slice(0, 1000);
        }
        tx.update(apptRef, updates);
      });

      await syncDialogueThreadAccess(existing.customerId);
      addToast(`Appointment #${id} updated to ${date} (${time})`, 'success');
      return { success: true };
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      const msg = err instanceof Error ? err.message : formatFirestoreErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    const existing = appointments.find((a) => a.id === id);
    try {
      await runTransaction(db, async (tx) => {
        const apptRef = doc(db, 'appointments', id);
        const apptSnap = await tx.get(apptRef);
        if (!apptSnap.exists()) return;
        const data = apptSnap.data();
        const slotKey = toSlotKey(String(data.scheduledDate || ''), String(data.scheduledTime || ''));
        const slotRef = doc(db, 'slotAvailability', slotKey);
        const slotSnap = await tx.get(slotRef);

        if (slotSnap.exists()) {
          const curIds: string[] = Array.isArray(slotSnap.data()?.appointmentIds)
            ? slotSnap.data()!.appointmentIds.filter((x: string) => x !== id)
            : [];
          const curTechs: string[] = Array.isArray(slotSnap.data()?.bookedTechIds)
            ? [...slotSnap.data()!.bookedTechIds]
            : [];
          const tid = String(data.technicianId || '');
          const idx = tid ? curTechs.indexOf(tid) : -1;
          if (idx !== -1) curTechs.splice(idx, 1);

          tx.set(slotRef, {
            id: slotKey,
            date: String(data.scheduledDate || ''),
            timeSlot: String(data.scheduledTime || ''),
            bookedCount: curIds.length,
            appointmentIds: curIds,
            bookedTechIds: curTechs,
            updatedAt: serverTimestamp()
          });
        }

        tx.update(apptRef, {
          status: 'cancelled',
          cancellationReason: (reason || 'Cancelled by customer').slice(0, 500),
          updatedAt: serverTimestamp()
        });
      });

      if (existing?.customerId) {
        await syncDialogueThreadAccess(existing.customerId);
      }
      addToast(`Appointment #${id} has been cancelled.`, 'info');
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const addManualAppointment = async (
    data: Omit<Appointment, 'id' | 'status' | 'paymentStatus'>
  ): Promise<{ success: boolean; error?: string; appointment?: Appointment }> => {
    if (!isAdminAuthorized) {
      return { success: false, error: 'Administrator verification required.' };
    }

    const tech = technicians.find((t) => t.id === data.technicianId) || technicians[0];
    if (!tech) {
      return { success: false, error: 'No authorized field technician available. Add a technician under Security & Roles first.' };
    }

    const availability = isSlotAvailable(data.scheduledDate, data.scheduledTime, undefined, tech.id);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

    const cleanCustomerId = (data.customerId || `cust-manual-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-');
    const cleanEmail = (data.customerEmail || 'phone.customer@example.com').trim().slice(0, 200);
    const cleanPhone = (data.customerPhone || '(916) 555-0100').trim().slice(0, 30);
    const apptId = `APT-${Date.now()}`;
    const slotKey = toSlotKey(data.scheduledDate, data.scheduledTime);

    const payload: Record<string, unknown> = {
      id: apptId,
      customerId: cleanCustomerId,
      customerName: data.customerName.trim().slice(0, 120),
      customerEmail: cleanEmail,
      customerPhone: cleanPhone,
      serviceId: data.serviceId.slice(0, 80),
      serviceName: data.serviceName.slice(0, 160),
      serviceAddress: data.serviceAddress.trim().slice(0, 300),
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      technicianId: tech.id,
      technicianName: tech.name,
      ...(tech.email ? { technicianEmail: tech.email.toLowerCase() } : {}),
      status: 'scheduled',
      price: Number(data.price || 250),
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (data.notes?.trim()) payload.notes = data.notes.trim().slice(0, 1000);

    try {
      await upsertCustomerProfileDoc(cleanCustomerId, {
        name: data.customerName,
        email: cleanEmail,
        phone: cleanPhone,
        address: data.serviceAddress
      });

      await runTransaction(db, async (tx) => {
        const slotRef = doc(db, 'slotAvailability', slotKey);
        const siteRef = doc(db, 'siteConfig', 'business');
        const [slotSnap, siteSnap] = await Promise.all([tx.get(slotRef), tx.get(siteRef)]);

        const capacity = Math.max(
          1,
          Number(siteSnap.exists() ? siteSnap.data()?.crewCapacity : technicians.length || businessInfo.crewCapacity || 1)
        );
        const currentIds: string[] = slotSnap.exists() && Array.isArray(slotSnap.data()?.appointmentIds)
          ? slotSnap.data()!.appointmentIds
          : [];
        const currentTechIds: string[] = slotSnap.exists() && Array.isArray(slotSnap.data()?.bookedTechIds)
          ? slotSnap.data()!.bookedTechIds
          : [];

        if (currentTechIds.includes(tech.id)) {
          throw new Error(`${tech.name} is already scheduled during ${data.scheduledDate} (${data.scheduledTime}).`);
        }
        if (currentIds.length >= capacity) {
          throw new Error(`All crews are booked for ${data.scheduledDate} (${data.scheduledTime}).`);
        }

        const nextIds = [...currentIds, apptId];
        const nextTechIds = [...currentTechIds, tech.id];

        tx.set(slotRef, {
          id: slotKey,
          date: data.scheduledDate,
          timeSlot: data.scheduledTime,
          bookedCount: nextIds.length,
          appointmentIds: nextIds,
          bookedTechIds: nextTechIds,
          updatedAt: serverTimestamp()
        });
        tx.set(doc(db, 'appointments', apptId), payload);
      });

      await syncDialogueThreadAccess(cleanCustomerId);
      addToast(`Manual appointment #${apptId} registered on dispatch schedule!`, 'success');
      return {
        success: true,
        appointment: {
          ...data,
          customerId: cleanCustomerId,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          technicianId: tech.id,
          technicianName: tech.name,
          technicianEmail: tech.email ? tech.email.toLowerCase() : undefined,
          id: apptId,
          status: 'scheduled',
          paymentStatus: 'pending'
        }
      };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `appointments/${apptId}`);
      const msg = err instanceof Error ? err.message : formatFirestoreErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  const markAppointmentCompleted = async (id: string, techNotes?: string) => {
    const now = new Date();
    const timeStr = `${getSacramentoNow().dateStr} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    const updates: Record<string, unknown> = {
      status: 'completed',
      completedAt: timeStr.slice(0, 40),
      updatedAt: serverTimestamp()
    };
    if (techNotes !== undefined) {
      updates.technicianNotes = techNotes.slice(0, 1000);
    }

    try {
      await updateDoc(doc(db, 'appointments', id), updates);
      addToast(`Appointment #${id} marked as COMPLETED. Service history updated.`, 'success');
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const updateTechnicianJobStatus = async (id: string, status: Appointment['status'], technicianNotes?: string) => {
    if (status === 'completed') {
      await markAppointmentCompleted(id, technicianNotes);
      return;
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp()
    };
    if (technicianNotes !== undefined) {
      updates.technicianNotes = technicianNotes.slice(0, 1000);
    }

    try {
      await updateDoc(doc(db, 'appointments', id), updates);
      addToast(`Job #${id} status updated to: ${status.replace('_', ' ').toUpperCase()}`, 'info');
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const blockSlot = async (
    date: string,
    timeSlot: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !isAdminAuthorized) {
      return { success: false, error: 'Administrator verification required to block slots.' };
    }
    if (!date || date < todayLA) {
      return { success: false, error: 'Cannot block a past date.' };
    }
    const slotId = `block-${Date.now()}`;
    try {
      await setDoc(doc(db, 'blockedSlots', slotId), {
        id: slotId,
        date,
        timeSlot: (timeSlot || 'All Day').slice(0, 40),
        reason: reason.trim().slice(0, 300),
        createdBy: firebaseUser.uid,
        createdAt: serverTimestamp()
      });
      addToast(`Blocked ${date} (${timeSlot}): "${reason}"`, 'warning');
      return { success: true };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `blockedSlots/${slotId}`);
      return { success: false, error: formatFirestoreErrorMessage(err) };
    }
  };

  const unblockSlot = async (id: string) => {
    if (!isAdminAuthorized) return;
    try {
      await deleteDoc(doc(db, 'blockedSlots', id));
      addToast('Availability restriction removed. Customers can now book this time.', 'info');
    } catch (err) {
      reportFirestoreError(err, OperationType.DELETE, `blockedSlots/${id}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  const updateCustomerProfile = async (
    updatedProfile: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !isEmailVerified) {
      return { success: false, error: 'Please sign in with a verified email address to save your profile.' };
    }

    const name = (updatedProfile.name ?? currentUser.name ?? '').trim();
    const email = (updatedProfile.email ?? currentUser.email ?? firebaseUser.email ?? '').trim();
    const phone = (updatedProfile.phone ?? currentUser.phone ?? '').trim();
    const address = (updatedProfile.address ?? currentUser.address ?? '').trim();
    const notes = (updatedProfile.notes ?? currentUser.notes ?? '').trim();

    if (!name || name.length < 2) {
      return { success: false, error: 'Full name is required (at least 2 characters).' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'A valid phone number (at least 7 digits) is required.' };
    }

    try {
      await upsertCustomerProfileDoc(firebaseUser.uid, {
        name,
        email,
        phone,
        address,
        notes
      });
      addToast('Customer profile saved to Cloud Firestore!', 'success');
      return { success: true };
    } catch (err) {
      reportFirestoreError(err, OperationType.WRITE, `customers/${firebaseUser.uid}`);
      return { success: false, error: formatFirestoreErrorMessage(err) };
    }
  };

  const updateCustomerRecordByAdmin = async (
    customerId: string,
    updatedData: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdminAuthorized) {
      return { success: false, error: 'Administrator verification required.' };
    }

    const existingCust = customers.find((c) => c.id === customerId);
    const name = (updatedData.name ?? existingCust?.name ?? '').trim().slice(0, 120);
    const email = (updatedData.email ?? existingCust?.email ?? '').trim().slice(0, 200);
    const phone = (updatedData.phone ?? existingCust?.phone ?? '').trim().slice(0, 30);
    const address = (updatedData.address ?? existingCust?.address ?? '').trim().slice(0, 300);
    const notes = (updatedData.notes ?? existingCust?.notes ?? '').trim().slice(0, 1000);

    if (!name || name.length < 2) {
      return { success: false, error: 'Customer name must be at least 2 characters.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid customer email address is required.' };
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'Phone number must contain at least 7 digits.' };
    }

    try {
      await updateDoc(doc(db, 'customers', customerId), {
        name,
        email,
        phone,
        address,
        notes,
        updatedAt: serverTimestamp()
      });
      addToast('Customer CRM record updated.', 'success');
      return { success: true };
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `customers/${customerId}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
      return { success: false, error: formatFirestoreErrorMessage(err) };
    }
  };

  const recordPayment = async (paymentData: {
    appointmentId: string;
    amount: number;
    method: PaymentRecord['method'];
    notes?: string;
  }): Promise<PaymentRecord | null> => {
    if (!isAdminAuthorized) return null;
    const appt = appointments.find((a) => a.id === paymentData.appointmentId);
    const payId = `PAY-${Date.now()}`;
    const txnRef = `TXN-${Math.floor(1000 + Math.random() * 9000)}-${paymentData.method.substring(0, 3).toUpperCase()}`;
    const payDate = getSacramentoNow().dateStr;

    const payload: Record<string, unknown> = {
      id: payId,
      appointmentId: paymentData.appointmentId,
      customerName: (appt ? appt.customerName : 'Customer').slice(0, 120),
      amount: Number(paymentData.amount),
      method: paymentData.method,
      status: 'paid',
      transactionRef: txnRef,
      date: payDate,
      createdAt: serverTimestamp()
    };
    if (paymentData.notes?.trim()) {
      payload.notes = paymentData.notes.trim().slice(0, 500);
    }

    try {
      await setDoc(doc(db, 'payments', payId), payload);
      await updateDoc(doc(db, 'appointments', paymentData.appointmentId), {
        paymentStatus: 'paid',
        paymentMethod: paymentData.method,
        paidAt: payDate,
        updatedAt: serverTimestamp()
      });
      addToast(`Payment #${payId} of $${paymentData.amount} recorded successfully!`, 'success');
      return {
        id: payId,
        appointmentId: paymentData.appointmentId,
        customerName: String(payload.customerName),
        amount: paymentData.amount,
        method: paymentData.method,
        status: 'paid',
        transactionRef: txnRef,
        date: payDate,
        notes: payload.notes ? String(payload.notes) : undefined
      };
    } catch (err) {
      reportFirestoreError(err, OperationType.CREATE, `payments/${payId}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
      return null;
    }
  };

  const updatePaymentStatus = async (
    appointmentId: string,
    status: Appointment['paymentStatus'],
    method?: PaymentRecord['method']
  ) => {
    if (!isAdminAuthorized) return;
    const updates: Record<string, unknown> = {
      paymentStatus: status,
      updatedAt: serverTimestamp()
    };
    if (method) updates.paymentMethod = method;
    if (status === 'paid') updates.paidAt = getSacramentoNow().dateStr;

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), updates);
      addToast(`Appointment #${appointmentId} payment status marked as ${status.toUpperCase()}`, 'info');
    } catch (err) {
      reportFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
      addToast(formatFirestoreErrorMessage(err), 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        authReady,
        isEmailVerified,
        isBootstrappedAdmin,
        isAdminAuthorized,
        isTechAuthorized,
        customerProfileExists,
        profileLoading,
        authError,
        clearAuthError,
        firestoreError,
        clearFirestoreError,
        signInWithGoogle,
        signInWithEmail,
        createAccountWithEmail,
        resendVerificationEmail,
        refreshAuthUser,
        sendPasswordReset,
        signOutUser,
        staffAccounts,
        adminAccounts,
        grantStaffAccess,
        revokeStaffAccess,
        businessInfo,
        updateBusinessInfo,
        todayLA,
        tomorrowLA,
        currentRole,
        setRole: handleSetRole,
        currentUser,
        setCurrentUser,
        activeCustomerId: firebaseUser?.uid || '',
        setActiveCustomerId,
        selectedTechnicianId,
        setSelectedTechnicianId,
        adminAuthenticated: isAdminAuthorized,
        adminProfile,
        switchToDedicatedView,
        sacramentoLocation: SACRAMENTO_LOCATION,
        visitFeePolicy: VISIT_FEE_POLICY,
        yelpProfileUrl: YELP_PROFILE_URL,
        services,
        customers,
        technicians,
        quotes,
        appointments,
        techAppointments,
        blockedSlots,
        payments,
        serviceAreas,
        reviews,
        cleaningSupplies,
        dialogueMessages,
        adminNotifications,
        markNotificationRead,
        clearNotification,
        calculateDirectPrice,
        sendDialogueMessage,
        downloadDialogueTranscript,
        copyDialogueTranscript,
        addReview,
        submitQuoteRequest,
        updateQuoteStatus,
        convertQuoteToAppointment,
        bookAppointment,
        modifyAppointment,
        cancelAppointment,
        addManualAppointment,
        markAppointmentCompleted,
        updateTechnicianJobStatus,
        blockSlot,
        unblockSlot,
        isSlotAvailable,
        updateCustomerProfile,
        updateCustomerRecordByAdmin,
        recordPayment,
        updatePaymentStatus,
        quoteModalOpen,
        setQuoteModalOpen,
        preselectedServiceForQuote,
        setPreselectedServiceForQuote,
        bookingModalOpen,
        setBookingModalOpen,
        preselectedServiceForBooking,
        setPreselectedServiceForBooking,
        dialogueDrawerOpen,
        setDialogueDrawerOpen,
        activeDialogueThreadId,
        setActiveDialogueThreadId,
        activeView,
        setActiveView,
        selectedQuoteCategory,
        setSelectedQuoteCategory,
        selectedQuoteSubcategories,
        setSelectedQuoteSubcategories,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
