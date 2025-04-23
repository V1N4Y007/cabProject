import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { 
  Location, 
  FormattedAddress, 
  CabType, 
  BookingFormData,
  Trip
} from "@/lib/types";
import { 
  getCoordinatesFromAddress, 
  calculateDistance,
  estimateTravelTime,
  getAddressFromCoordinates 
} from "@/lib/maps";
import { calculatePrice, formatPrice, formatDistance, formatTime } from "@/lib/calculations";
import { CreditCard, ChevronDown, ChevronUp, Car } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface BookingPanelProps {
  userLocation: Location;
  cabTypes: CabType[];
  onBook: (trip: Trip) => void;
  isMobile: boolean;
}

export function BookingPanel({ userLocation, cabTypes, onBook, isMobile }: BookingPanelProps) {
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    pickupAddress: "",
    destinationAddress: "",
    pickupLocation: userLocation,
    destinationLocation: { lat: 0, lng: 0 },
    distance: 0,
    estimatedTime: 0,
    selectedCabType: cabTypes.length > 0 ? cabTypes[0] : null
  });

  // Initialize pickup address from user location
  useEffect(() => {
    async function setInitialAddress() {
      try {
        console.log("Setting initial address from location:", userLocation);
        const address = await getAddressFromCoordinates(userLocation);
        console.log("Got address from coordinates:", address);
        
        setFormData(prev => ({
          ...prev,
          pickupAddress: address,
          pickupLocation: { ...userLocation } // Create a fresh copy
        }));
        
        console.log("Form data updated with initial address");
      } catch (error) {
        console.error("Failed to get address from coordinates:", error);
      }
    }
    
    if (userLocation && userLocation.lat && userLocation.lng) {
      setInitialAddress();
    } else {
      console.error("Invalid user location received:", userLocation);
    }
  }, [userLocation]);

  // Handle destination input change
  const handleDestinationChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log("Destination input changed:", value);
    
    // Update form data with new destination address
    setFormData(prev => ({
      ...prev,
      destinationAddress: value
    }));

    if (value.trim().length > 3) {
      try {
        console.log("Getting coordinates for:", value);
        // Get coordinates from the address
        const result = await getCoordinatesFromAddress(value);
        console.log("Coordinates result:", result);
        
        // Get the current form data for the pickup location (to avoid closure issue with stale state)
        // Instead of using formData directly, we'll create a new reference to ensure we're using the latest state
        const currentPickupLocation = { ...formData.pickupLocation };
        console.log("Current pickup location:", currentPickupLocation);
        
        if (!currentPickupLocation.lat || !currentPickupLocation.lng) {
          console.error("Invalid pickup location coordinates");
          return;
        }
        
        // Calculate distance and time
        const distance = calculateDistance(currentPickupLocation, result.location);
        console.log("Calculated distance:", distance);
        
        const time = estimateTravelTime(distance);
        console.log("Estimated time:", time);
        
        // Update form with calculated values
        setFormData(prev => ({
          ...prev,
          destinationLocation: result.location,
          distance,
          estimatedTime: time
        }));
      } catch (error) {
        console.error("Error getting coordinates:", error);
      }
    }
  };

  // Handle cab type selection
  const handleCabTypeSelection = (cabType: CabType) => {
    setFormData(prev => ({
      ...prev,
      selectedCabType: cabType
    }));
  };

  // Book ride mutation
  const bookRideMutation = useMutation({
    mutationFn: async () => {
      if (!formData.selectedCabType) {
        throw new Error("Please select a cab type");
      }
      
      if (!formData.destinationAddress || !formData.destinationLocation.lat) {
        throw new Error("Please enter a destination");
      }
      
      const price = calculatePrice(formData.distance, formData.selectedCabType);
      
      const tripData = {
        cabTypeId: formData.selectedCabType.id,
        pickupLat: formData.pickupLocation.lat,
        pickupLng: formData.pickupLocation.lng,
        destinationLat: formData.destinationLocation.lat,
        destinationLng: formData.destinationLocation.lng,
        pickupAddress: formData.pickupAddress,
        destinationAddress: formData.destinationAddress,
        distance: formData.distance,
        price
      };
      
      const response = await apiRequest("POST", "/api/trips", tripData);
      return await response.json();
    },
    onSuccess: (data: Trip) => {
      onBook(data);
      toast({
        title: "Ride booked successfully!",
        description: "Your ride has been booked and a driver is on the way.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message || "An error occurred while booking your ride.",
        variant: "destructive"
      });
    }
  });

  // Toggle collapse on mobile
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="bg-white md:w-1/3 md:max-w-md md:h-full md:shadow-lg z-10 slide-up md:transform-none overflow-y-auto">
      {/* Booking Panel Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="font-display text-lg font-semibold text-secondary">Book a Ride</h2>
          {isMobile && (
            <div>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                onClick={toggleCollapse}
                aria-label={collapsed ? "Expand booking panel" : "Collapse booking panel"}
              >
                {collapsed ? <ChevronUp className="text-dark" /> : <ChevronDown className="text-dark" />}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Form */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Pickup and Destination */}
          <div className="space-y-3">
            <div className="relative flex items-start">
              <div className="absolute left-3 top-3 w-6 h-full flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-full bg-gray-300 -mt-1"></div>
              </div>
              <Input
                placeholder="Current location"
                value={formData.pickupAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div className="relative flex items-start">
              <div className="absolute left-3 top-3 w-6 h-6 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
              </div>
              <Input
                placeholder="Where to?"
                value={formData.destinationAddress}
                onChange={handleDestinationChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100"
              />
            </div>
          </div>
          
          {/* Journey Details - only show if destination is entered */}
          {formData.distance > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-dark">Estimated distance</span>
                  <p className="font-medium text-secondary">{formatDistance(formData.distance)}</p>
                </div>
                <div>
                  <span className="text-sm text-dark">Estimated time</span>
                  <p className="font-medium text-secondary">{formatTime(formData.estimatedTime)}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Cab Options */}
          <div className="space-y-3">
            <h3 className="font-display font-medium text-secondary">Select a ride</h3>
            
            {cabTypes.map(cabType => (
              <div 
                key={cabType.id}
                className={`flex items-center border p-3 rounded-lg hover:border-primary hover:bg-gray-50 cursor-pointer transition group ${
                  formData.selectedCabType?.id === cabType.id ? 'border-primary bg-gray-50' : 'border-gray-200'
                }`}
                onClick={() => handleCabTypeSelection(cabType)}
              >
                <div className="mr-3">
                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                    {cabType.name === "Standard" && <Car className="h-8 w-8 text-gray-500" />}
                    {cabType.name === "Premium" && <Car className="h-8 w-8 text-gray-700" />}
                    {cabType.name === "SUV" && <Car className="h-8 w-8 text-gray-900" />}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-secondary">{cabType.name}</h4>
                    <span className="font-semibold text-secondary">
                      {formData.distance > 0 
                        ? formatPrice(calculatePrice(formData.distance, cabType))
                        : formatPrice(cabType.basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-dark">{cabType.seatingCapacity} seats, {cabType.description}</p>
                    <span className={`text-sm text-primary font-medium 
                      ${formData.selectedCabType?.id === cabType.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
                      Select
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Payment Method */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="text-dark mr-2 h-5 w-5" />
                <span className="text-secondary font-medium">Payment</span>
              </div>
              <div className="flex items-center cursor-pointer text-accent">
                <span className="mr-1">Cash Payment</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Book Button */}
          <Button 
            className="w-full py-6 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition"
            onClick={() => bookRideMutation.mutate()}
            disabled={bookRideMutation.isPending || !formData.selectedCabType || !formData.destinationAddress}
          >
            {bookRideMutation.isPending ? "Booking..." : "Book Ride"}
          </Button>
          
          {/* Terms */}
          <p className="text-xs text-center text-dark">
            By booking, you agree to our <a href="#" className="text-accent">Terms of Service</a> and <a href="#" className="text-accent">Privacy Policy</a>
          </p>
        </div>
      )}
    </div>
  );
}
