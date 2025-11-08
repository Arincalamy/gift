import React, { useState, useCallback } from 'react';

interface AddPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPromotion: (promotionData: { name: string; amount: number; hasExpiration: boolean; expiryDate: string | null; }) => void;
}

const AddPromotionModal: React.FC<AddPromotionModalProps> = ({ isOpen, onClose, onAddPromotion }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount) {
      onAddPromotion({
        name: name.trim(),
        amount: Number(amount),
        hasExpiration,
        expiryDate: hasExpiration ? expiryDate : null,
      });
      // Reset form
      setName('');
      setAmount('');
      setHasExpiration(false);
      setExpiryDate('');
      onClose();
    }
  }, [name, amount, hasExpiration, expiryDate, onAddPromotion, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Promotion</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="promo-name" className="block text-sm font-medium text-gray-300">Promotion Name</label>
            <input
              type="text"
              id="promo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., YouTube Launch Special"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="promo-amount" className="block text-sm font-medium text-gray-300">Amount ($)</label>
            <input
              type="number"
              id="promo-amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g., 10.00"
              min="0.01"
              step="0.01"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
             <span className="text-gray-300">Enable Expiration Date</span>
            <label htmlFor="promo-expiration-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  id="promo-expiration-toggle"
                  type="checkbox"
                  className="sr-only"
                  checked={hasExpiration}
                  onChange={() => setHasExpiration(!hasExpiration)}
                />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${hasExpiration ? 'transform translate-x-6 bg-indigo-400' : ''}`}></div>
              </div>
            </label>
          </div>
          {hasExpiration && (
            <div>
              <label htmlFor="promo-expiryDate" className="block text-sm font-medium text-gray-300">Expiry Date</label>
              <input
                type="date"
                id="promo-expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required={hasExpiration}
              />
            </div>
          )}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
            >
              Generate Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromotionModal;
