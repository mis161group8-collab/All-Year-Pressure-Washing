import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  ADMIN_EMAIL,
  OperationType,
  handleFirestoreError
} from '../firebase';
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
  INITIAL_TECHNICIANS,
  INITIAL_SERVICE_AREAS,
  INITIAL_REVIEWS,
  CLEANING_SUPPLIES,
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

const GUEST_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'customer',
  notes: '',
  mfaEnabled: false
};

interface AppContextType {
  // Real Firebase Auth & RBAC
  firebaseUser: User | null;
  authReady: boolean;
  isAdminAuthorized: boolean;
  customerProfileExists: boolean;
  profileLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: (expectedRole?: 'customer' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;

  // Current session & view state
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  selectedTechnicianId: string;
  setSelectedTechnicianId: (id: string) => void;
  mfaModalOpen: boolean;
  setMfaModalOpen: (open: boolean) => void;
  toggleAdminMFA: (enable: boolean) => void;
  adminAuthenticated: boolean;

  // Dedicated Views: Client, Technical, Admin
  switchToDedicatedView: (mode: 'client' | 'technical' | 'admin') => void;

  // Location & Yelp Info
  sacramentoLocation: typeof SACRAMENTO_LOCATION;
  visitFeePolicy: typeof VISIT_FEE_POLICY;
  yelpProfileUrl: string;

  // Data entities (Firestore-backed where persistent/PII)
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

const sanitizeForFirestore = (obj: Record<string, unknown>): Record<string, unknown> => {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [serviceAreas] = useState<ServiceArea[]>(INITIAL_SERVICE_AREAS);
  const [cleaningSupplies] = useState<CleaningSupply[]>(CLEANING_SUPPLIES);
  const [technicians] = useState<FieldTechnician[]>(INITIAL_TECHNICIANS);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('tech-1');

  // Firebase Auth states
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);
  const [customerProfileExists, setCustomerProfileExists] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [mfaModalOpen, setMfaModalOpen] = useState<boolean>(false);

  // Firestore-backed collections
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);

  // Modal and navigation states
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [preselectedServiceForQuote, setPreselectedServiceForQuote] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [preselectedServiceForBooking, setPreselectedServiceForBooking] = useState<string | null>(null);
  const [dialogueDrawerOpen, setDialogueDrawerOpen] = useState<boolean>(false);
  const [activeDialogueThreadId, setActiveDialogueThreadId] = useState<string>('');
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

  const clearAuthError = () => setAuthError(null);

  // 1. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthError(null);

      if (!user) {
        setIsAdminAuthorized(false);
        setCustomerProfileExists(false);
        setCurrentUser(GUEST_USER);
        setCustomers([]);
        setQuotes([]);
        setAppointments([]);
        setPayments([]);
        setAdminNotifications([]);
        setDialogueMessages([]);
        setActiveDialogueThreadId('');
        if (currentRole === 'admin') {
          setCurrentRole('customer');
        }
        setAuthReady(true);
        return;
      }

