import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  ServiceItem,
  QuoteRequest,
  Appointment,
  BlockedSlot,
  PaymentRecord,
  FieldTechnician,
  ServiceArea,
  CustomerReview,
  CleaningSupply,
  DialogueMessage,
  DirectPriceBreakdown,
  AdminNotification
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_CUSTOMERS,
  INITIAL_TECHNICIANS,
  INITIAL_ADMIN,
  INITIAL_QUOTES,
  INITIAL_APPOINTMENTS,
  INITIAL_BLOCKED_SLOTS,
  INITIAL_PAYMENTS,
  INITIAL_SERVICE_AREAS,
  INITIAL_REVIEWS,
  CLEANING_SUPPLIES,
  INITIAL_DIALOGUE,
  INITIAL_ADMIN_NOTIFICATIONS,
  SACRAMENTO_LOCATION,
  VISIT_FEE_POLICY,
  YELP_PROFILE_URL
} from '../data/initialData';

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

const STORAGE_KEYS = {
  CUSTOMERS: 'aypw_demo_customers_v1',
  QUOTES: 'aypw_demo_quotes_v1',
  APPOINTMENTS: 'aypw_demo_appointments_v1',
  BLOCKED_SLOTS: 'aypw_demo_blocked_slots_v1',
  PAYMENTS: 'aypw_demo_payments_v1',
  DIALOGUE: 'aypw_demo_dialogue_v1',
  NOTIFICATIONS: 'aypw_demo_notifications_v1',
  REVIEWS: 'aypw_demo_reviews_v1',
  ACTIVE_CUSTOMER_ID: 'aypw_demo_active_customer_id_v1',
  ADMIN_MFA: 'aypw_demo_admin_mfa_v1'
} as const;

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in classroom demo mode
  }
}

interface AppContextType {
  // Current session & view state (Local Classroom Demo)
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  activeCustomerId: string;
  setActiveCustomerId: (id: string) => void;
  selectedTechnicianId: string;
  setSelectedTechnicianId: (id: string) => void;
  mfaModalOpen: boolean;
  setMfaModalOpen: (open: boolean) => void;
  toggleAdminMFA: (enable: boolean) => void;
  adminAuthenticated: boolean;
  adminProfile: UserProfile;

  // Dedicated Views: Client, Technical, Admin
  switchToDedicatedView: (mode: 'client' | 'technical' | 'admin') => void;

  // Location & Yelp Info
  sacramentoLocation: typeof SACRAMENTO_LOCATION;
  visitFeePolicy: typeof VISIT_FEE_POLICY;
  yelpProfileUrl: string;

  // Data entities (localStorage-persisted fictional test data)
  services: ServiceItem[];
  customers: UserProfile[];
  technicians: FieldTechnician[];
  quotes: QuoteRequest[];
  appointments: Appointment[];
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
  const [technicians] = useState<FieldTechnician[]>(INITIAL_TECHNICIANS);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('tech-1');

