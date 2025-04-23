import { Location, FormattedAddress } from "./types";

// Default location (New York City)
export const DEFAULT_LOCATION: Location = {
  lat: 40.7128,
  lng: -74.0060
};

// Default zoom level for maps
export const DEFAULT_ZOOM = 13;

// Mock function to get user's current location 
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fall back to default location
          resolve(DEFAULT_LOCATION);
        },
        { timeout: 10000 }
      );
    }
  });
};

// Calculate distance between two points in km using Haversine formula
export const calculateDistance = (point1: Location, point2: Location): number => {
  console.log("calculateDistance called with:", point1, point2);
  
  // Check if locations are valid
  if (!point1 || !point2 || typeof point1.lat !== 'number' || typeof point1.lng !== 'number' || 
      typeof point2.lat !== 'number' || typeof point2.lng !== 'number') {
    console.error("Invalid location data for distance calculation", { point1, point2 });
    return 0;
  }
  
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLng = deg2rad(point2.lng - point1.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const distance = R * c; // Distance in km
  
  console.log("Calculated distance:", distance);
  return distance;
};

// Helper function to convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Estimate travel time based on distance
export const estimateTravelTime = (distanceInKm: number): number => {
  console.log("estimateTravelTime called with distance:", distanceInKm);
  
  // Ensure distance is valid
  if (typeof distanceInKm !== 'number' || distanceInKm <= 0) {
    console.error("Invalid distance for time estimation:", distanceInKm);
    return 0;
  }
  
  // Assume average speed of 30 km/h in the city
  const averageSpeedKmH = 30;
  // Calculate time in minutes
  const timeInMinutes = Math.round((distanceInKm / averageSpeedKmH) * 60);
  
  console.log("Estimated time:", timeInMinutes, "minutes");
  return timeInMinutes;
};

// Function to get a formatted address from coordinates (mock implementation)
export const getAddressFromCoordinates = async (location: Location): Promise<string> => {
  // In a real app, this would call a geocoding API
  // For this example, we'll return a mock address
  return "123 Main St, New York, NY";
};

// Function to get coordinates from an address (mock implementation)
export const getCoordinatesFromAddress = async (address: string): Promise<FormattedAddress> => {
  // In a real app, this would call a geocoding API
  // For this example, we'll generate a random location near NYC
  console.log("getCoordinatesFromAddress called with:", address);
  
  // Ensure we return a semi-realistic result for the address
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;
  
  const result = {
    address,
    location: {
      lat: DEFAULT_LOCATION.lat + latOffset,
      lng: DEFAULT_LOCATION.lng + lngOffset
    }
  };
  
  console.log("Returning coordinates:", result);
  return result;
};
