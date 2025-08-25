
// Note: The Firebase Timestamp type is now a standard Date object for simplicity
// in the client-side implementation, as Firestore handles the conversion automatically.

export type UserRole = 'Citizen' | 'Recycler' | 'Admin' | 'Contractor';

export interface UserProfile {
  uid: string;
  role?: UserRole; // Role is now optional, as it's set after signup
  username: string; // Add username
  name: string;
  email: string | null; // email can be null from firebase user
  photoURL: string;
  credits?: number; // Only for citizens
  approved?: boolean; // Only for recyclers
  phone?: string;
  badges?: string[];
}

export type PickupStatus = 'pending' | 'accepted' | 'completed' | 'rejected';

export interface PickupLocation {
  displayAddress: string;
  lat: number;
  lon: number;
}

export interface PickupRequest {
  id: string;
  citizenId: string;
  citizenName: string;
  recyclerId?: string;
  category: string;
  description: string;
  location: PickupLocation;
  status: PickupStatus;
  photoURL: string;
  createdAt: Date; // Changed from Timestamp for client-side ease of use
}