  // LocalStorage-backed fictional test collections
  const [customers, setCustomers] = useState<UserProfile[]>(() =>
    readFromStorage<UserProfile[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [quotes, setQuotes] = useState<QuoteRequest[]>(() =>
    readFromStorage<QuoteRequest[]>(STORAGE_KEYS.QUOTES, INITIAL_QUOTES)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    readFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS)
  );
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() =>
    readFromStorage<BlockedSlot[]>(STORAGE_KEYS.BLOCKED_SLOTS, INITIAL_BLOCKED_SLOTS)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    readFromStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  );
  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>(() =>
    readFromStorage<DialogueMessage[]>(STORAGE_KEYS.DIALOGUE, INITIAL_DIALOGUE)
  );
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() =>
    readFromStorage<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_ADMIN_NOTIFICATIONS)
  );
  const [reviews, setReviews] = useState<CustomerReview[]>(() =>
    readFromStorage<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );

  const [activeCustomerId, setActiveCustomerIdState] = useState<string>(() =>
    readFromStorage<string>(STORAGE_KEYS.ACTIVE_CUSTOMER_ID, INITIAL_CUSTOMERS[0]?.id || 'cust-1')
  );
  const [adminMfaEnabled, setAdminMfaEnabled] = useState<boolean>(() =>
    readFromStorage<boolean>(STORAGE_KEYS.ADMIN_MFA, Boolean(INITIAL_ADMIN.mfaEnabled))
  );

  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [mfaModalOpen, setMfaModalOpen] = useState<boolean>(false);

  // Modal and navigation states
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [preselectedServiceForQuote, setPreselectedServiceForQuote] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [preselectedServiceForBooking, setPreselectedServiceForBooking] = useState<string | null>(null);
  const [dialogueDrawerOpen, setDialogueDrawerOpen] = useState<boolean>(false);
  const [activeDialogueThreadId, setActiveDialogueThreadId] = useState<string>(() =>
    readFromStorage<string>(STORAGE_KEYS.ACTIVE_CUSTOMER_ID, INITIAL_CUSTOMERS[0]?.id || 'cust-1')
  );
  const [activeView, setActiveView] = useState<AppViewMode>('home');
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<string | null>(null);
  const [selectedQuoteSubcategories, setSelectedQuoteSubcategories] = useState<string[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

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

  // Persist every collection cleanly to localStorage
  useEffect(() => {
    writeToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.QUOTES, quotes);
  }, [quotes]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.BLOCKED_SLOTS, blockedSlots);
  }, [blockedSlots]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.PAYMENTS, payments);
  }, [payments]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.DIALOGUE, dialogueMessages);
  }, [dialogueMessages]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.NOTIFICATIONS, adminNotifications);
  }, [adminNotifications]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.REVIEWS, reviews);
  }, [reviews]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.ACTIVE_CUSTOMER_ID, activeCustomerId);
  }, [activeCustomerId]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.ADMIN_MFA, adminMfaEnabled);
  }, [adminMfaEnabled]);

  // Cross-tab synchronization within the same browser
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        switch (e.key) {
          case STORAGE_KEYS.CUSTOMERS:
            setCustomers(parsed);
            break;
          case STORAGE_KEYS.QUOTES:
            setQuotes(parsed);
            break;
          case STORAGE_KEYS.APPOINTMENTS:
            setAppointments(parsed);
            break;
          case STORAGE_KEYS.BLOCKED_SLOTS:
            setBlockedSlots(parsed);
            break;
          case STORAGE_KEYS.PAYMENTS:
            setPayments(parsed);
            break;
          case STORAGE_KEYS.DIALOGUE:
            setDialogueMessages(parsed);
            break;
          case STORAGE_KEYS.NOTIFICATIONS:
            setAdminNotifications(parsed);
            break;
          case STORAGE_KEYS.REVIEWS:
            setReviews(parsed);
            break;
          case STORAGE_KEYS.ACTIVE_CUSTOMER_ID:
            setActiveCustomerIdState(parsed);
            break;
          case STORAGE_KEYS.ADMIN_MFA:
            setAdminMfaEnabled(Boolean(parsed));
            break;
        }
      } catch {
        // Ignore malformed storage events
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setActiveCustomerId = (id: string) => {
    setActiveCustomerIdState(id);
    setActiveDialogueThreadId(id);
  };

  const activeCustomerRecord =
    customers.find((c) => c.id === activeCustomerId) || customers[0] || INITIAL_CUSTOMERS[0];

  const adminProfile: UserProfile = {
    ...INITIAL_ADMIN,
    mfaEnabled: adminMfaEnabled
  };

  const currentUser: UserProfile =
    currentRole === 'admin'
      ? adminProfile
      : {
          ...activeCustomerRecord,
          mfaEnabled: adminMfaEnabled
        };

  const setCurrentUser = (user: UserProfile) => {
    if (user.role === 'admin') {
      setAdminMfaEnabled(Boolean(user.mfaEnabled));
      return;
    }
    setCustomers((prev) => prev.map((c) => (c.id === user.id ? { ...c, ...user } : c)));
    setActiveCustomerId(user.id);
  };

  // Resolve or register a customer in the CRM so Quotes & Bookings always sync with Customer Records
  const resolveOrCreateCustomer = (info: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }): UserProfile => {
    const trimmedEmail = info.email.trim().toLowerCase();
    const trimmedName = info.name.trim();
    const existingByEmail = customers.find(
      (c) => trimmedEmail && c.email.trim().toLowerCase() === trimmedEmail
    );

    if (existingByEmail) {
      const updated: UserProfile = {
        ...existingByEmail,
        name: trimmedName || existingByEmail.name,
        phone: info.phone.trim() || existingByEmail.phone,
        address: info.address.trim() || existingByEmail.address
      };
      setCustomers((prev) => prev.map((c) => (c.id === existingByEmail.id ? updated : c)));
      setActiveCustomerId(existingByEmail.id);
      return updated;
    }

    const newCustomer: UserProfile = {
      id: `cust-${Date.now()}`,
      name: trimmedName || 'Demo Customer',
      email: info.email.trim() || 'demo.customer@example.com',
      phone: info.phone.trim() || '(916) 555-0100',
      address: info.address.trim() || 'Sacramento, CA',
      role: 'customer',
      notes: 'Created via online quote/booking classroom demo form',
      mfaEnabled: false
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setActiveCustomerId(newCustomer.id);
    return newCustomer;
  };

  // Admin Notifications
  const markNotificationRead = async (id: string) => {
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotification = async (id: string) => {
    setAdminNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Dynamic Direct Price Calculator (Preliminary estimate based on $250 minimum baseline)
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

  // Dialogue messaging system persisted to localStorage
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
    const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const targetThread = threadId || activeCustomerRecord.id;

    const newMsg: DialogueMessage = {
      id: msgId,
      threadId: targetThread,
      customerName: customerName.slice(0, 120),
      senderRole,
      senderName: senderName.slice(0, 120),
      message: message.slice(0, 2000),
      timestamp,
      quoteId,
      appointmentId,
      directPrice
    };

    setDialogueMessages((prev) => [...prev, newMsg]);
    addToast('Message sent and saved to dialogue log.', 'success');
    return newMsg;
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
    content += `Sacramento Operations Hub: Sacramento, CA\n`;
    content += `Customer Thread: ${customerName} (ID: ${threadId})\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `Phone: (916) 397-1877 | Yelp: ${YELP_PROFILE_URL}\n`;
    content += `=======================================================\n\n`;

    msgs.forEach((m, idx) => {
      content += `[${idx + 1}] ${m.timestamp} - ${m.senderName} (${m.senderRole.toUpperCase()}):\n`;
      content += `${m.message}\n`;
      if (m.directPrice) {
        content += `>>> Preliminary Price Estimate: $${m.directPrice}\n`;
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
      text += `[${m.timestamp}] ${m.senderName}: ${m.message}${m.directPrice ? ` (Estimate: $${m.directPrice})` : ''}\n`;
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

  // Dedicated View Switcher (Direct Classroom Demo Access to Client, Technical, Admin)
  const switchToDedicatedView = (mode: 'client' | 'technical' | 'admin') => {
    if (mode === 'client') {
      setCurrentRole('customer');
      setActiveDialogueThreadId(activeCustomerRecord.id);
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

  const toggleAdminMFA = (enable: boolean) => {
    setAdminMfaEnabled(enable);
    addToast(`Two-Factor Authentication (2FA) ${enable ? 'enabled' : 'disabled'} for Administrator demo`, 'success');
  };

  // Overlap & Blocked Slot Check
  const isSlotAvailable = (
    date: string,
    timeSlot: string,
    excludeAppointmentId?: string,
    targetTechnicianId?: string
  ): { available: boolean; conflictReason?: string } => {
    const blocked = blockedSlots.find((b) => b.date === date && (b.timeSlot === 'All Day' || b.timeSlot === timeSlot));
    if (blocked) {
      return {
        available: false,
        conflictReason: `Unavailable — blocked by dispatch administration (${blocked.reason}).`
      };
    }

    const existingActive = appointments.filter(
      (a) =>
        a.scheduledDate === date &&
        a.scheduledTime === timeSlot &&
        a.status !== 'cancelled' &&
        a.id !== excludeAppointmentId
    );

    if (targetTechnicianId) {
      const techBusy = existingActive.some((a) => a.technicianId === targetTechnicianId);
      if (techBusy) {
        return {
          available: false,
          conflictReason: `Technician is already committed to an appointment during this slot (${timeSlot}).`
        };
      }
    } else if (existingActive.length >= technicians.length) {
      return {
        available: false,
        conflictReason: `All Sacramento service crews are booked for ${date} at ${timeSlot}. Please select another time.`
      };
    }

    return { available: true };
  };

  // Quote Submission (Persisted to localStorage)
  const submitQuoteRequest = async (
    quoteData: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<QuoteRequest | null> => {
    const matchedCustomer = resolveOrCreateCustomer({
      name: quoteData.customerName,
      email: quoteData.email,
      phone: quoteData.phone,
      address: quoteData.propertyAddress
    });

    const breakdown = calculateDirectPrice(quoteData.serviceId, quoteData.squareFootage || 600, quoteData.propertyAddress);
    const quoteId = `Q-${Date.now()}`;
    const createdDate = new Date().toISOString().split('T')[0];

    const newQuote: QuoteRequest = {
      ...quoteData,
      id: quoteId,
      customerId: matchedCustomer.id,
      status: 'new',
      estimatedPrice: breakdown.totalDirectPrice,
      directPriceBreakdown: breakdown,
      createdAt: createdDate
    };

    setQuotes((prev) => [newQuote, ...prev]);

    const notifId = `notif-${Date.now()}`;
    const newNotif: AdminNotification = {
      id: notifId,
      type: 'quote_access',
      title: `Quote Access Request: ${quoteData.serviceName}`.slice(0, 160),
      customerName: quoteData.customerName.slice(0, 120),
      customerEmail: quoteData.email.slice(0, 200),
      customerPhone: quoteData.phone.slice(0, 30),
      serviceName: quoteData.serviceName.slice(0, 160),
      propertyAddress: quoteData.propertyAddress.slice(0, 300),
      squareFootage: quoteData.squareFootage,
      estimatedPrice: breakdown.totalDirectPrice,
      timestamp: 'Just now',
      read: false,
      notes: 'Customer submitted quote request. Owner review required before final quote.'
    };
    setAdminNotifications((prev) => [newNotif, ...prev]);

    await sendDialogueMessage(
      matchedCustomer.id,
      quoteData.customerName,
      'client',
      quoteData.customerName,
      `Submitted quote request for ${quoteData.serviceName} at ${quoteData.propertyAddress}. Preliminary estimate: $${breakdown.totalDirectPrice}.`,
      breakdown.totalDirectPrice,
      quoteId
    );

    addToast('Quote request saved and sent to Admin Dashboard!', 'success');
    return newQuote;
  };

  // Update Quote Status (Admin)
  const updateQuoteStatus = async (
    quoteId: string,
    status: QuoteRequest['status'],
    estimatedPrice?: number,
    adminNotes?: string
  ) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status,
              ...(estimatedPrice !== undefined ? { estimatedPrice } : {}),
              ...(adminNotes !== undefined ? { adminNotes } : {})
            }
          : q
      )
    );
    addToast(`Quote #${quoteId} status updated to: ${status.toUpperCase()}`, 'info');
  };

  // Convert Quote to Appointment (Admin)
  const convertQuoteToAppointment = async (
    quoteId: string,
    scheduledDate: string,
    scheduledTime: string,
    technicianId: string
  ): Promise<Appointment | null> => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    const tech = technicians.find((t) => t.id === technicianId) || technicians[0];
    const apptId = `APT-${Date.now()}`;
    const customerId = quote.customerId || activeCustomerRecord.id;
    const price = Math.max(250, quote.estimatedPrice || 250);

    const newAppt: Appointment = {
      id: apptId,
      quoteId: quote.id,
      customerId,
      customerName: quote.customerName,
      customerEmail: quote.email,
      customerPhone: quote.phone,
      serviceId: quote.serviceId,
      serviceName: quote.serviceName,
      serviceAddress: quote.propertyAddress,
      scheduledDate,
      scheduledTime,
      technicianId: tech.id,
      technicianName: tech.name,
      status: 'scheduled',
      notes: `Converted from Quote #${quote.id}. ${quote.areaDescription || ''}`.slice(0, 1000),
      price,
      squareFootage: quote.squareFootage,
      paymentStatus: 'pending'
    };

    setAppointments((prev) => [newAppt, ...prev]);
    await updateQuoteStatus(quoteId, 'accepted');
    await sendDialogueMessage(
      customerId,
      quote.customerName,
      'admin',
      'Marcus Ray (Sacramento Dispatch)',
      `Appointment confirmed for ${scheduledDate} (${scheduledTime}) with ${tech.name}. Service estimate: $${price}. $0 assessment fee applied.`,
      price,
      quote.id,
      apptId
    );
    addToast(`Appointment #${apptId} successfully created from Quote #${quoteId}!`, 'success');
    return newAppt;
  };

  // Book Appointment Online (Persisted to localStorage)
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
    const availability = isSlotAvailable(bookingData.scheduledDate, bookingData.scheduledTime);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

    const matchedCustomer = resolveOrCreateCustomer({
      name: bookingData.customerName,
      email: bookingData.customerEmail,
      phone: bookingData.customerPhone,
      address: bookingData.serviceAddress
    });

    const existingAtTime = appointments.filter(
      (a) =>
        a.scheduledDate === bookingData.scheduledDate &&
        a.scheduledTime === bookingData.scheduledTime &&
        a.status !== 'cancelled'
    );
    const assignedTech =
      technicians.find((t) => !existingAtTime.some((a) => a.technicianId === t.id)) || technicians[0];
    const service = services.find((s) => s.id === bookingData.serviceId);
    const breakdown = calculateDirectPrice(
      bookingData.serviceId,
      bookingData.squareFootage || 600,
      bookingData.serviceAddress
    );

    const apptId = `APT-${Date.now()}`;
    const newAppt: Appointment = {
      id: apptId,
      customerId: matchedCustomer.id,
      customerName: bookingData.customerName.slice(0, 120),
      customerEmail: bookingData.customerEmail.slice(0, 200),
      customerPhone: bookingData.customerPhone.slice(0, 30),
      serviceId: bookingData.serviceId.slice(0, 80),
      serviceName: (service ? service.name : 'Pressure Washing Service').slice(0, 160),
      serviceAddress: bookingData.serviceAddress.slice(0, 300),
      scheduledDate: bookingData.scheduledDate,
      scheduledTime: bookingData.scheduledTime,
      technicianId: assignedTech.id,
      technicianName: assignedTech.name,
      status: 'scheduled',
      notes: bookingData.notes?.slice(0, 1000),
      squareFootage: bookingData.squareFootage || 600,
      price: breakdown.totalDirectPrice,
      paymentStatus: 'pending'
    };

    setAppointments((prev) => [newAppt, ...prev]);

    await sendDialogueMessage(
      matchedCustomer.id,
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
      appointment: newAppt
    };
  };

  // Modify Appointment
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

    const techObj = technicianId ? technicians.find((t) => t.id === technicianId) : null;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              scheduledDate: date,
              scheduledTime: time,
              ...(techObj ? { technicianId: techObj.id, technicianName: techObj.name } : {}),
              ...(notes ? { notes: notes.slice(0, 1000) } : {})
            }
          : a
      )
    );
    addToast(`Appointment #${id} updated to ${date} (${time})`, 'success');
    return { success: true };
  };

  // Cancel Appointment
  const cancelAppointment = async (id: string, reason?: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'cancelled',
              cancellationReason: (reason || 'Cancelled by customer').slice(0, 500)
            }
          : a
      )
    );
    addToast(`Appointment #${id} has been cancelled.`, 'info');
  };

  // Add Manual Appointment (Admin)
  const addManualAppointment = async (
    data: Omit<Appointment, 'id' | 'status' | 'paymentStatus'>
  ): Promise<{ success: boolean; error?: string; appointment?: Appointment }> => {
    const availability = isSlotAvailable(data.scheduledDate, data.scheduledTime, undefined, data.technicianId);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

    const matchedCustomer = resolveOrCreateCustomer({
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      address: data.serviceAddress
    });

    const apptId = `APT-${Date.now()}`;
    const newAppt: Appointment = {
      ...data,
      customerId: matchedCustomer.id,
      id: apptId,
      status: 'scheduled',
      paymentStatus: 'pending'
    };

    setAppointments((prev) => [newAppt, ...prev]);
    addToast(`Manual appointment #${apptId} registered on dispatch schedule!`, 'success');
    return {
      success: true,
      appointment: newAppt
    };
  };

  // Mark Completed (Admin / Tech)
  const markAppointmentCompleted = async (id: string, techNotes?: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'completed',
              completedAt: timeStr,
              ...(techNotes !== undefined ? { technicianNotes: techNotes.slice(0, 1000) } : {})
            }
          : a
      )
    );
    addToast(`Appointment #${id} marked as COMPLETED. Service history updated.`, 'success');
  };

  const updateTechnicianJobStatus = async (id: string, status: Appointment['status'], technicianNotes?: string) => {
    if (status === 'completed') {
      await markAppointmentCompleted(id, technicianNotes);
      return;
    }
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              ...(technicianNotes !== undefined ? { technicianNotes: technicianNotes.slice(0, 1000) } : {})
            }
          : a
      )
    );
    addToast(`Job #${id} status updated to: ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // Block Unavailable Dates/Times (Admin — persisted to localStorage)
  const blockSlot = async (
    date: string,
    timeSlot: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    const slotId = `block-${Date.now()}`;
    const newSlot: BlockedSlot = {
      id: slotId,
      date,
      timeSlot,
      reason: reason.trim().slice(0, 300)
    };
    setBlockedSlots((prev) => [...prev, newSlot]);
    addToast(`Blocked ${date} (${timeSlot}): "${reason}"`, 'warning');
    return { success: true };
  };

  const unblockSlot = async (id: string) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
    addToast('Availability restriction removed. Customers can now book this time.', 'info');
  };

  // Update Customer Profile in localStorage (syncs directly with Admin CRM)
  const updateCustomerProfile = async (
    updatedProfile: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = activeCustomerRecord;
    const name = (updatedProfile.name ?? target.name ?? '').trim();
    const email = (updatedProfile.email ?? target.email ?? '').trim();
    const phone = (updatedProfile.phone ?? target.phone ?? '').trim();
    const address = (updatedProfile.address ?? target.address ?? '').trim();
    const notes = (updatedProfile.notes ?? target.notes ?? '').trim();

    if (!name || name.length < 2) {
      return { success: false, error: 'Full name is required (at least 2 characters).' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'A valid phone number (at least 7 digits) is required.' };
    }

    const updatedRecord: UserProfile = {
      ...target,
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      phone: phone.slice(0, 30),
      address: address.slice(0, 300),
      notes: notes.slice(0, 1000),
      role: 'customer'
    };

    setCustomers((prev) => prev.map((c) => (c.id === target.id ? updatedRecord : c)));
    addToast('Customer profile updated and synced across portals!', 'success');
    return { success: true };
  };

  // Admin updates customer record in localStorage
  const updateCustomerRecordByAdmin = async (
    customerId: string,
    updatedData: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              name: updatedData.name !== undefined ? updatedData.name.trim().slice(0, 120) : c.name,
              email: updatedData.email !== undefined ? updatedData.email.trim().slice(0, 200) : c.email,
              phone: updatedData.phone !== undefined ? updatedData.phone.trim().slice(0, 30) : c.phone,
              address: updatedData.address !== undefined ? updatedData.address.trim().slice(0, 300) : c.address,
              notes: updatedData.notes !== undefined ? updatedData.notes.trim().slice(0, 1000) : c.notes
            }
          : c
      )
    );
    addToast('Customer CRM record updated.', 'success');
    return { success: true };
  };

  // Payment Management (Admin)
  const recordPayment = async (paymentData: {
    appointmentId: string;
    amount: number;
    method: PaymentRecord['method'];
    notes?: string;
  }): Promise<PaymentRecord | null> => {
    const appt = appointments.find((a) => a.id === paymentData.appointmentId);
    const payId = `PAY-${Date.now()}`;
    const txnRef = `TXN-${Math.floor(1000 + Math.random() * 9000)}-${paymentData.method.substring(0, 3).toUpperCase()}`;
    const payDate = new Date().toISOString().split('T')[0];

    const newPayment: PaymentRecord = {
      id: payId,
      appointmentId: paymentData.appointmentId,
      customerName: appt ? appt.customerName : 'Direct Customer',
      amount: paymentData.amount,
      method: paymentData.method,
      status: 'paid',
      transactionRef: txnRef,
      date: payDate,
      notes: paymentData.notes?.slice(0, 500)
    };

    setPayments((prev) => [newPayment, ...prev]);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === paymentData.appointmentId
          ? {
              ...a,
              paymentStatus: 'paid',
              paymentMethod: paymentData.method,
              paidAt: payDate
            }
          : a
      )
    );

    addToast(`Payment #${payId} of $${paymentData.amount} recorded successfully!`, 'success');
    return newPayment;
  };

  const updatePaymentStatus = async (
    appointmentId: string,
    status: Appointment['paymentStatus'],
    method?: PaymentRecord['method']
  ) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              paymentStatus: status,
              ...(method ? { paymentMethod: method } : {}),
              ...(status === 'paid' ? { paidAt: new Date().toISOString().split('T')[0] } : {})
            }
          : a
      )
    );
    addToast(`Appointment #${appointmentId} payment status marked as ${status.toUpperCase()}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole: handleSetRole,
        currentUser,
        setCurrentUser,
        activeCustomerId: activeCustomerRecord.id,
        setActiveCustomerId,
        selectedTechnicianId,
        setSelectedTechnicianId,
        mfaModalOpen,
        setMfaModalOpen,
        toggleAdminMFA,
        adminAuthenticated: true,
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
