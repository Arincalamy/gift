import React, { useState, useEffect, useRef } from 'react';
import { GiftCard, SecuritySettings, Announcement } from '../types';

// --- Sub-component for Locked View ---
const LockedView = () => (
    <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        <h3 className="mt-4 text-2xl font-bold text-white">Application Locked</h3>
        <p className="mt-2 text-red-300">Suspicious activity has been detected. This terminal has been locked by the administrator.</p>
    </div>
);


// --- Sub-component for Redeeming a Card ---
const RedeemCardView = ({ balance, onRedeem, onThreatDetected, securitySettings }: { 
    balance: number; 
    onRedeem: (code: string) => { success: boolean; message: string; amount?: number };
    onThreatDetected: () => void;
    securitySettings: SecuritySettings;
}) => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    
    const playAlarmSound = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.5);
    };

    useEffect(() => {
        if (securitySettings.systemEnabled && failedAttempts >= securitySettings.failedAttemptsThreshold) {
            if (securitySettings.playSound) {
                playAlarmSound();
            }
            onThreatDetected();
            setFailedAttempts(0); // Reset after triggering
        }
    }, [failedAttempts, onThreatDetected, securitySettings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            setMessage('Please enter a gift card code.');
            setMessageType('error');
            return;
        }
        const result = onRedeem(code.trim());
        setMessage(result.message);
        setMessageType(result.success ? 'success' : 'error');
        
        if (result.success) {
            setCode('');
            setFailedAttempts(0); // Reset on success
        } else {
            setFailedAttempts(prev => prev + 1);
        }
    };

    const messageClass = messageType === 'success'
        ? 'text-green-400 bg-green-900/50'
        : 'text-red-400 bg-red-900/50';

    return (
        <>
            <div className="text-center bg-gray-900 p-6 rounded-lg">
                <p className="text-lg font-medium text-gray-300">Your Current Balance</p>
                <p className="text-5xl font-bold text-indigo-400">${balance.toFixed(2)}</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="gift-code" className="sr-only">Gift Card Code</label>
                    <input
                        id="gift-code"
                        name="code"
                        type="text"
                        autoComplete="off"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="ENTER-YOUR-CODE"
                    />
                </div>
                {message && (
                    <div role="alert" className={`p-3 rounded-md text-center text-sm font-medium ${messageClass}`}>
                        {message}
                    </div>
                )}
                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                        Accept
                    </button>
                </div>
            </form>
        </>
    );
};


