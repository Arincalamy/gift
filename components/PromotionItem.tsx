import React from 'react';
import { Promotion } from '../types';

interface PromotionItemProps {
  promotion: Promotion;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

const PromotionItem: React.FC<PromotionItemProps> = ({ promotion, onToggleActive, onDelete }) => {
  const formattedDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = promotion.hasExpiration && promotion.expiryDate ? new Date(promotion.expiryDate) < new Date() : false;

  let statusText = 'Inactive';
  let statusClasses = 'bg-gray-500 text-gray-50';
  let cardBgClass = 'bg-gray-800 border-gray-600/50';

  if (isExpired) {
    statusText = 'Expired';
    statusClasses = 'bg-red-600 text-white';
    cardBgClass = 'bg-gray-800 border-red-500/50';
  } else if (promotion.isActive) {
    statusText = 'Active';
    statusClasses = 'bg-green-500 text-green-50';
    cardBgClass = 'bg-gray-800 border-green-500/50';
  }

  const expiryText = promotion.hasExpiration && promotion.expiryDate
    ? `Expires: ${formattedDate(promotion.expiryDate)}`
    : 'No Expiration';

  return (
    <div className={`relative flex flex-col rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 border ${cardBgClass} overflow-hidden`}>
      { isExpired && <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">EXPIRED</div> }
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-white">{promotion.name}</h3>
              <p className="text-4xl font-light text-indigo-400 my-2">${promotion.amount.toFixed(2)}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
              {statusText}
            </span>
          </div>
          <p className="font-mono text-sm tracking-widest bg-gray-700 px-3 py-1 rounded text-indigo-300 inline-block my-2">{promotion.code}</p>
          <div className="text-gray-400 text-sm">{expiryText}</div>
          <p className="text-gray-500 text-xs mt-3">Created: {formattedDate(promotion.createdAt)}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor={`active-toggle-${promotion.id}`} className={`flex items-center ${isExpired ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className="relative">
                <input
                  id={`active-toggle-${promotion.id}`}
                  type="checkbox"
                  className="sr-only"
                  checked={promotion.isActive}
                  onChange={() => onToggleActive(promotion.id)}
                  disabled={isExpired}
                />
                <div className={`block w-14 h-8 rounded-full ${promotion.isActive ? 'bg-indigo-600' : 'bg-gray-600'} ${isExpired ? 'opacity-50' : ''}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${promotion.isActive ? 'transform translate-x-6' : ''} ${isExpired ? 'bg-gray-400' : ''}`}></div>
              </div>
              <div className={`ml-3 font-medium ${isExpired ? 'text-gray-500' : 'text-gray-300'}`}>
                { promotion.isActive ? 'Active' : 'Inactive' }
              </div>
            </label>
          </div>
          <button
            onClick={() => onDelete(promotion.id)}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Delete Promotion"
            aria-label="Delete promotion"
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

export default PromotionItem;
