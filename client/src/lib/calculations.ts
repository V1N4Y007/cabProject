import { CabType } from "./types";

// Calculate the price based on distance and cab type
export const calculatePrice = (distanceInKm: number, cabType: CabType): number => {
  const basePrice = cabType.basePrice;
  const pricePerKm = cabType.pricePerKm;
  
  // Calculate raw price
  let price = basePrice + (distanceInKm * pricePerKm);
  
  // Round to 2 decimal places
  price = Math.round(price * 100) / 100;
  
  return price;
};

// Format price to display as currency
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// Format distance for display
export const formatDistance = (distanceInKm: number): string => {
  // If less than 1 km, show in meters
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} meters`;
  }
  
  // Otherwise show in km with 1 decimal place
  return `${distanceInKm.toFixed(1)} km`;
};

// Format time for display
export const formatTime = (timeInMinutes: number): string => {
  if (timeInMinutes < 1) {
    return "Less than a minute";
  }
  
  if (timeInMinutes < 60) {
    return `${Math.round(timeInMinutes)} min`;
  }
  
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = Math.round(timeInMinutes % 60);
  
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
};

// Format date string to readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get a cab arrival time estimate based on distance
export const getArrivalTimeEstimate = (distanceInKm: number): number => {
  // Simple calculation: assume 30 km/h average speed
  // Convert to minutes
  return Math.round(distanceInKm / 30 * 60);
};

// Format arrival time for display
export const formatArrivalTime = (minutesAway: number): string => {
  if (minutesAway < 1) {
    return "Less than a minute away";
  }
  
  if (minutesAway === 1) {
    return "1 minute away";
  }
  
  return `${minutesAway} minutes away`;
};
