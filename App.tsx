import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import AdminView from './components/AdminView';
import CustomerView from './components/CustomerView';
import AddCardModal from './components/AddCardModal';
import AddPromotionModal from './components/AddPromotionModal';
import AddAnnouncementModal from './components/AddAnnouncementModal';
import { GiftCard, Promotion, Announcement, SecuritySettings, Threat } from './types';

const generateRandomCode = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const App: React.FC = () => {
  // State for Gift Cards
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  
  // State for Promotions
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  
  // State for Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // Common State
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'admin' | 'user'>('admin');
  
  // Customer-facing State
  const [userBalance, setUserBalance] = useState(0);
  const [sessionOrders, setSessionOrders] = useState<GiftCard[]>([]);
  
  // Security State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    systemEnabled: true,
    autoLock: true,
    playSound: true,
    requestLocation: true,
    failedAttemptsThreshold: 3,
  });
  const [threatLog, setThreatLog] = useState<Threat[]>([]);
  const [isAppLocked, setIsAppLocked] = useState(false);


  // --- Gift Card Handlers ---
  const handleAddCard = useCallback((cardData: { name: string; amount: number; hasExpiration: boolean; expiryDate: string | null; usageLimit: number; }) => {
    const newCard: GiftCard = {
      id: `gc-${new Date().toISOString()}`,
      ...cardData,
      code: generateRandomCode(),
      isPaid: false,
      timesUsed: 0,
      createdAt: new Date(),
    };
    setCards(prevCards => [newCard, ...prevCards]);
  }, []);

  const handleTogglePaid = useCallback((id: string) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, isPaid: !card.isPaid } : card
      )
    );
  }, []);

  const handleDeleteCard = useCallback((id: string) => {
    const cardToDelete = cards.find(card => card.id === id);
    if (!cardToDelete) return;

    let confirmMessage = 'Are you sure you want to delete this gift card?';
    if (cardToDelete.timesUsed > 0 && cardToDelete.timesUsed < cardToDelete.usageLimit) {
        confirmMessage = `This gift card has been used ${cardToDelete.timesUsed} time(s) but is not fully redeemed. Deleting it will remove it from your records. Are you sure?`;
    } else if (cardToDelete.isPaid && cardToDelete.timesUsed === 0) {
        confirmMessage = 'This gift card is marked as PAID and is unused. Are you sure you want to delete it? This action cannot be undone.';
    } else if (cardToDelete.timesUsed >= cardToDelete.usageLimit) {
        confirmMessage = 'This gift card has been FULLY REDEEMED. Deleting it will remove it from your records. Are you sure?';
    }
    
    if (window.confirm(confirmMessage)) {
      setCards(prevCards => prevCards.filter(card => card.id !== id));
    }
  }, [cards]);

  // --- Promotion Handlers ---
  const handleAddPromotion = useCallback((promoData: { name: string; amount: number; hasExpiration: boolean; expiryDate: string | null; }) => {
    const newPromotion: Promotion = {
      id: `promo-${new Date().toISOString()}`,
      ...promoData,
      code: generateRandomCode(8),
      isActive: false, // Promotions start as inactive
      createdAt: new Date(),
    };
    setPromotions(prev => [newPromotion, ...prev]);
  }, []);

  const handleTogglePromotionActive = useCallback((id: string) => {
    setPromotions(prev =>
      prev.map(promo =>
        promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
      )
    );
  }, []);

  const handleDeletePromotion = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      setPromotions(prev => prev.filter(promo => promo.id !== id));
    }
  }, []);
  
  // --- Announcement Handlers ---
  const handleAddAnnouncement = useCallback((announcementData: { title: string; message: string; type: 'info' | 'warning' | 'promo'; hasExpiration: boolean; expiryDate: string | null; }) => {
    const newAnnouncement: Announcement = {
      id: `anno-${new Date().toISOString()}`,
      ...announcementData,
      isActive: false, // Announcements start as inactive
      createdAt: new Date(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  }, []);

  const handleToggleAnnouncementActive = useCallback((id: string) => {
    setAnnouncements(prev =>
      prev.map(anno =>
        anno.id === id ? { ...anno, isActive: !anno.isActive } : anno
      )
    );
  }, []);

  const handleDeleteAnnouncement = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      setAnnouncements(prev => prev.filter(anno => anno.id !== id));
    }
  }, []);


  // --- Customer Facing Handlers ---
  const handlePlaceOrder = useCallback((orderData: {firstName: string; lastName: string; email: string; amount: number; deliveryDate: string}) => {
    const newCard: GiftCard = {
        id: `gc-${new Date().toISOString()}`,
        name: `For ${orderData.firstName} ${orderData.lastName}`,
        amount: orderData.amount,
        code: generateRandomCode(),
        isPaid: false, // Orders start as unpaid until CEO confirms payment
        usageLimit: 1,
        timesUsed: 0,
        hasExpiration: true,
        expiryDate: orderData.deliveryDate,
        createdAt: new Date(),
    };
    setCards(prevCards => [newCard, ...prevCards]);
    setSessionOrders(prevOrders => [newCard, ...prevOrders]);
  }, []);

  const handleRedeemCode = useCallback((codeToRedeem: string): { success: boolean; message: string; amount?: number } => {
    if (isAppLocked) return { success: false, message: 'Application is temporarily locked.' };

    const code = codeToRedeem.toLowerCase().trim();

    // 1. Check for Gift Card
    const cardIndex = cards.findIndex(c => c.code.toLowerCase() === code);
    if (cardIndex !== -1) {
      const card = cards[cardIndex];
      if (!card.isPaid) return { success: false, message: 'This gift card has not been activated yet.' };
      if (card.timesUsed >= card.usageLimit) return { success: false, message: 'This gift card has reached its usage limit.' };
      const isExpired = card.hasExpiration && card.expiryDate ? new Date(card.expiryDate) < new Date() : false;
      if (isExpired) return { success: false, message: 'This gift card has expired.' };

      setCards(prev => {
        const newCards = [...prev];
        newCards[cardIndex] = { ...newCards[cardIndex], timesUsed: newCards[cardIndex].timesUsed + 1 };
        return newCards;
      });
      setUserBalance(prev => prev + card.amount);
      return { success: true, message: `$${card.amount.toFixed(2)} has been added to your balance.`, amount: card.amount };
    }

    // 2. Check for Promotion
    const promotion = promotions.find(p => p.code.toLowerCase() === code);
    if (promotion) {
      if (!promotion.isActive) return { success: false, message: 'This promotion is not currently active.' };
      const isExpired = promotion.hasExpiration && promotion.expiryDate ? new Date(promotion.expiryDate) < new Date() : false;
      if (isExpired) return { success: false, message: 'This promotion has expired.' };
      
      setUserBalance(prev => prev + promotion.amount);
      return { success: true, message: `Promotion redeemed! $${promotion.amount.toFixed(2)} added to your balance.`, amount: promotion.amount };
    }

    // 3. Not found
    return { success: false, message: 'Invalid code. Not found.' };
  }, [cards, promotions, isAppLocked]);

  // --- Security Handlers ---
  const handleThreatDetected = useCallback(() => {
    if (!securitySettings.systemEnabled) return;

    const newThreat: Threat = {
      id: `threat-${Date.now()}`,
      timestamp: new Date(),
      reason: `${securitySettings.failedAttemptsThreshold} failed redemption attempts.`,
    };

    if (securitySettings.requestLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          newThreat.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setThreatLog(prev => [newThreat, ...prev]);
        },
        () => {
          // Location denied or unavailable
          newThreat.location = null;
          setThreatLog(prev => [newThreat, ...prev]);
        }
      );
    } else {
        setThreatLog(prev => [newThreat, ...prev]);
    }

    if (securitySettings.autoLock) {
      setIsAppLocked(true);
    }
  }, [securitySettings]);
  
  const handleUpdateSecuritySettings = useCallback((newSettings: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({...prev, ...newSettings}));
  }, []);

  const handleClearThreats = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the entire threat log? This cannot be undone.")) {
      setThreatLog([]);
    }
  }, []);

  const handleResetBalance = useCallback(() => {
    if(window.confirm("WARNING: This will reset the customer's total balance to $0.00. Are you sure?")) {
      setUserBalance(0);
    }
  }, []);


  const filteredCards = useMemo(() => {
    return cards.filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cards, searchTerm]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter(promo =>
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);
  
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(anno =>
      anno.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anno.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [announcements, searchTerm]);

  const activeAnnouncements = useMemo(() => {
    return announcements.filter(anno => {
      const isExpired = anno.hasExpiration && anno.expiryDate ? new Date(anno.expiryDate) < new Date() : false;
      return anno.isActive && !isExpired;
    });
  }, [announcements]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header currentView={view} onViewChange={setView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'admin' ? (
          <AdminView
            cards={filteredCards}
            onTogglePaid={handleTogglePaid}
            onDeleteCard={handleDeleteCard}
            onOpenCardModal={() => setIsCardModalOpen(true)}
            promotions={filteredPromotions}
            onTogglePromotionActive={handleTogglePromotionActive}
            onDeletePromotion={handleDeletePromotion}
            onOpenPromotionModal={() => setIsPromotionModalOpen(true)}
            announcements={filteredAnnouncements}
            onToggleAnnouncementActive={handleToggleAnnouncementActive}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onOpenAnnouncementModal={() => setIsAnnouncementModalOpen(true)}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            securitySettings={securitySettings}
            onUpdateSecuritySettings={handleUpdateSecuritySettings}
            threatLog={threatLog}
            onClearThreats={handleClearThreats}
            onResetBalance={handleResetBalance}
            onUnlockApp={() => setIsAppLocked(false)}
            isAppLocked={isAppLocked}
          />
        ) : (
          <CustomerView 
            balance={userBalance}
            onRedeem={handleRedeemCode}
            onPlaceOrder={handlePlaceOrder}
            sessionOrders={sessionOrders}
            allCards={cards}
            announcements={activeAnnouncements}
            securitySettings={securitySettings}
            onThreatDetected={handleThreatDetected}
            isAppLocked={isAppLocked}
          />
        )}
      </main>
      <AddCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onAddCard={handleAddCard}
      />
      <AddPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onAddPromotion={handleAddPromotion}
      />
      <AddAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onAddAnnouncement={handleAddAnnouncement}
      />
    </div>
  );
};

export default App;