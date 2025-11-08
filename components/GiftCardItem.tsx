import React from 'react';
import { GiftCard } from '../types';

interface GiftCardItemProps {
  card: GiftCard;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

const GiftCardItem: React.FC<GiftCardItemProps> = ({ card, onTogglePaid, onDelete }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(card.code)}`;
  
  const formattedDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = card.hasExpiration && card.expiryDate ? new Date(card.expiryDate) < new Date() : false;
  const isFullyRedeemed = card.timesUsed >= card.usageLimit;


  let statusText = 'Unpaid';
  let statusClasses = 'bg-yellow-500 text-yellow-50';
  let cardBgClass = 'bg-gray-800 border-yellow-500/50';

  if (isExpired) {
    statusText = 'Expired';
    statusClasses = 'bg-red-600 text-white';
    cardBgClass = 'bg-gray-800 border-red-500/50';
  } else if (isFullyRedeemed) {
    statusText = 'Fully Redeemed';
    statusClasses = 'bg-blue-500 text-blue-50';
    cardBgClass = 'bg-gray-800 border-blue-500/50';
  } else if (card.isPaid) {
    statusText = 'Active';
    statusClasses = 'bg-green-500 text-green-50';
    cardBgClass = 'bg-gray-800 border-green-500/50';
  }

  const expiryText = card.hasExpiration && card.expiryDate
    ? `Expires: ${formattedDate(card.expiryDate)}`
    : 'No Expiration';
    
  const usageText = `Used: ${card.timesUsed} / ${card.usageLimit}`;


  return (
    <div className={`relative flex flex-col md:flex-row rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 border ${cardBgClass} overflow-hidden`}>
       { isExpired && !isFullyRedeemed && <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">EXPIRED</div> }
      <div className="p-6 flex flex-col justify-center items-center bg-gray-900/50 md:w-1/3">
        <img className="rounded-lg shadow-md" src={qrCodeUrl} alt="QR Code" />
        <p className="mt-4 text-center font-mono text-sm tracking-widest bg-gray-700 px-3 py-1 rounded text-indigo-300">{card.code}</p>
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow md:w-2/3">
        <div>
          <h3 className="text-2xl font-bold text-white">{card.name}</h3>
          <p className="text-4xl font-light text-indigo-400 my-2">${card.amount.toFixed(2)}</p>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
              {statusText}
            </span>
            <span className="text-gray-400 text-sm">{expiryText}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{usageText}</p>
          <p className="text-gray-500 text-xs mt-3">Created: {formattedDate(card.createdAt)}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor={`paid-toggle-${card.id}`} className={`flex items-center ${isExpired || isFullyRedeemed ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className="relative">
                <input
                  id={`paid-toggle-${card.id}`}
                  type="checkbox"
                  className="sr-only"
                  checked={card.isPaid}
                  onChange={() => onTogglePaid(card.id)}
                  disabled={isExpired || isFullyRedeemed}
                />
                <div className={`block w-14 h-8 rounded-full ${card.isPaid ? 'bg-indigo-600' : 'bg-gray-600'} ${isExpired || isFullyRedeemed ? 'opacity-50' : ''}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${card.isPaid ? 'transform translate-x-6' : ''} ${isExpired || isFullyRedeemed ? 'bg-gray-400' : ''}`}></div>
              </div>
              <div className={`ml-3 font-medium ${isExpired || isFullyRedeemed ? 'text-gray-500' : 'text-gray-300'}`}>
                Mark as Paid
              </div>
            </label>
          </div>
          <button
            onClick={() => onDelete(card.id)}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Delete Gift Card"
            aria-label="Delete gift card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftCardItem;