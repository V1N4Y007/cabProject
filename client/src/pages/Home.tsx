import React, { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { MapView } from "@/components/ui/map";
import { BookingPanel } from "@/components/booking/BookingPanel";
import { RideConfirmation } from "@/components/booking/RideConfirmation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DEFAULT_LOCATION } from "@/lib/maps";
import { getCurrentLocation } from "@/lib/maps";
import { useIsMobile } from "@/hooks/use-mobile";
import { Location, Driver, CabType, Trip } from "@/lib/types";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const isMobile = useIsMobile();
  const authenticated = isAuthenticated();
  const [userLocation, setUserLocation] = useState<Location>(DEFAULT_LOCATION);
  const [destination, setDestination] = useState<Location | undefined>(undefined);
  const [activeRide, setActiveRide] = useState<Trip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch cab types
  const { data: cabTypes = [] } = useQuery<CabType[]>({
    queryKey: ['/api/cab-types']
  });

  // Fetch nearby drivers 
  const { data: nearbyDrivers = [] } = useQuery<Driver[]>({
    queryKey: ['/api/drivers/nearby', userLocation.lat, userLocation.lng],
    enabled: userLocation.lat !== 0 && !!authenticated
  });

  // Get current location on component mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };
    getLocation();
  }, []);

  // Get driver information for active ride
  const getDriverForRide = (): Driver | null => {
    if (!activeRide || !activeRide.driverId) return null;
    return nearbyDrivers.find(driver => driver.id === activeRide.driverId) || null;
  };

  // Get cab type information for active ride
  const getCabTypeForRide = (): CabType | null => {
    if (!activeRide) return null;
    return cabTypes.find(type => type.id === activeRide.cabTypeId) || null;
  };

  // Handle booking completion
  const handleBookRide = (trip: Trip) => {
    setActiveRide(trip);
    if (trip.destinationLat && trip.destinationLng) {
      setDestination({
        lat: trip.destinationLat,
        lng: trip.destinationLng
      });
    }
  };

  // Handle ride cancellation
  const handleCancelRide = () => {
    setActiveRide(null);
    setDestination(undefined);
  };

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map View */}
        <div className="flex-1 relative">
          <MapView 
            userLocation={userLocation}
            destination={destination}
            drivers={nearbyDrivers}
            onUserLocationChange={setUserLocation}
          />
          
          {/* Top search bar (desktop) */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-20 hidden md:block">
            <div className="bg-white rounded-full shadow-lg py-2 px-4 flex items-center">
              <Search className="text-dark mr-3 h-5 w-5" />
              <Input 
                type="text" 
                placeholder="Where to?" 
                className="w-full border-none shadow-none focus:outline-none text-dark"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Booking or Confirmation Panel */}
        {activeRide ? (
          <RideConfirmation 
            trip={activeRide}
            driver={getDriverForRide()}
            cabType={getCabTypeForRide()}
            onCancel={handleCancelRide}
          />
        ) : (
          <BookingPanel 
            userLocation={userLocation}
            cabTypes={cabTypes}
            onBook={handleBookRide}
            isMobile={isMobile}
          />
        )}
      </main>
      
      <MobileNav />
    </div>
  );
}
