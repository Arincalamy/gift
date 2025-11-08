export interface GiftCard {
  id: string;
  name: string;
  amount: number;
  code: string;
  isPaid: boolean;
  usageLimit: number;
  timesUsed: number;
  hasExpiration: boolean;
  expiryDate: string | null;
  createdAt: Date;
}

export interface Promotion {
  id: string;
  name: string;
  amount: number;
  code: string;
  isActive: boolean;
  hasExpiration: boolean;
  expiryDate: string | null;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promo';
  isActive: boolean;
  hasExpiration: boolean;
  expiryDate: string | null;
  createdAt: Date;
}

export interface SecuritySettings {
  systemEnabled: boolean;
  autoLock: boolean;
  playSound: boolean;
  requestLocation: boolean;
  failedAttemptsThreshold: number;
}

export interface Threat {
  id: string;
  timestamp: Date;
  reason: string;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
}