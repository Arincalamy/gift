import React, { useState } from 'react';
import GiftCardItem from './GiftCardItem';
import PromotionItem from './PromotionItem';
import AnnouncementItem from './AnnouncementItem';
import SecurityView from './SecurityView';
import { GiftCard, Promotion, Announcement, SecuritySettings, Threat } from '../types';

interface AdminViewProps {
    cards: GiftCard[];
    onTogglePaid: (id: string) => void;
    onDeleteCard: (id: string) => void;
    onOpenCardModal: () => void;
    
    promotions: Promotion[];
    onTogglePromotionActive: (id: string) => void;
    onDeletePromotion: (id: string) => void;
    onOpenPromotionModal: () => void;

    announcements: Announcement[];
    onToggleAnnouncementActive: (id: string) => void;
    onDeleteAnnouncement: (id: string) => void;
    onOpenAnnouncementModal: () => void;

    securitySettings: SecuritySettings;
    onUpdateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
    threatLog: Threat[];
    onClearThreats: () => void;
    onResetBalance: () => void;
    onUnlockApp: () => void;
    isAppLocked: boolean;

    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const AdminView: React.FC<AdminViewProps> = (props) => {
    const {
        cards, onTogglePaid, onDeleteCard, onOpenCardModal,
        promotions, onTogglePromotionActive, onDeletePromotion, onOpenPromotionModal,
        announcements, onToggleAnnouncementActive, onDeleteAnnouncement, onOpenAnnouncementModal,
        securitySettings, onUpdateSecuritySettings, threatLog, onClearThreats, onResetBalance, onUnlockApp, isAppLocked,
        searchTerm, onSearchTermChange
    } = props;
    
    const [activeTab, setActiveTab] = useState<'cards' | 'promotions' | 'announcements' | 'security'>('cards');
    
    const baseTabClass = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors";
    const activeTabClass = "bg-indigo-600 text-white";
    const inactiveTabClass = "text-gray-300 hover:bg-gray-700";

    const mainContent = () => {
        switch (activeTab) {
            case 'cards':
                return cards.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {cards.map(card => (
                            <GiftCardItem
                                key={card.id}
                                card={card}
                                onTogglePaid={onTogglePaid}
                                onDelete={onDeleteCard}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg">
                        <h3 className="text-xl text-gray-400">No Gift Cards Found</h3>
                        <p className="text-gray-500 mt-2">
                            {searchTerm ? `No cards match your search for "${searchTerm}".` : "Click 'New Card' to get started."}
                        </p>
                    </div>
                );
            case 'promotions':
                return promotions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {promotions.map(promo => (
                           <PromotionItem 
                                key={promo.id}
                                promotion={promo}
                                onToggleActive={onTogglePromotionActive}
                                onDelete={onDeletePromotion}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg">
                        <h3 className="text-xl text-gray-400">No Promotions Found</h3>
                        <p className="text-gray-500 mt-2">
                             {searchTerm ? `No promotions match your search for "${searchTerm}".` : "Click 'New Promotion' to get started."}
                        </p>
                    </div>
                );
            case 'announcements':
                return announcements.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {announcements.map(anno => (
                           <AnnouncementItem 
                                key={anno.id}
                                announcement={anno}
                                onToggleActive={onToggleAnnouncementActive}
                                onDelete={onDeleteAnnouncement}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg">
                        <h3 className="text-xl text-gray-400">No Announcements Found</h3>
                        <p className="text-gray-500 mt-2">
                             {searchTerm ? `No announcements match your search for "${searchTerm}".` : "Click 'New Announcement' to get started."}
                        </p>
                    </div>
                );
            case 'security':
                return <SecurityView 
                            settings={securitySettings}
                            onSettingsChange={onUpdateSecuritySettings}
                            threats={threatLog}
                            onClearThreats={onClearThreats}
                            onResetBalance={onResetBalance}
                            onUnlockApp={onUnlockApp}
                            isAppLocked={isAppLocked}
                        />;
            default:
                return null;
        }
    };

    const getPlaceholderText = () => {
        switch (activeTab) {
            case 'cards': return "Search cards...";
            case 'promotions': return "Search promotions...";
            case 'announcements': return "Search announcements...";
            default: return "";
        }
    };

    const getNewButtonAction = () => {
        switch (activeTab) {
            case 'cards': return onOpenCardModal;
            case 'promotions': return onOpenPromotionModal;
            case 'announcements': return onOpenAnnouncementModal;
            default: return () => {};
        }
    };
    
    const getNewButtonText = () => {
        switch (activeTab) {
            case 'cards': return "New Card";
            case 'promotions': return "New Promotion";
            case 'announcements': return "New Announcement";
            default: return "";
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center bg-gray-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('cards')}
                        className={`${baseTabClass} ${activeTab === 'cards' ? activeTabClass : inactiveTabClass}`}
                    >
                        Gift Cards ({cards.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('promotions')}
                        className={`${baseTabClass} ${activeTab === 'promotions' ? activeTabClass : inactiveTabClass}`}
                    >
                        Promotions ({promotions.length})
                    </button>
                     <button 
                        onClick={() => setActiveTab('announcements')}
                        className={`${baseTabClass} ${activeTab === 'announcements' ? activeTabClass : inactiveTabClass}`}
                    >
                        Announcements ({announcements.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`${baseTabClass} ${activeTab === 'security' ? activeTabClass : inactiveTabClass}`}
                    >
                        Security
                    </button>
                </div>
                {activeTab !== 'security' && (
                    <div className="w-full sm:w-auto flex gap-2">
                        <input
                            type="text"
                            placeholder={getPlaceholderText()}
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Search items"
                        />
                        <button
                            onClick={getNewButtonAction()}
                            className="flex-shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {getNewButtonText()}
                        </button>
                    </div>
                )}
            </div>

            {mainContent()}
        </>
    );
};

export default AdminView;