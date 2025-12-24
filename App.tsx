
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Bike, 
  Car, 
  Bus, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  User, 
  MessageSquare, 
  ChevronRight, 
  Search,
  Sparkles,
  Zap,
  History as HistoryIcon,
  Menu,
  X,
  CreditCard,
  Phone,
  Share2,
  Info,
  MoreVertical,
  Calendar,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Zap as Power,
  ChevronLeft,
  Plus,
  Check,
  Wallet,
  Star,
  Send,
  Palette,
  Circle,
  ArrowUpRight,
  Info as InfoIcon,
  FilterX,
  Ticket,
  Tag,
  ShieldAlert,
  Lock,
  PowerOff,
  Unlock,
  Cloud,
  ExternalLink,
  ShoppingBag,
  Utensils,
  Bell,
  CheckCircle2,
  Trophy,
  Ghost,
  Heart,
  Target,
  Rocket,
  Users,
  Eye,
  EyeOff,
  Paperclip,
  Smile,
  WifiOff,
  Activity,
  ShieldX,
  CreditCard as CardIcon,
  Wallet as WalletIcon,
  PlusCircle,
  Banknote
} from 'lucide-react';
import { VehicleType, VehicleInfo, BookingState, AppState, HistoryItem, PaymentMethod, PromoCode, Driver, DriverStatus } from './types';
import { getSmartRecommendation } from './services/geminiService';

// --- Types & Constants ---
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'driver';
  timestamp: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'driver';
  text: string;
  timestamp: number;
}