// --- Sub-component for Ordering a Card ---
const OrderCardView = ({ onPlaceOrder }: { onPlaceOrder: (orderData: any) => void }) => {
    const [step, setStep] = useState(1); // 1: form, 2: summary, 3: confirmed
    const [order, setOrder] = useState({
        firstName: '',
        lastName: '',
        email: '',
        amount: '',
        deliveryDate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOrder(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleConfirm = () => {
        onPlaceOrder({ ...order, amount: Number(order.amount) });
        setStep(3);
    };

    if (step === 3) {
        return (
            <div className="text-center space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-2xl font-bold text-white">Thank You for Your Order!</h3>
                <p className="text-gray-400">Your order has been placed. Please wait for the CEO to confirm payment and activate your gift card.</p>
                <p className="text-gray-500 text-sm">You will be notified once it's active.</p>
                <button onClick={() => setStep(1)} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white">
                    Place Another Order
                </button>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-center text-white">Confirm Your Order</h3>
                <div className="bg-gray-900 p-6 rounded-lg space-y-3">
                    <div className="flex justify-between text-gray-300"><span className="font-medium">To:</span> <span>{order.firstName} {order.lastName}</span></div>
                    <div className="flex justify-between text-gray-300"><span className="font-medium">Email:</span> <span>{order.email}</span></div>
                    <div className="flex justify-between text-gray-300"><span className="font-medium">Delivery Date:</span> <span>{new Date(order.deliveryDate).toLocaleDateString()}</span></div>
                    <div className="flex justify-between text-indigo-400 text-2xl font-bold border-t border-gray-700 pt-3 mt-3"><span >Amount:</span> <span>${Number(order.amount).toFixed(2)}</span></div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
                        Back
                    </button>
                    <button onClick={handleConfirm} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Confirm & Pay
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="firstName" type="text" placeholder="First Name" required value={order.firstName} onChange={handleChange} className="input-style" />
                <input name="lastName" type="text" placeholder="Last Name" required value={order.lastName} onChange={handleChange} className="input-style" />
            </div>
            <input name="email" type="email" placeholder="Email Address" required value={order.email} onChange={handleChange} className="input-style" />
            <input name="amount" type="number" placeholder="Amount ($)" required min="1" step="0.01" value={order.amount} onChange={handleChange} className="input-style" />
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-400 mb-1">Requested Delivery Date</label>
              <input id="deliveryDate" name="deliveryDate" type="date" required min={new Date().toISOString().split('T')[0]} value={order.deliveryDate} onChange={handleChange} className="input-style" />
            </div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Review Order
            </button>
             <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem 1rem; border: 1px solid #4B5563; background-color: #374151; color: #FFF; }`}</style>
        </form>
    );
};

// --- Notification Toast Component ---
interface NotificationToastProps {
  message: string;
  onDismiss: () => void;
}
const NotificationToast: React.FC<NotificationToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg animate-fade-in-up z-50">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{message}</p>
        <button onClick={onDismiss} className="ml-4 text-xl font-bold leading-none text-white opacity-70 hover:opacity-100">&times;</button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// --- Announcement Banner Component ---
const Countdown = ({ expiryDate }: { expiryDate: string }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });
  
  const timerComponents = Object.entries(timeLeft)
    .map(([interval, value]) => (value > 0 ? `${value}${interval}` : null))
    .filter(Boolean);

  return (
    <div className="font-mono text-xs bg-black/30 px-2 py-1 rounded">
      {timerComponents.length ? <>Expires in: {timerComponents.join(' ')}</> : <span>Expired</span>}
    </div>
  );
};

const AnnouncementBanner = ({ announcement, onDismiss }: { announcement: Announcement, onDismiss: () => void }) => {
    const typeClasses = {
        info: 'bg-blue-900/50 border-blue-500 text-blue-200',
        warning: 'bg-yellow-900/50 border-yellow-500 text-yellow-200',
        promo: 'bg-indigo-900/50 border-indigo-500 text-indigo-200',
    };
    const icon = {
        info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        warning: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        promo: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 11h3a2 2 0 002-2V7a2 2 0 00-2-2H5m14-2v2m0 4v2m0 4v2M12 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zM12 11h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3a2 2 0 012-2z" /></svg>
    };

    return (
        <div className={`relative w-full p-4 rounded-lg border flex items-start gap-4 ${typeClasses[announcement.type]}`}>
            <div className="flex-shrink-0">{icon[announcement.type]}</div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white">{announcement.title}</h4>
                    {announcement.hasExpiration && announcement.expiryDate && (
                      <Countdown expiryDate={announcement.expiryDate} />
                    )}
                </div>
                <p className="text-sm mt-1">{announcement.message}</p>
            </div>
            <button onClick={onDismiss} className="absolute top-2 right-2 text-white/50 hover:text-white/100 text-xl font-bold">&times;</button>
        </div>
    );
}

// --- Main Customer View Component ---
interface CustomerViewProps {
    balance: number;
    onRedeem: (code: string) => { success: boolean; message: string; amount?: number };
    onPlaceOrder: (orderData: any) => void;
    sessionOrders: GiftCard[];
    allCards: GiftCard[];
    announcements: Announcement[];
    securitySettings: SecuritySettings;
    onThreatDetected: () => void;
    isAppLocked: boolean;
}

const CustomerView: React.FC<CustomerViewProps> = ({ balance, onRedeem, onPlaceOrder, sessionOrders, allCards, announcements, securitySettings, onThreatDetected, isAppLocked }) => {
    const [activeTab, setActiveTab] = useState<'purchase' | 'redeem'>('purchase');
    const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);
    const [notifiedCardIds, setNotifiedCardIds] = useState<Set<string>>(new Set());
    const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
    const prevAllCardsRef = useRef<GiftCard[] | undefined>(undefined);

    useEffect(() => {
        const prevAllCards = prevAllCardsRef.current;
        if (prevAllCards && sessionOrders.length > 0) {
            sessionOrders.forEach(order => {
                const previousCardState = prevAllCards.find(c => c.id === order.id);
                const currentCardState = allCards.find(c => c.id === order.id);

                if (
                    previousCardState && !previousCardState.isPaid &&
                    currentCardState && currentCardState.isPaid &&
                    !notifiedCardIds.has(currentCardState.id)
                ) {
                    const newNotification = {
                        id: `notif-${currentCardState.id}-${Date.now()}`,
                        message: `Your gift card for $${currentCardState.amount.toFixed(2)} is now active!`
                    };
                    setNotifications(prev => [...prev, newNotification]);
                    setNotifiedCardIds(prev => new Set(prev).add(currentCardState.id));
                }
            });
        }
        prevAllCardsRef.current = allCards;
    }, [allCards, sessionOrders, notifiedCardIds]);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleDismissAnnouncement = (id: string) => {
        setDismissedAnnouncements(prev => new Set(prev).add(id));
    };

    const visibleAnnouncements = announcements.filter(a => !dismissedAnnouncements.has(a.id));

    const baseTabClass = "w-full py-3 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500";
    const activeTabClass = "bg-indigo-600 text-white";
    const inactiveTabClass = "bg-gray-700 text-gray-300 hover:bg-gray-600";

    const titles = {
        purchase: {
            title: "Purchase a Gift Card",
            subtitle: "Send a gift card to a friend or team member.",
        },
        redeem: {
            title: "Redeem Your Gift Card",
            subtitle: "Enter your code below to add funds to your account.",
        }
    };

    return (
        <>
            {notifications.map(notif => (
                <NotificationToast 
                    key={notif.id} 
                    message={notif.message} 
                    onDismiss={() => dismissNotification(notif.id)} 
                />
            ))}
            <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8">
                    {visibleAnnouncements.length > 0 && (
                        <div className="space-y-4">
                            {visibleAnnouncements.map(anno => (
                                <AnnouncementBanner 
                                    key={anno.id} 
                                    announcement={anno}
                                    onDismiss={() => handleDismissAnnouncement(anno.id)}
                                />
                            ))}
                        </div>
                    )}

                    {isAppLocked ? (
                        <LockedView />
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="flex bg-gray-900/50 p-1 rounded-lg mb-6">
                                    <button onClick={() => setActiveTab('purchase')} className={`${baseTabClass} ${activeTab === 'purchase' ? activeTabClass : inactiveTabClass}`}>Purchase a Card</button>
                                    <button onClick={() => setActiveTab('redeem')} className={`${baseTabClass} ${activeTab === 'redeem' ? activeTabClass : inactiveTabClass}`}>Redeem a Card</button>
                                </div>
                                <h2 className="text-center text-3xl font-extrabold text-white">
                                    {titles[activeTab].title}
                                </h2>
                                <p className="text-center text-sm text-gray-400">
                                    {titles[activeTab].subtitle}
                                </p>
                            </div>
                            
                            {activeTab === 'purchase' ? (
                                <OrderCardView onPlaceOrder={onPlaceOrder} />
                            ) : (
                                <RedeemCardView 
                                    balance={balance} 
                                    onRedeem={onRedeem} 
                                    onThreatDetected={onThreatDetected} 
                                    securitySettings={securitySettings}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomerView;