import React from 'react';

interface HeaderProps {
  currentView: 'admin' | 'user';
  onViewChange: (view: 'admin' | 'user') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const baseButtonClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500";
  const activeButtonClass = "bg-indigo-600 text-white";
  const inactiveButtonClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          <span className="text-indigo-400">CEO</span> Gift Card Panel
        </h1>
        <div className="flex items-center space-x-2 bg-gray-700/50 p-1 rounded-lg">
           <button 
             onClick={() => onViewChange('admin')}
             className={`${baseButtonClass} ${currentView === 'admin' ? activeButtonClass : inactiveButtonClass}`}
             aria-pressed={currentView === 'admin'}
            >
             Admin
           </button>
           <button 
             onClick={() => onViewChange('user')}
             className={`${baseButtonClass} ${currentView === 'user' ? activeButtonClass : inactiveButtonClass}`}
             aria-pressed={currentView === 'user'}
            >
             Website
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;