import React from "react";
import { Driver, Trip, CabType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/calculations";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Check, PhoneCall, MessageSquare } from "lucide-react";

interface RideConfirmationProps {
  trip: Trip;
  driver: Driver | null;
  cabType: CabType | null;
  onCancel: () => void;
}

export function RideConfirmation({ trip, driver, cabType, onCancel }: RideConfirmationProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation to cancel the ride
  const cancelRideMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/trips/${trip.id}`, {
        status: "cancelled"
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      onCancel();
      toast({
        title: "Ride cancelled",
        description: "Your ride has been cancelled successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling ride",
        description: error.message || "An error occurred while cancelling your ride.",
        variant: "destructive"
      });
    }
  });
  
  return (
    <div className="p-4 space-y-4">
      <div className="bg-success bg-opacity-10 p-4 rounded-lg text-center">
        <div className="w-16 h-16 rounded-full bg-success bg-opacity-20 flex items-center justify-center mx-auto mb-3">
          <Check className="h-6 w-6 text-success" />
        </div>
        <h3 className="font-display font-semibold text-secondary mb-1">Ride Booked Successfully!</h3>
        <p className="text-dark text-sm">
          {trip.status === "confirmed" 
            ? "Your ride will arrive in approximately 2 minutes" 
            : "Finding a driver for you..."}
        </p>
      </div>
      
      {/* Driver Information - only show if a driver is assigned */}
      {driver && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-display font-medium text-secondary mb-3">Driver Information</h3>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <span className="text-xl font-medium text-gray-600">{driver.fullName.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="font-medium text-secondary mr-2">{driver.fullName}</h4>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-dark text-sm ml-1">{driver.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-dark text-sm">{driver.carModel} • {driver.licensePlate}</p>
              <div className="flex mt-1">
                <Button variant="ghost" size="sm" className="mr-3 text-accent text-sm flex items-center p-0">
                  <PhoneCall className="h-4 w-4 mr-1" /> Call
                </Button>
                <Button variant="ghost" size="sm" className="text-accent text-sm flex items-center p-0">
                  <MessageSquare className="h-4 w-4 mr-1" /> Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Journey Information */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-display font-medium text-secondary mb-3">Trip Details</h3>
        
        <div className="space-y-3">
          <div className="relative flex items-start">
            <div className="absolute left-0 top-0 w-6 h-full flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="w-0.5 h-full bg-gray-300 -mt-1"></div>
            </div>
            <div className="ml-9">
              <p className="font-medium text-secondary">{trip.pickupAddress}</p>
              <p className="text-sm text-dark">Pickup point</p>
            </div>
          </div>
          
          <div className="relative flex items-start">
            <div className="absolute left-0 top-0 w-6 h-6 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
            </div>
            <div className="ml-9">
              <p className="font-medium text-secondary">{trip.destinationAddress}</p>
              <p className="text-sm text-dark">Destination</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <div>
            <span className="text-sm text-dark">Fare</span>
            <p className="font-semibold text-secondary">{formatPrice(trip.price)}</p>
          </div>
          <div>
            <span className="text-sm text-dark">Payment</span>
            <p className="text-secondary">Cash Payment</p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="border-error text-error hover:bg-error hover:bg-opacity-10 hover:text-error"
          onClick={() => cancelRideMutation.mutate()}
          disabled={cancelRideMutation.isPending}
        >
          {cancelRideMutation.isPending ? "Cancelling..." : "Cancel Ride"}
        </Button>
        <Button 
          className="bg-primary text-white hover:bg-opacity-90"
          onClick={() => window.location.href = "/trips"}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