      // Check real admin authorization
      let adminStatus = Boolean(user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL);
      if (!adminStatus && user.emailVerified) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
            adminStatus = true;
          }
        } catch {
          // Non-admin user simply won't have admin doc access
          adminStatus = false;
        }
      }

      setIsAdminAuthorized(adminStatus);
      setActiveDialogueThreadId(user.uid);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // 2. Public listener for Blocked Slots (No PII — powers booking calendar availability immediately)
  useEffect(() => {
    const path = 'blockedSlots';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: BlockedSlot[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            date: data.date || '',
            timeSlot: data.timeSlot || 'All Day',
            reason: data.reason || ''
          };
        });
        setBlockedSlots(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Authenticated User Profile & Scoped Data Listeners
  useEffect(() => {
    if (!authReady || !firebaseUser) return;

    const uid = firebaseUser.uid;
    const unsubs: Array<() => void> = [];

    // Listen to current user's customer profile doc
    setProfileLoading(true);
    const profilePath = `customers/${uid}`;
    unsubs.push(
      onSnapshot(
        doc(db, 'customers', uid),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCustomerProfileExists(true);
            setCurrentUser({
              id: uid,
              name: data.name || firebaseUser.displayName || '',
              email: data.email || firebaseUser.email || '',
              phone: data.phone || '',
              address: data.address || '',
              role: isAdminAuthorized ? 'admin' : 'customer',
              notes: data.notes || '',
              mfaEnabled: false
            });
          } else {
            setCustomerProfileExists(false);
            setCurrentUser({
              id: uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              phone: '',
              address: '',
              role: isAdminAuthorized ? 'admin' : 'customer',
              notes: '',
              mfaEnabled: false
            });
          }
          setProfileLoading(false);
        },
        (error) => {
          setProfileLoading(false);
          handleFirestoreError(error, OperationType.GET, profilePath);
        }
      )
    );

    if (isAdminAuthorized) {
      // Admin: full collection listeners (protected by firestore.rules isBootstrappedAdmin / isAdmin)
      unsubs.push(
        onSnapshot(
          collection(db, 'customers'),
          (snap) => {
            setCustomers(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  name: data.name || '',
                  email: data.email || '',
                  phone: data.phone || '',
                  address: data.address || '',
                  role: 'customer',
                  notes: data.notes || ''
                };
              })
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'customers')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'quotes'),
          (snap) => {
            setQuotes(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  ...(data as Omit<QuoteRequest, 'id' | 'photos' | 'createdAt'>),
                  id: d.id,
                  photos: [],
                  createdAt: data.createdDate || ''
                };
              })
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'quotes')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'appointments'),
          (snap) => {
            setAppointments(
              snap.docs.map((d) => ({
                ...(d.data() as Appointment),
                id: d.id
              }))
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'appointments')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'payments'),
          (snap) => {
            setPayments(
              snap.docs.map((d) => ({
                ...(d.data() as PaymentRecord),
                id: d.id
              }))
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'payments')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'adminNotifications'),
          (snap) => {
            setAdminNotifications(
              snap.docs.map((d) => ({
                ...(d.data() as AdminNotification),
                id: d.id
              }))
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'adminNotifications')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'dialogueMessages'),
          (snap) => {
            setDialogueMessages(
              snap.docs.map((d) => ({
                ...(d.data() as DialogueMessage),
                id: d.id
              }))
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'dialogueMessages')
        )
      );
    } else {
      // Customer: strictly scoped queries where customerId == uid (enforced by firestore.rules)
      setCustomers([]);
      setPayments([]);
      setAdminNotifications([]);

      const qQuotes = query(collection(db, 'quotes'), where('customerId', '==', uid));
      unsubs.push(
        onSnapshot(
          qQuotes,
          (snap) => {
            setQuotes(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  ...(data as Omit<QuoteRequest, 'id' | 'photos' | 'createdAt'>),
                  id: d.id,
                  photos: [],
                  createdAt: data.createdDate || ''
                };
              })
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'quotes')
        )
      );

      const qAppts = query(collection(db, 'appointments'), where('customerId', '==', uid));
      unsubs.push(
        onSnapshot(
          qAppts,
          (snap) => {
            setAppointments(
              snap.docs.map((d) => ({
                ...(d.data() as Appointment),
                id: d.id
              }))
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'appointments')
        )
      );

      const qMsgs = query(collection(db, 'dialogueMessages'), where('threadId', '==', uid));
      unsubs.push(
        onSnapshot(
          qMsgs,
          (snap) => {
            setDialogueMessages(
              snap.docs.map((d) => ({
                ...(d.data() as DialogueMessage),
                id: d.id
              }))
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'dialogueMessages')
        )
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authReady, firebaseUser, isAdminAuthorized]);

  // Sign In with Google
  const signInWithGoogle = async (
    expectedRole: 'customer' | 'admin' = 'customer'
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const signedUser = cred.user;

      if (expectedRole === 'admin') {
        let isAdmin = Boolean(signedUser.emailVerified && signedUser.email?.toLowerCase() === ADMIN_EMAIL);
        if (!isAdmin && signedUser.emailVerified) {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', signedUser.uid));
            if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
              isAdmin = true;
            }
          } catch {
            isAdmin = false;
          }
        }
        if (!isAdmin) {
          const msg = `Access denied: ${signedUser.email || 'This account'} is not authorized for Administrator access.`;
          setAuthError(msg);
          addToast(msg, 'error');
          return { success: false, error: msg };
        }
        setCurrentRole('admin');
        addToast('Administrator authenticated successfully.', 'success');
        return { success: true };
      }

      setCurrentRole('customer');
      addToast(`Signed in as ${signedUser.email}`, 'success');
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Authentication cancelled or rejected.';
      setAuthError(msg);
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const signOutUser = async (): Promise<void> => {
    await signOut(auth);
    setCurrentRole('customer');
    addToast('Signed out successfully.', 'info');
  };

  // Mark Admin Notification Read
  const markNotificationRead = async (id: string) => {
    if (!isAdminAuthorized) return;
    const path = `adminNotifications/${id}`;
    try {
      await updateDoc(doc(db, 'adminNotifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const clearNotification = async (id: string) => {
    if (!isAdminAuthorized) return;
    const path = `adminNotifications/${id}`;
    try {
      await deleteDoc(doc(db, 'adminNotifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
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

  // Dialogue messaging system persisted to Firestore
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
    if (!firebaseUser) {
      addToast('Please sign in to send messages.', 'warning');
      return null;
    }

    const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const targetThread = isAdminAuthorized ? threadId : firebaseUser.uid;

    const payload = sanitizeForFirestore({
      id: msgId,
      threadId: targetThread,
      customerName: customerName.slice(0, 120),
      senderRole,
      senderName: senderName.slice(0, 120),
      message: message.slice(0, 2000),
      timestamp,
      quoteId,
      appointmentId,
      directPrice,
      createdAt: serverTimestamp()
    });

    const path = `dialogueMessages/${msgId}`;
    try {
      await setDoc(doc(db, 'dialogueMessages', msgId), payload);
      addToast('Message sent and saved to dialogue log.', 'success');
      return {
        id: msgId,
        threadId: targetThread,
        customerName,
        senderRole,
        senderName,
        message,
        timestamp,
        quoteId,
        appointmentId,
        directPrice
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
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

  // Dedicated View Switcher (No unauthenticated bypass into Admin!)
  const switchToDedicatedView = (mode: 'client' | 'technical' | 'admin') => {
    if (mode === 'client') {
      setCurrentRole('customer');
      setActiveView('customer_portal');
    } else if (mode === 'technical') {
      setCurrentRole('technician');
      setActiveView('tech_portal');
    } else if (mode === 'admin') {
      if (isAdminAuthorized) {
        setCurrentRole('admin');
      }
      setActiveView('admin_dashboard');
    }
  };

  const handleSetRole = (role: UserRole) => {
    if (role === 'customer') switchToDedicatedView('client');
    else if (role === 'technician') switchToDedicatedView('technical');
    else if (role === 'admin') switchToDedicatedView('admin');
  };

  const toggleAdminMFA = (enable: boolean) => {
    if (!isAdminAuthorized) return;
    setCurrentUser((prev) => ({ ...prev, mfaEnabled: enable }));
    addToast(`Two-Factor Authentication (2FA) ${enable ? 'enabled' : 'disabled'} for Administrator`, 'success');
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

  // Quote Submission (Persisted to Firestore)
  const submitQuoteRequest = async (
    quoteData: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<QuoteRequest | null> => {
    if (!firebaseUser) {
      addToast('Please sign in first to submit and save your quote request.', 'warning');
      return null;
    }

    const breakdown = calculateDirectPrice(quoteData.serviceId, quoteData.squareFootage || 600, quoteData.propertyAddress);
    const quoteId = `Q-${Date.now()}`;
    const createdDate = new Date().toISOString().split('T')[0];

    const docPayload = sanitizeForFirestore({
      id: quoteId,
      customerId: firebaseUser.uid,
      customerName: quoteData.customerName.slice(0, 120),
      email: quoteData.email.slice(0, 200),
      phone: quoteData.phone.slice(0, 30),
      serviceId: quoteData.serviceId.slice(0, 80),
      serviceName: quoteData.serviceName.slice(0, 160),
      mainCategory: quoteData.mainCategory?.slice(0, 120),
      subcategories: quoteData.subcategories?.slice(0, 20),
      removalNeeds: quoteData.removalNeeds?.slice(0, 10),
      otherRemovalDetails: quoteData.otherRemovalDetails?.slice(0, 500),
      timingPreference: quoteData.timingPreference,
      preferredDate: quoteData.preferredDate?.slice(0, 20),
      streetAddress: quoteData.streetAddress?.slice(0, 200),
      city: quoteData.city?.slice(0, 100),
      state: quoteData.state?.slice(0, 30),
      zipCode: quoteData.zipCode?.slice(0, 20),
      propertyAddress: quoteData.propertyAddress.slice(0, 300),
      areaDescription: (quoteData.areaDescription || '').slice(0, 2000),
      squareFootage: quoteData.squareFootage,
      photoCount: quoteData.photos?.length || 0,
      status: 'new',
      estimatedPrice: breakdown.totalDirectPrice,
      createdDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const quotePath = `quotes/${quoteId}`;
    try {
      await setDoc(doc(db, 'quotes', quoteId), docPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, quotePath);
    }

    // Create Admin Notification
    const notifId = `notif-${Date.now()}`;
    const notifPayload = sanitizeForFirestore({
      id: notifId,
      customerId: firebaseUser.uid,
      type: 'quote_access',
      title: `Quote Access Request: ${quoteData.serviceName}`,
      customerName: quoteData.customerName.slice(0, 120),
      customerEmail: quoteData.email.slice(0, 200),
      customerPhone: quoteData.phone.slice(0, 30),
      serviceName: quoteData.serviceName.slice(0, 160),
      propertyAddress: quoteData.propertyAddress.slice(0, 300),
      squareFootage: quoteData.squareFootage,
      estimatedPrice: breakdown.totalDirectPrice,
      timestamp: 'Just now',
      read: false,
      notes: 'Customer submitted quote request. Owner review required before final quote.',
      createdAt: serverTimestamp()
    });

    try {
      await setDoc(doc(db, 'adminNotifications', notifId), notifPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `adminNotifications/${notifId}`);
    }

    // Create dialogue entry
    await sendDialogueMessage(
      firebaseUser.uid,
      quoteData.customerName,
      'client',
      quoteData.customerName,
      `Submitted quote request for ${quoteData.serviceName} at ${quoteData.propertyAddress}. Preliminary estimate: $${breakdown.totalDirectPrice}.`,
      breakdown.totalDirectPrice,
      quoteId
    );

    addToast('Quote request saved to your account and sent to Admin!', 'success');
    return {
      ...quoteData,
      id: quoteId,
      customerId: firebaseUser.uid,
      status: 'new',
      estimatedPrice: breakdown.totalDirectPrice,
      directPriceBreakdown: breakdown,
      createdAt: createdDate
    };
  };

  // Update Quote Status (Admin only)
  const updateQuoteStatus = async (
    quoteId: string,
    status: QuoteRequest['status'],
    estimatedPrice?: number,
    adminNotes?: string
  ) => {
    if (!isAdminAuthorized) return;
    const path = `quotes/${quoteId}`;
    try {
      await updateDoc(
        doc(db, 'quotes', quoteId),
        sanitizeForFirestore({
          status,
          estimatedPrice,
          adminNotes: adminNotes?.slice(0, 1000),
          updatedAt: serverTimestamp()
        })
      );
      addToast(`Quote #${quoteId} status updated to: ${status.toUpperCase()}`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Convert Quote to Appointment (Admin only)
  const convertQuoteToAppointment = async (
    quoteId: string,
    scheduledDate: string,
    scheduledTime: string,
    technicianId: string
  ): Promise<Appointment | null> => {
    if (!isAdminAuthorized) return null;
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) throw new Error('Quote not found');

    const tech = technicians.find((t) => t.id === technicianId) || technicians[0];
    const apptId = `APT-${Date.now()}`;
    const customerId = quote.customerId || firebaseUser?.uid || 'cust-unknown';

    const docPayload = sanitizeForFirestore({
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
      price: Math.max(250, quote.estimatedPrice || 250),
      squareFootage: quote.squareFootage,
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    try {
      await setDoc(doc(db, 'appointments', apptId), docPayload);
      await updateQuoteStatus(quoteId, 'accepted');
      await sendDialogueMessage(
        customerId,
        quote.customerName,
        'admin',
        'Sacramento Dispatch (Marcus)',
        `Appointment confirmed for ${scheduledDate} (${scheduledTime}) with ${tech.name}. Service estimate: $${docPayload.price}. $0 assessment fee applied.`,
        Number(docPayload.price),
        quote.id,
        apptId
      );
      addToast(`Appointment #${apptId} successfully created from Quote #${quoteId}!`, 'success');
      return {
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
        notes: String(docPayload.notes),
        price: Number(docPayload.price),
        squareFootage: quote.squareFootage,
        paymentStatus: 'pending'
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `appointments/${apptId}`);
    }
  };

  // Book Appointment Online (Persisted to Firestore)
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
    if (!firebaseUser) {
      return {
        success: false,
        error: 'Please sign in with your account to book and save your appointment.'
      };
    }

    const availability = isSlotAvailable(bookingData.scheduledDate, bookingData.scheduledTime);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

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
    const docPayload = sanitizeForFirestore({
      id: apptId,
      customerId: firebaseUser.uid,
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
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    try {
      await setDoc(doc(db, 'appointments', apptId), docPayload);
      await sendDialogueMessage(
        firebaseUser.uid,
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
          customerId: firebaseUser.uid,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          serviceId: bookingData.serviceId,
          serviceName: service ? service.name : 'Pressure Washing Service',
          serviceAddress: bookingData.serviceAddress,
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: bookingData.scheduledTime,
          technicianId: assignedTech.id,
          technicianName: assignedTech.name,
          status: 'scheduled',
          notes: bookingData.notes,
          squareFootage: bookingData.squareFootage || 600,
          price: breakdown.totalDirectPrice,
          paymentStatus: 'pending'
        }
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `appointments/${apptId}`);
    }
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
    try {
      await updateDoc(
        doc(db, 'appointments', id),
        sanitizeForFirestore({
          scheduledDate: date,
          scheduledTime: time,
          ...(isAdminAuthorized && techObj ? { technicianId: techObj.id, technicianName: techObj.name } : {}),
          ...(notes ? { notes: notes.slice(0, 1000) } : {}),
          updatedAt: serverTimestamp()
        })
      );
      addToast(`Appointment #${id} updated to ${date} (${time})`, 'success');
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  // Cancel Appointment
  const cancelAppointment = async (id: string, reason?: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        status: 'cancelled',
        cancellationReason: (reason || 'Cancelled by customer').slice(0, 500),
        updatedAt: serverTimestamp()
      });
      addToast(`Appointment #${id} has been cancelled.`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  // Add Manual Appointment (Admin only)
  const addManualAppointment = async (
    data: Omit<Appointment, 'id' | 'status' | 'paymentStatus'>
  ): Promise<{ success: boolean; error?: string; appointment?: Appointment }> => {
    if (!isAdminAuthorized) {
      return { success: false, error: 'Administrator authorization required.' };
    }
    const availability = isSlotAvailable(data.scheduledDate, data.scheduledTime, undefined, data.technicianId);
    if (!availability.available) {
      return { success: false, error: availability.conflictReason };
    }

    const apptId = `APT-${Date.now()}`;
    const payload = sanitizeForFirestore({
      ...data,
      id: apptId,
      status: 'scheduled',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    try {
      await setDoc(doc(db, 'appointments', apptId), payload);
      addToast(`Manual appointment #${apptId} registered on dispatch schedule!`, 'success');
      return {
        success: true,
        appointment: {
          ...data,
          id: apptId,
          status: 'scheduled',
          paymentStatus: 'pending'
        }
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `appointments/${apptId}`);
    }
  };

  // Mark Completed (Admin / Tech)
  const markAppointmentCompleted = async (id: string, techNotes?: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    try {
      await updateDoc(
        doc(db, 'appointments', id),
        sanitizeForFirestore({
          status: 'completed',
          completedAt: timeStr,
          technicianNotes: techNotes?.slice(0, 1000),
          updatedAt: serverTimestamp()
        })
      );
      addToast(`Appointment #${id} marked as COMPLETED. Service history updated.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const updateTechnicianJobStatus = async (id: string, status: Appointment['status'], technicianNotes?: string) => {
    if (status === 'completed') {
      await markAppointmentCompleted(id, technicianNotes);
      return;
    }
    try {
      await updateDoc(
        doc(db, 'appointments', id),
        sanitizeForFirestore({
          status,
          technicianNotes: technicianNotes?.slice(0, 1000),
          updatedAt: serverTimestamp()
        })
      );
      addToast(`Job #${id} status updated to: ${status.replace('_', ' ').toUpperCase()}`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  // Block Unavailable Dates/Times (Admin only — persisted to Firestore)
  const blockSlot = async (
    date: string,
    timeSlot: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !isAdminAuthorized) {
      const msg = 'Administrator login required to block dates or times.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }

    const slotId = `block-${Date.now()}`;
    const payload = {
      id: slotId,
      date,
      timeSlot,
      reason: reason.trim().slice(0, 300),
      createdBy: firebaseUser.uid,
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'blockedSlots', slotId), payload);
      addToast(`Blocked ${date} (${timeSlot}): "${reason}"`, 'warning');
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `blockedSlots/${slotId}`);
    }
  };

  const unblockSlot = async (id: string) => {
    if (!firebaseUser || !isAdminAuthorized) {
      addToast('Administrator login required to unblock dates or times.', 'error');
      return;
    }
    try {
      await deleteDoc(doc(db, 'blockedSlots', id));
      addToast('Availability restriction removed. Customers can now book this time.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blockedSlots/${id}`);
    }
  };

  // Create or Update Customer Profile in Firestore
  const updateCustomerProfile = async (
    updatedProfile: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser) {
      return { success: false, error: 'You must be signed in to save your customer profile.' };
    }

    const name = (updatedProfile.name ?? currentUser.name ?? '').trim();
    const email = (updatedProfile.email ?? currentUser.email ?? '').trim();
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

    const uid = firebaseUser.uid;
    const customerRef = doc(db, 'customers', uid);

    try {
      if (customerProfileExists) {
        await updateDoc(customerRef, {
          name: name.slice(0, 120),
          email: email.slice(0, 200),
          phone: phone.slice(0, 30),
          address: address.slice(0, 300),
          notes: notes.slice(0, 1000),
          updatedAt: serverTimestamp()
        });
        addToast('Your profile information was updated successfully!', 'success');
      } else {
        await setDoc(customerRef, {
          uid,
          name: name.slice(0, 120),
          email: email.slice(0, 200),
          phone: phone.slice(0, 30),
          address: address.slice(0, 300),
          notes: notes.slice(0, 1000),
          role: 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCustomerProfileExists(true);
        addToast('Customer profile created and saved!', 'success');
      }
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `customers/${uid}`);
    }
  };

  // Admin updates customer record in Firestore
  const updateCustomerRecordByAdmin = async (
    customerId: string,
    updatedData: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdminAuthorized) {
      return { success: false, error: 'Administrator authorization required.' };
    }

    try {
      await updateDoc(
        doc(db, 'customers', customerId),
        sanitizeForFirestore({
          name: updatedData.name?.trim().slice(0, 120),
          email: updatedData.email?.trim().slice(0, 200),
          phone: updatedData.phone?.trim().slice(0, 30),
          address: updatedData.address?.trim().slice(0, 300),
          notes: updatedData.notes?.trim().slice(0, 1000),
          updatedAt: serverTimestamp()
        })
      );
      addToast('Customer CRM record updated.', 'success');
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `customers/${customerId}`);
    }
  };

  // Payment Management (Admin only)
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
    const payDate = new Date().toISOString().split('T')[0];

    const payload = sanitizeForFirestore({
      id: payId,
      appointmentId: paymentData.appointmentId,
      customerName: appt ? appt.customerName : 'Direct Customer',
      amount: paymentData.amount,
      method: paymentData.method,
      status: 'paid',
      transactionRef: txnRef,
      date: payDate,
      notes: paymentData.notes?.slice(0, 500),
      createdAt: serverTimestamp()
    });

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
        customerName: appt ? appt.customerName : 'Direct Customer',
        amount: paymentData.amount,
        method: paymentData.method,
        status: 'paid',
        transactionRef: txnRef,
        date: payDate,
        notes: paymentData.notes
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `payments/${payId}`);
    }
  };

  const updatePaymentStatus = async (
    appointmentId: string,
    status: Appointment['paymentStatus'],
    method?: PaymentRecord['method']
  ) => {
    if (!isAdminAuthorized) return;
    try {
      await updateDoc(
        doc(db, 'appointments', appointmentId),
        sanitizeForFirestore({
          paymentStatus: status,
          ...(method ? { paymentMethod: method } : {}),
          ...(status === 'paid' ? { paidAt: new Date().toISOString().split('T')[0] } : {}),
          updatedAt: serverTimestamp()
        })
      );
      addToast(`Appointment #${appointmentId} payment status marked as ${status.toUpperCase()}`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${appointmentId}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        authReady,
        isAdminAuthorized,
        customerProfileExists,
        profileLoading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signOutUser,
        currentRole,
        setRole: handleSetRole,
        currentUser,
        setCurrentUser,
        selectedTechnicianId,
        setSelectedTechnicianId,
        mfaModalOpen,
        setMfaModalOpen,
        toggleAdminMFA,
        adminAuthenticated: Boolean(firebaseUser && isAdminAuthorized),
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
