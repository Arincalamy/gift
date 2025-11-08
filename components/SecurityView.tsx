import React from 'react';
import { SecuritySettings, Threat } from '../types';

interface SecurityViewProps {
  settings: SecuritySettings;
  onSettingsChange: (settings: Partial<SecuritySettings>) => void;
  threats: Threat[];
  onClearThreats: () => void;
  onResetBalance: () => void;
  onUnlockApp: () => void;
  isAppLocked: boolean;
}

const Toggle = ({ label, enabled, onChange, description }: { label: string; enabled: boolean; onChange: (enabled: boolean) => void; description: string; }) => (
  <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg">
    <div>
        <h4 className="text-md font-medium text-gray-100">{label}</h4>
        <p className="text-sm text-gray-400">{description}</p>
    </div>
    <label htmlFor={`toggle-${label}`} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          id={`toggle-${label}`}
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6 bg-indigo-400' : ''}`}></div>
      </div>
    </label>
  </div>
);

const SecurityView: React.FC<SecurityViewProps> = ({ settings, onSettingsChange, threats, onClearThreats, onResetBalance, onUnlockApp, isAppLocked }) => {
  const formatLocation = (location: Threat['location']) => {
    if (!location) return 'N/A';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
  
  return (
    <div className="space-y-8">
      {/* System Status and Actions */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">System Status & Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
                 <p className="text-gray-300">Application Status: 
                    <span className={`font-bold ml-2 px-3 py-1 rounded-full text-sm ${isAppLocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        {isAppLocked ? 'LOCKED' : 'OPERATIONAL'}
                    </span>
                 </p>
                 <p className="text-sm text-gray-500 mt-1">{isAppLocked ? 'Redemption is disabled for all users.' : 'System is running normally.'}</p>
            </div>
             <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={onUnlockApp}
                    disabled={!isAppLocked}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none"
                >
                    Unlock App
                </button>
                <button
                    onClick={onResetBalance}
                    className="w-full flex justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-300 bg-red-900/50 hover:bg-red-800/50 focus:outline-none"
                >
                    Reset User Balance
                </button>
            </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">Security Protocol Settings</h3>
        <div className="space-y-4">
          <Toggle
            label="Anti-Theft System"
            enabled={settings.systemEnabled}
            onChange={(val) => onSettingsChange({ systemEnabled: val })}
            description="Master switch to enable or disable all automated security responses."
          />
          <Toggle
            label="Auto-Lock Application"
            enabled={settings.autoLock}
            onChange={(val) => onSettingsChange({ autoLock: val })}
            description="Automatically lock the redemption form after a threat is detected."
          />
          <Toggle
            label="Play Alarm Sound"
            enabled={settings.playSound}
            onChange={(val) => onSettingsChange({ playSound: val })}
            description="Play a brief alarm sound on the user's device upon threat detection."
          />
          <Toggle
            label="Request Location"
            enabled={settings.requestLocation}
            onChange={(val) => onSettingsChange({ requestLocation: val })}
            description="Attempt to capture the user's geolocation when a threat is logged."
          />
        </div>
      </div>

      {/* Threat Log */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
         <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
            <h3 className="text-xl font-bold text-white">Threat Log</h3>
            <button
                onClick={onClearThreats}
                disabled={threats.length === 0}
                className="text-sm text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
            >
                Clear Log
            </button>
        </div>
        <div className="max-h-96 overflow-y-auto pr-2">
            {threats.length > 0 ? (
                <ul className="space-y-3">
                    {threats.map(threat => (
                        <li key={threat.id} className="bg-gray-900/70 p-4 rounded-md">
                            <div className="flex justify-between items-center">
                                <p className="font-mono text-sm text-red-400">{threat.reason}</p>
                                <p className="text-xs text-gray-500">{new Date(threat.timestamp).toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Location: <span className="font-mono">{formatLocation(threat.location)}</span></p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-8">No suspicious activities logged.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default SecurityView;