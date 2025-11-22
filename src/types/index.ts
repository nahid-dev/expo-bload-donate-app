export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface User {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donor {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  bloodGroup: BloodGroup;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
  lastDonationDate?: Date;
  nextAvailableDate?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BloodRequest {
  id: string;
  userId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  state: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactNumber: string;
  additionalInfo?: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  fulfilledBy?: string; // donorId
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request' | 'donation' | 'system';
  read: boolean;
  createdAt: Date;
  data?: any;
}

