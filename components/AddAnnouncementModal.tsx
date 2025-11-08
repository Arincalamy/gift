
import React, { useState, useCallback } from 'react';

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnnouncement: (announcementData: { title: string; message: string; type: 'info' | 'warning' | 'promo'; hasExpiration: boolean; expiryDate: string | null; }) => void;
}

const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ isOpen, onClose, onAddAnnouncement }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'promo'>('info');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && message.trim()) {
      onAddAnnouncement({
        title: title.trim(),
        message: message.trim(),
        type,
        hasExpiration,
        expiryDate: hasExpiration ? expiryDate : null,
      });
      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setHasExpiration(false);
      setExpiryDate('');
      onClose();
    }
  }, [title, message, type, hasExpiration, expiryDate, onAddAnnouncement, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Announcement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="anno-title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              id="anno-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., System Maintenance"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="anno-message" className="block text-sm font-medium text-gray-300">Message</label>
            <textarea
              id="anno-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="e.g., We will be undergoing scheduled maintenance..."
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="anno-type" className="block text-sm font-medium text-gray-300">Type</label>
            <select
              id="anno-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'info' | 'warning' | 'promo')}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="promo">Promotion</option>
            </select>
          </div>
          <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
             <span className="text-gray-300">Enable Expiration Date</span>
            <label htmlFor="anno-expiration-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  id="anno-expiration-toggle"
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
              <label htmlFor="anno-expiryDate" className="block text-sm font-medium text-gray-300">Expiry Date</label>
              <input
                type="datetime-local"
                id="anno-expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
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
              Create Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncementModal;
