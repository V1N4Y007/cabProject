// Types for the client side

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Driver {
  id: number;
  fullName: string;
  phone: string;
  licensePlate: string;
  carModel: string;
  rating: number;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
}

export interface CabType {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  pricePerKm: number;
  seatingCapacity: number;
}

export interface Trip {
  id: number;
  userId: number;
  driverId: number | null;
  cabTypeId: number;
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  pickupAddress: string;
  destinationAddress: string;
  distance: number;
  price: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface FormattedAddress {
  address: string;
  location: Location;
}

export interface BookingFormData {
  pickupAddress: string;
  destinationAddress: string;
  pickupLocation: Location;
  destinationLocation: Location;
  distance: number;
  estimatedTime: number;
  selectedCabType: CabType | null;
}