const VEHICLES: VehicleInfo[] = [
  { id: VehicleType.BIKE, name: 'Pro Bike', capacity: 1, baseFare: 120, perKm: 25, icon: 'bike', description: 'Bypass Karachi traffic quickly for solo urban travel.' },
  { id: VehicleType.RICKSHAW, name: 'Eco Rickshaw', capacity: 3, baseFare: 200, perKm: 45, icon: 'car', description: 'Affordable, short-distance local transport for small groups.' },
  { id: VehicleType.COROLLA, name: 'Corolla Grande', capacity: 4, baseFare: 550, perKm: 85, icon: 'car', description: 'Premium sedan comfort for business and city commutes.' },
  { id: VehicleType.COROLLA_CROSS, name: 'Corolla Cross Hybrid', capacity: 4, baseFare: 850, perKm: 120, icon: 'car', description: 'Premium choice for weddings and VIP services.' },
  { id: VehicleType.REVO, name: 'Hilux Revo', capacity: 4, baseFare: 1200, perKm: 180, icon: 'car', description: 'Rugged 4x4 pickup for heavy terrain.' },
  { id: VehicleType.FORTUNER, name: 'Fortuner Sigma4', capacity: 7, baseFare: 2000, perKm: 250, icon: 'car', description: 'Ultimate luxury SUV for high-status travel.' },
  { id: VehicleType.HIACE, name: 'Hiace Grand Cabin', capacity: 14, baseFare: 3500, perKm: 300, icon: 'bus', description: 'Spacious and safe transportation for large groups.' },
  { id: VehicleType.COASTER, name: 'Coaster Salon', capacity: 30, baseFare: 8000, perKm: 500, icon: 'bus', description: 'Mini-bus solution for corporate events.' }
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Ahmad K.', status: DriverStatus.ONLINE, vehicleType: VehicleType.COROLLA, rating: 4.9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', x: 100, y: 150 },
  { id: 'd2', name: 'Zubair S.', status: DriverStatus.BUSY, vehicleType: VehicleType.COROLLA, rating: 4.7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zubair', x: 220, y: 180 },
  { id: 'd3', name: 'Kamran M.', status: DriverStatus.ONLINE, vehicleType: VehicleType.BIKE, rating: 4.8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamran', x: 50, y: 300 },
  { id: 'd4', name: 'Irfan T.', status: DriverStatus.OFFLINE, vehicleType: VehicleType.RICKSHAW, rating: 4.5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Irfan', x: 300, y: 50 },
  { id: 'd5', name: 'Salman J.', status: DriverStatus.ONLINE, vehicleType: VehicleType.REVO, rating: 5.0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Salman', x: 350, y: 320 },
  { id: 'd6', name: 'Waqas A.', status: DriverStatus.BUSY, vehicleType: VehicleType.BIKE, rating: 4.6, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waqas', x: 180, y: 80 },
  { id: 'd7', name: 'Bilal R.', status: DriverStatus.ONLINE, vehicleType: VehicleType.HIACE, rating: 4.9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal', x: 280, y: 250 },
  { id: 'd8', name: 'Farooq L.', status: DriverStatus.ONLINE, vehicleType: VehicleType.COROLLA_CROSS, rating: 4.9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farooq', x: 120, y: 350 },
];

// --- Added Constants to fix "Cannot find name" errors ---
const PAYMENTS_KEY = 'transito_payments';
const HISTORY_KEY = 'transito_history';
const MARKER_PREFS_KEY = 'transito_marker_prefs';

const MARKER_COLORS = [
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Orange', hex: '#f97316' },
];

const MARKER_ICONS = [
  { id: 'default', icon: Car },
  { id: 'bike', icon: Bike },
  { id: 'bus', icon: Bus },
  { id: 'shield', icon: ShieldCheck },
  { id: 'navigation', icon: Navigation },
  { id: 'zap', icon: Zap },
];

const DEFAULT_PAYMENTS: PaymentMethod[] = [
  { id: 'p1', type: 'card', provider: 'Visa Corporate', lastFour: '4242', isDefault: true },
  { id: 'p2', type: 'wallet', provider: 'EasyPaisa', isDefault: false },
];

const CANCEL_REASONS = [
  "Driver is taking too long",
  "Changed my mind",
  "Incorrect pickup location",
  "Found another ride",
  "Price too high",
  "Vehicle issues"
];

// --- Helper Components ---

const VehicleIconRenderer = ({ icon, className }: { icon: string, className?: string }) => {
  if (icon === 'bike') return <Bike className={className} />;
  if (icon === 'bus') return <Bus className={className} />;
  return <Car className={className} />;
};

const NotificationToast: React.FC<{ notification: AppNotification, onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const bgColor = {
    info: 'bg-indigo-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    driver: 'bg-amber-600'
  }[notification.type];

  return (
    <div className={`${bgColor} text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-full duration-300 mb-2 border border-white/10 backdrop-blur-md`}>
      <div className="bg-black/20 p-2 rounded-xl">
        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <h4 className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">{notification.title}</h4>
        <p className="text-xs font-medium text-white/90">{notification.message}</p>
      </div>
      <button onClick={() => onDismiss(notification.id)} className="p-1 hover:bg-black/10 rounded-lg">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const DiscoveryMap: React.FC<{ drivers: Driver[]; selectedVehicle: VehicleType | null }> = ({ drivers, selectedVehicle }) => {
  const onlineDrivers = drivers.filter(d => d.status === DriverStatus.ONLINE);

  return (
    <div className="relative w-full h-56 bg-neutral-900 overflow-hidden rounded-2xl border border-neutral-800 shadow-inner mb-6 group">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <line x1="200" y1="0" x2="200" y2="400" stroke="#222" strokeWidth="1" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="#222" strokeWidth="1" />
        
        {onlineDrivers.map(driver => {
          const isRelevant = selectedVehicle === null || driver.vehicleType === selectedVehicle;
          const statusColor = '#10b981';
          const opacity = isRelevant ? 1 : 0.15;
          
          return (
            <g key={driver.id} className="transition-all duration-1000 ease-in-out" style={{ opacity }}>
              {isRelevant && (
                <circle cx={driver.x} cy={driver.y} r="18" fill={statusColor} className="opacity-5 animate-pulse" />
              )}
              <circle cx={driver.x} cy={driver.y} r="5" fill={statusColor} className="shadow-lg filter drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
              {isRelevant && (
                <g transform={`translate(${driver.x - 8}, ${driver.y - 24})`}>
                   <rect width="16" height="12" rx="2" fill="black" fillOpacity="0.6" />
                   <path d="M 8 12 L 8 16" stroke="black" strokeOpacity="0.6" strokeWidth="2" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-800 pointer-events-none">
        <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-500" /> Live Discovery
        </p>
      </div>
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-neutral-800">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[7px] font-black text-white/70 uppercase">Online Only</span>
        </div>
      </div>
    </div>
  );
};

const LiveMap: React.FC<{ progress: number; vehicleType: VehicleType; markerColor: string; markerIconId: string; isOutOfStation: boolean }> = ({ progress, vehicleType, markerColor, markerIconId, isOutOfStation }) => {
  const renderMarkerIcon = () => {
    const IconComponent = MARKER_ICONS.find(i => i.id === markerIconId)?.icon || Car;
    return <IconComponent className="w-5 h-5" />;
  };

  const isLeavingBoundary = progress > 75 && isOutOfStation;

  return (
    <div className="relative w-full h-full bg-neutral-900 overflow-hidden rounded-t-3xl">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <path d="M 50 350 L 50 150 L 250 150 L 250 50 L 350 50" fill="none" stroke="#333" strokeWidth="8" strokeLinecap="round" />
        <line x1="280" y1="0" x2="280" y2="400" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" className="opacity-30" />
        <path d="M 50 350 L 50 150 L 250 150 L 250 50 L 350 50" fill="none" stroke={markerColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - progress / 100)} className="transition-all duration-500 ease-linear shadow-lg" />
        <circle cx="50" cy="350" r="6" fill="#10b981" />
        <circle cx="50" cy="350" r="12" fill="#10b981" className="opacity-20 animate-ping" />
        <circle cx="350" cy="50" r="6" fill={markerColor} />
        <foreignObject x={-15} y={-15} width="30" height="30" style={{ offsetPath: "path('M 50 350 L 50 150 L 250 150 L 250 50 L 350 50')", offsetDistance: `${progress}%` }} className="transition-all duration-500 ease-linear">
          <div className="p-1.5 rounded-full shadow-xl text-black border-2 border-white transition-colors duration-300 flex items-center justify-center" style={{ backgroundColor: markerColor, boxShadow: `0 0 15px ${markerColor}80` }}>
            {renderMarkerIcon()}
          </div>
        </foreignObject>
      </svg>
      <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700 w-fit flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold tracking-widest text-neutral-300 uppercase">Live Tracking • Karachi</span>
        </div>
        <div className={`px-3 py-1.5 rounded-full border w-fit flex items-center gap-2 transition-colors ${isLeavingBoundary ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black/60 border-neutral-700 text-neutral-400'}`}>
          <ShieldAlert className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">{isLeavingBoundary ? 'ZONE: EXITING KARACHI' : 'ZONE: KARACHI URBAN'}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SEARCHING);
  const [booking, setBooking] = useState<BookingState>({ pickup: '', dropoff: '', passengers: 1, vehicle: null, estimatedPrice: null, appliedPromo: null });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'payments' | 'customization' | 'add-payment'>('main');
  const [rideProgress, setRideProgress] = useState(0);
  const [eta, setEta] = useState(12);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showMarkerCustomizer, setShowMarkerCustomizer] = useState(false);
  const [ignitionLocked, setIgnitionLocked] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  
  const [newPaymentType, setNewPaymentType] = useState<'card' | 'wallet'>('card');
  const [newPaymentProvider, setNewPaymentProvider] = useState('');
  const [newPaymentCardNumber, setNewPaymentCardNumber] = useState('');

  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [activeDriverStatus, setActiveDriverStatus] = useState<DriverStatus>(DriverStatus.ONLINE);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [isDriverTyping, setIsDriverTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [markerColor, setMarkerColor] = useState(MARKER_COLORS[0].hex);
  const [markerIconId, setMarkerIconId] = useState('default');

  const [demand, setDemand] = useState(45);
  const [supply, setSupply] = useState(30);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any>(null);

  const isOutOfStation = useMemo(() => booking.dropoff && !booking.dropoff.toLowerCase().includes('karachi'), [booking.dropoff]);
  const surgeMultiplier = useMemo(() => Math.min(Math.max(1.0, parseFloat((demand / Math.max(supply, 1)).toFixed(1))), 2.5), [demand, supply]);

  // Auto-scroll chat to bottom when messages or typing status change
  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, isDriverTyping, isChatOpen]);

  useEffect(() => {
    if (appState !== AppState.SEARCHING) return;
    const moveInterval = setInterval(() => {
      setDrivers(prev => prev.map(d => {
        if (d.status === DriverStatus.OFFLINE) return d;
        const dx = (Math.random() - 0.5) * 4;
        const dy = (Math.random() - 0.5) * 4;
        return { ...d, x: Math.max(10, Math.min(390, d.x + dx)), y: Math.max(10, Math.min(390, d.y + dy)) };
      }));
    }, 2000);
    return () => clearInterval(moveInterval);
  }, [appState]);

  const addNotification = useCallback((title: string, message: string, type: AppNotification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  useEffect(() => {
    const savedPayments = localStorage.getItem(PAYMENTS_KEY);
    if (savedPayments) setPaymentMethods(JSON.parse(savedPayments));
    else {
      setPaymentMethods(DEFAULT_PAYMENTS);
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    }
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedPrefs = localStorage.getItem(MARKER_PREFS_KEY);
    if (savedPrefs) {
      const { color, iconId } = JSON.parse(savedPrefs);
      if (color) setMarkerColor(color);
      if (iconId) setMarkerIconId(iconId);
    }
  }, []);

  const savePaymentsToLocal = (newMethods: PaymentMethod[]) => {
    setPaymentMethods(newMethods);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(newMethods));
  };

  const addPaymentMethod = () => {
    if (!newPaymentProvider) return;
    const newMethod: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      type: newPaymentType,
      provider: newPaymentProvider,
      lastFour: newPaymentType === 'card' ? newPaymentCardNumber.slice(-4) : undefined,
      isDefault: paymentMethods.length === 0
    };
    const updated = [...paymentMethods, newMethod];
    savePaymentsToLocal(updated);
    setMenuView('payments');
    addNotification("Payment Added", `${newPaymentProvider} linked successfully.`, "success");
    setNewPaymentProvider('');
    setNewPaymentCardNumber('');
  };

  const deletePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter(p => p.id !== id);
    if (paymentMethods.find(p => p.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    savePaymentsToLocal(updated);
    addNotification("Payment Deleted", "Method removed from your account.", "info");
  };

  const setDefaultPayment = (id: string) => {
    const updated = paymentMethods.map(p => ({ ...p, isDefault: p.id === id }));
    savePaymentsToLocal(updated);
    addNotification("Default Updated", "Payment preferences saved.", "success");
  };

  useEffect(() => {
    if (booking.vehicle) {
      const v = VEHICLES.find(x => x.id === booking.vehicle);
      if (v) {
        let price = Math.round((v.baseFare + (v.perKm * 10)) * surgeMultiplier);
        if (booking.appliedPromo) price = Math.round(price * (1 - booking.appliedPromo.discountPercent / 100));
        if (isOutOfStation) price += 1000;
        setBooking(prev => ({ ...prev, estimatedPrice: price }));
      }
    }
  }, [booking.vehicle, surgeMultiplier, booking.appliedPromo, isOutOfStation]);

  useEffect(() => {
    let interval: any;
    if (appState === AppState.ACTIVE_RIDE && !ignitionLocked) {
      interval = setInterval(() => {
        setRideProgress(prev => {
          if (prev === 20) addNotification("Driver Approaching", "Ahmad K. is 2 minutes away.", "info");
          if (prev === 80 && isOutOfStation) addNotification("Boundary Alert", "Leaving city limits.", "warning");
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, ignitionLocked, addNotification, isOutOfStation]);

  useEffect(() => {
    if (appState === AppState.ACTIVE_RIDE) setEta(Math.max(0, Math.round(12 * (1 - rideProgress / 100))));
  }, [rideProgress, appState]);

  const handleConfirmBooking = () => {
    setAppState(AppState.BOOKING);
    setTimeout(() => addNotification("Searching Drivers", "Finding the best route for you.", "info"), 1000);
    setTimeout(() => {
      addNotification("Driver Accepted", "Ahmad K. (4.9★) confirmed.", "success");
      setAppState(AppState.ACTIVE_RIDE);
      setChatMessages([{ id: '1', sender: 'driver', text: "Assalamu Alaikum! I'm on my way.", timestamp: Date.now() }]);
      if (isOutOfStation) {
        setTimeout(() => {
          setIgnitionLocked(true);
          addNotification("System Lock", "Out-of-station protocol active.", "warning");
        }, 1500);
      }
    }, 4500);
  };

  const saveToHistory = (status: 'completed' | 'cancelled', options?: { reason?: string, rating?: number }) => {
    if (!booking.vehicle || !booking.estimatedPrice) return;
    const newItem: HistoryItem = { id: Math.random().toString(36).substr(2, 9), vehicleType: booking.vehicle, pickup: booking.pickup, dropoff: booking.dropoff, price: booking.estimatedPrice, timestamp: Date.now(), status, rating: options?.rating, cancellationReason: options?.reason };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    setAppState(AppState.SEARCHING);
    setBooking({ pickup: '', dropoff: '', passengers: 1, vehicle: null, estimatedPrice: null, appliedPromo: null });
    setRideProgress(0);
    setAiAdvice(null);
    setShowRatingModal(false);
    setShowCancelModal(false);
    setIgnitionLocked(false);
    setIsChatOpen(false);
  };

  const handleSendMessage = () => {
    if (!currentChatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: currentChatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setCurrentChatInput('');
    setTimeout(() => {
      setIsDriverTyping(true);
      setTimeout(() => {
        setIsDriverTyping(false);
        const responses = ["Got it.", "Understood.", "Okay.", "Traffic is heavy."];
        const driverMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'driver', text: responses[Math.floor(Math.random() * responses.length)], timestamp: Date.now() };
        setChatMessages(prev => [...prev, driverMsg]);
      }, 2000);
    }, 500);
  };

  const toggleIgnitionLock = () => {
    setIgnitionLocked(!ignitionLocked);
    if (!ignitionLocked) addNotification("Security Alert", "Ignition locked.", "warning");
    else addNotification("Security Update", "Ignition released.", "info");
  };

  const handleAskAI = async () => {
    if (!booking.pickup || !booking.dropoff) return;
    setAiLoading(true);
    const advice = await getSmartRecommendation(`From ${booking.pickup} to ${booking.dropoff}.`, booking.passengers);
    if (advice) {
      setAiAdvice(advice);
      setBooking(prev => ({ ...prev, vehicle: advice.recommendedVehicle as VehicleType }));
    }
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      <div className="fixed top-20 right-4 left-4 z-[100] max-w-sm mx-auto pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {notifications.map(n => <NotificationToast key={n.id} notification={n} onDismiss={dismissNotification} />)}
        </div>
      </div>

      <header className="fixed top-0 inset-x-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/10"><Zap className="w-6 h-6 text-black fill-current" /></div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic cursor-pointer leading-none" onClick={() => setAppState(AppState.SEARCHING)}>Transito</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[7px] font-black text-emerald-400/80 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-2 h-2" /> Verified Fleet</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => { setIsMenuOpen(true); setMenuView('main'); }} className="p-2 hover:bg-neutral-800 rounded-full transition-colors"><Menu /></button>
        </div>
      </header>

      {ignitionLocked && appState === AppState.ACTIVE_RIDE && (
        <div className="fixed inset-0 z-[200] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
           <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-500 blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative border-4 border-red-500 p-8 rounded-full"><PowerOff className="w-24 h-24 text-red-500 animate-pulse" /></div>
           </div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">IGNITION LOCKED</h2>
           <button onClick={toggleIgnitionLock} className="w-full max-w-xs bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-red-500/50"><Unlock className="w-4 h-4" /> RELEASE</button>
        </div>
      )}

      {isChatOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
          <div className="flex-1 max-w-lg mx-auto w-full flex flex-col pt-20">
            <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-xl rounded-t-[2rem]">
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 rounded-full bg-neutral-800" alt="Driver" />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-neutral-900 rounded-full transition-colors ${activeDriverStatus === DriverStatus.ONLINE ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div><h3 className="font-black text-white text-sm italic uppercase tracking-tight">AHMAD K.</h3><p className={`text-[10px] font-bold uppercase tracking-widest ${activeDriverStatus === DriverStatus.ONLINE ? 'text-emerald-500' : 'text-red-500'}`}>{activeDriverStatus}</p></div>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="p-2 bg-neutral-800 rounded-full text-neutral-400"><X className="w-5 h-5" /></button>
            </header>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth">
               {chatMessages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs font-medium shadow-xl ${msg.sender === 'user' ? 'bg-amber-500 text-black rounded-tr-none font-bold' : 'bg-neutral-800 text-white rounded-tl-none border border-neutral-700'}`}>
                      {msg.text}
                    </div>
                 </div>
               ))}
               {isDriverTyping && (
                 <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                   <div className="flex items-center gap-2 bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm">
                     <div className="flex gap-1.5">
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-duration:0.6s]"></span>
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]"></span>
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></span>
                     </div>
                     <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic ml-1">Driver is typing...</span>
                   </div>
                 </div>
               )}
            </div>
            <footer className="p-4 bg-neutral-900 border-t border-neutral-800 mb-6 mx-4 rounded-3xl shadow-2xl flex items-center gap-3">
               <input type="text" value={currentChatInput} onChange={(e) => setCurrentChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Message..." className="flex-1 bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-amber-500/50" />
               <button onClick={handleSendMessage} className="bg-amber-500 text-black p-3 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"><Send className="w-5 h-5" /></button>
            </footer>
          </div>
        </div>
      )}

      <main className={`pt-20 pb-24 max-w-lg mx-auto ${appState === AppState.ACTIVE_RIDE ? 'px-0 pt-16' : 'px-4'}`}>
        {appState === AppState.SEARCHING && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest italic flex items-center gap-2"><Target className="w-3 h-3" /> Live Fleet Tracking</p>
              <DiscoveryMap drivers={drivers} selectedVehicle={booking.vehicle} />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white italic uppercase"><Navigation className="w-5 h-5 text-amber-500" /> Plan Journey</h2>
              <div className="space-y-3">
                <input className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-amber-500/50" placeholder="Pickup" value={booking.pickup} onChange={e => setBooking({...booking, pickup: e.target.value})} />
                <input className={`w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-amber-500/50 ${isOutOfStation ? 'ring-2 ring-red-500/20' : ''}`} placeholder="Dropoff" value={booking.dropoff} onChange={e => setBooking({...booking, dropoff: e.target.value})} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 bg-neutral-800 px-3 py-2 rounded-lg border border-neutral-700/50">
                  <User className="w-4 h-4 text-neutral-400" />
                  <input type="number" min="1" max="30" className="bg-transparent border-none w-10 text-sm p-0 text-white font-bold" value={booking.passengers} onChange={e => setBooking({...booking, passengers: parseInt(e.target.value) || 1})} />
                </div>
                <button onClick={handleAskAI} disabled={aiLoading} className="bg-neutral-800 text-amber-500 p-2 px-4 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:bg-neutral-700">
                  {aiLoading ? <Sparkles className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />} AI Suggest
                </button>
              </div>
            </div>

            <div className="space-y-2">
               <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">Fleet Categories</p>
               <div className="grid grid-cols-1 gap-2">
                {VEHICLES.slice(0, 4).map((v) => (
                  <button key={v.id} onClick={() => setBooking({...booking, vehicle: v.id})} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${booking.vehicle === v.id ? 'bg-amber-500 border-amber-400 text-black shadow-xl scale-[1.01]' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${booking.vehicle === v.id ? 'bg-black/10' : 'bg-neutral-800'}`}><VehicleIconRenderer icon={v.icon} className="w-6 h-6" /></div>
                      <div className="text-left"><p className="font-black text-sm uppercase italic leading-none mb-1">{v.name}</p><p className="text-[9px] font-bold opacity-70 italic">{v.description}</p></div>
                    </div>
                    <div className="text-right"><p className="font-black text-sm tracking-tighter">Rs. {Math.round((v.baseFare + (v.perKm * 10)) * surgeMultiplier) + (isOutOfStation ? 1000 : 0)}</p></div>
                  </button>
                ))}
              </div>
            </div>

            <button disabled={!booking.vehicle || !booking.pickup || !booking.dropoff} onClick={handleConfirmBooking} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 uppercase tracking-[0.2em] italic transition-all active:scale-95 shadow-amber-500/10">Confirm Ride</button>
          </div>
        )}

        {appState === AppState.BOOKING && (
          <div className="px-4 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
            <Navigation className="w-16 h-16 text-amber-500 animate-bounce" />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Requesting Fleet...</h2>
          </div>
        )}

        {appState === AppState.ACTIVE_RIDE && (
          <div className="fixed inset-0 pt-16 pb-24 flex flex-col animate-in fade-in duration-500">
            <div className="flex-1 relative"><LiveMap progress={rideProgress} vehicleType={booking.vehicle || VehicleType.BIKE} markerColor={markerColor} markerIconId={markerIconId} isOutOfStation={isOutOfStation} /></div>
            <div className="bg-neutral-900 border-t border-neutral-800 p-6 rounded-t-[2.5rem] shadow-2xl relative z-10 -mt-10">
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-6"></div>
              {isOutOfStation && <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-4 mb-4 flex items-center gap-4 ring-2 ring-red-500/20"><ShieldX className="w-5 h-5 text-red-500 animate-pulse" /><p className="text-[10px] font-black text-red-500 uppercase italic">Out-of-Karachi Protocol Active</p></div>}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-14 h-14 rounded-2xl bg-neutral-800 p-1 border border-neutral-700" />
                  <div><h3 className="font-black text-white flex items-center gap-2 italic uppercase">AHMAD K. <span className="text-amber-500 text-[10px]">4.9 ★</span></h3><p className="text-[11px] text-neutral-500 uppercase font-black">{VEHICLES.find(v => v.id === booking.vehicle)?.name}</p></div>
                </div>
                <div className="text-right"><p className="text-[10px] text-neutral-500 uppercase font-black italic">ETA</p><p className="text-2xl font-black text-amber-500 italic">{eta} MIN</p></div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button className="flex flex-col items-center gap-2 p-3 bg-neutral-800 rounded-2xl text-amber-500 hover:bg-neutral-700 transition-colors"><Phone className="w-5 h-5" /><span className="text-[10px] font-bold italic">CALL</span></button>
                <button onClick={() => setIsChatOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-neutral-800 rounded-2xl text-amber-500 hover:bg-neutral-700 transition-colors"><MessageSquare className="w-5 h-5" /><span className="text-[10px] font-bold italic">CHAT</span></button>
                <button onClick={() => setShowMarkerCustomizer(true)} className="flex flex-col items-center gap-2 p-3 bg-neutral-800 text-amber-500 hover:bg-neutral-700 transition-colors"><Palette className="w-5 h-5" /><span className="text-[10px] font-bold italic">STYLE</span></button>
                <button onClick={toggleIgnitionLock} className="flex flex-col items-center gap-2 p-3 bg-red-950/40 border border-red-500/20 rounded-2xl hover:bg-red-900/50 transition-colors"><Lock className={`w-5 h-5 text-red-500 ${ignitionLocked ? 'fill-red-500' : ''}`} /><span className="text-[10px] font-black text-red-500 uppercase italic">LOCK</span></button>
              </div>
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div><p className="text-[10px] text-neutral-500 uppercase font-bold italic">Summary</p><p className="text-sm font-black text-white italic">RS. {booking.estimatedPrice}</p></div>
                {surgeMultiplier > 1 && <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 text-amber-500" /><span className="text-[8px] font-black text-amber-500 uppercase">{surgeMultiplier}x Surge</span></div>}
              </div>
            </div>
          </div>
        )}

        {appState === AppState.HISTORY && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Trip History</h2>
            {history.length === 0 ? <div className="py-20 text-center opacity-40"><HistoryIcon className="w-12 h-12 mx-auto mb-4" /></div> : 
              <div className="space-y-4 pb-10">
                {history.map(item => (
                  <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-sm uppercase italic">{VEHICLES.find(v => v.id === item.vehicleType)?.name}</p>
                      <p className="font-black text-amber-500 italic text-sm">Rs. {item.price}</p>
                    </div>
                    <p className="text-[10px] text-neutral-500 italic uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 inset-x-0 bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-800 px-8 py-4 flex items-center justify-between z-[60] transition-transform ${appState === AppState.ACTIVE_RIDE ? 'translate-y-full' : 'translate-y-0'}`}>
        <button onClick={() => setAppState(AppState.SEARCHING)} className={appState === AppState.SEARCHING ? 'text-amber-500' : 'text-neutral-500'}><MapPin className="w-5 h-5" /></button>
        <button onClick={() => setAppState(AppState.HISTORY)} className={appState === AppState.HISTORY ? 'text-amber-500' : 'text-neutral-500'}><HistoryIcon className="w-5 h-5" /></button>
        <button onClick={() => { setIsMenuOpen(true); setMenuView('payments'); }} className="text-neutral-500"><Wallet className="w-5 h-5" /></button>
        <button onClick={() => { setIsMenuOpen(true); setMenuView('customization'); }} className="text-neutral-500"><Palette className="w-5 h-5" /></button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-neutral-900 shadow-2xl border-l border-neutral-800 flex flex-col animate-in slide-in-from-right duration-500">
              <header className="p-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                    <button onClick={() => setMenuView(menuView === 'add-payment' ? 'payments' : 'main')} className="p-2 bg-neutral-800 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="font-black text-white italic uppercase tracking-tighter text-xl">
                       {menuView === 'payments' ? 'PAYMENTS' : menuView === 'add-payment' ? 'ADD NEW' : 'CUSTOMIZE'}
                    </h3>
                 </div>
                 <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-neutral-800 rounded-lg"><X className="w-5 h-5" /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {menuView === 'payments' && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">Saved Methods</p>
                          <button onClick={() => setMenuView('add-payment')} className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest italic">
                             <Plus className="w-3 h-3" /> Add New
                          </button>
                       </div>
                       {paymentMethods.length === 0 ? (
                         <div className="text-center py-10 opacity-40"><Banknote className="w-12 h-12 mx-auto mb-2" /><p className="text-[10px] font-black uppercase italic">No methods found</p></div>
                       ) : (
                         paymentMethods.map(p => (
                           <div key={p.id} className={`group relative bg-neutral-800 border-2 rounded-2xl p-5 transition-all ${p.isDefault ? 'border-amber-500' : 'border-neutral-700'}`}>
                              <div className="flex items-start justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${p.isDefault ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-amber-500'}`}>
                                       {p.type === 'card' ? <CardIcon className="w-5 h-5" /> : <WalletIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                       <p className="font-black text-sm text-white italic uppercase leading-none mb-1">{p.provider}</p>
                                       <p className="text-[10px] text-neutral-500 font-bold tracking-widest">{p.lastFour ? `•••• ${p.lastFour}` : 'Linked Wallet'}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    {!p.isDefault && (
                                      <button onClick={() => setDefaultPayment(p.id)} className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                                         <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                                      </button>
                                    )}
                                    <button onClick={() => deletePaymentMethod(p.id)} className="p-2 bg-neutral-900 rounded-lg hover:bg-red-900/30 group/del transition-colors">
                                       <Trash2 className="w-4 h-4 text-neutral-600 group-hover/del:text-red-500" />
                                    </button>
                                 </div>
                              </div>
                              {p.isDefault && <div className="absolute -top-2.5 right-6 bg-amber-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-widest border-2 border-neutral-900 shadow-lg">Default</div>}
                           </div>
                         ))
                       )}
                    </div>
                 )}

                 {menuView === 'add-payment' && (
                    <div className="space-y-8">
                       <div className="flex p-1 bg-neutral-800 rounded-xl">
                          <button onClick={() => setNewPaymentType('card')} className={`flex-1 py-3 text-[10px] font-black uppercase italic rounded-lg transition-all ${newPaymentType === 'card' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Credit Card</button>
                          <button onClick={() => setNewPaymentType('wallet')} className={`flex-1 py-3 text-[10px] font-black uppercase italic rounded-lg transition-all ${newPaymentType === 'wallet' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Mobile Wallet</button>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 italic">Provider Name</label>
                             <input value={newPaymentProvider} onChange={(e) => setNewPaymentProvider(e.target.value)} placeholder={newPaymentType === 'card' ? "e.g. Mastercard Gold" : "e.g. EasyPaisa"} className="w-full bg-neutral-800 border-none rounded-2xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-amber-500/50" />
                          </div>
                          {newPaymentType === 'card' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                               <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 italic">Card Number</label>
                               <input value={newPaymentCardNumber} onChange={(e) => setNewPaymentCardNumber(e.target.value)} maxLength={16} placeholder="•••• •••• •••• ••••" className="w-full bg-neutral-800 border-none rounded-2xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-amber-500/50" />
                            </div>
                          )}
                       </div>

                       <div className="pt-4">
                          <button onClick={addPaymentMethod} disabled={!newPaymentProvider} className="w-full bg-amber-500 disabled:opacity-50 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest italic shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
                             Add Link Method
                          </button>
                       </div>
                    </div>
                 )}

                 {(menuView === 'customization' || menuView === 'main') && (
                    <div className="space-y-8">
                       <div>
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 italic">Marker Tint</p>
                          <div className="flex flex-wrap gap-4">
                             {MARKER_COLORS.map(c => (
                               <button key={c.hex} onClick={() => setMarkerColor(c.hex)} className={`w-10 h-10 rounded-full border-4 transition-all ${markerColor === c.hex ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c.hex }} />
                             ))}
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 italic">Icon Geometry</p>
                          <div className="grid grid-cols-4 gap-4">
                             {MARKER_ICONS.map(i => {
                               const Icon = i.icon;
                               return (
                                 <button key={i.id} onClick={() => setMarkerIconId(i.id)} className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${markerIconId === i.id ? 'bg-amber-500 text-black shadow-lg scale-105' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}><Icon className="w-6 h-6" /></button>
                               );
                             })}
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {appState === AppState.ACTIVE_RIDE && (
        <div className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800 px-6 py-4 flex items-center justify-between z-[70]">
          <button onClick={() => setShowCancelModal(true)} className="bg-red-500/10 text-red-500 p-2 rounded-lg active:scale-95 transition-transform hover:bg-red-500/20"><X className="w-5 h-5" /></button>
          <button onClick={() => saveToHistory('completed')} className="bg-amber-500 text-black px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest italic shadow-xl shadow-amber-500/20 active:scale-95 transition-transform hover:bg-amber-400">Complete Trip</button>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-end justify-center px-4 pb-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 animate-in slide-in-from-bottom-full duration-500">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Cancel Trip?</h3>
                <button onClick={() => setShowCancelModal(false)} className="p-2 bg-neutral-800 rounded-full text-neutral-400"><X className="w-5 h-5" /></button>
             </div>
             <div className="space-y-2">
                {CANCEL_REASONS.map(reason => (
                  <button key={reason} onClick={() => saveToHistory('cancelled', { reason })} className="w-full text-left p-4 rounded-2xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 text-[10px] font-black text-neutral-300 uppercase italic tracking-wider transition-colors">{reason}</button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
