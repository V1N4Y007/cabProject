import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trip, CabType } from "@/lib/types";
import { formatPrice, formatDate, formatDistance } from "@/lib/calculations";
import { isAuthenticated } from "@/lib/auth";
import { MapPin, Navigation, Calendar, Clock, DollarSign, Check, X, AlertCircle } from "lucide-react";

export default function MyTrips() {
  // Redirect if not authenticated
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  
  // Fetch user trips
  const { data: trips = [], isLoading, error } = useQuery<Trip[]>({
    queryKey: ['/api/trips']
  });
  
  // Fetch cab types (for more details about each trip)
  const { data: cabTypes = [] } = useQuery<CabType[]>({
    queryKey: ['/api/cab-types']
  });
  
  // Get cab type name
  const getCabTypeName = (cabTypeId: number): string => {
    const cabType = cabTypes.find(type => type.id === cabTypeId);
    return cabType ? cabType.name : "Standard";
  };
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      case "pending":
      case "confirmed":
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-secondary">My Trips</h1>
          <Link href="/">
            <Button className="bg-primary text-white hover:bg-opacity-90">Book New Ride</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-error mb-4" />
              <h3 className="text-xl font-medium text-secondary mb-2">Failed to load trips</h3>
              <p className="text-muted-foreground">Please try again later</p>
            </CardContent>
          </Card>
        ) : trips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Navigation className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-secondary mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">Book your first ride to get started</p>
              <Link href="/">
                <Button className="bg-primary text-white hover:bg-opacity-90">Book a Ride</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)}
                          <span className="ml-1 capitalize">{trip.status.replace("_", " ")}</span>
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {formatDate(trip.createdAt)}
                        </span>
                      </div>
                      <span className="font-semibold text-secondary">
                        {formatPrice(trip.price)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="flex-1">
                        <div className="space-y-3">
                          <div className="flex">
                            <div className="mr-3 mt-1">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-secondary line-clamp-1">{trip.pickupAddress}</p>
                            </div>
                          </div>
                          
                          <div className="flex">
                            <div className="mr-3 mt-1">
                              <div className="w-2 h-2 rounded-full bg-secondary"></div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-secondary line-clamp-1">{trip.destinationAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Navigation className="h-4 w-4 mr-1" />
                          {formatDistance(trip.distance)}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {getCabTypeName(trip.cabTypeId)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Trip #{trip.id}
                    </span>
                    <Link href={`/trips/${trip.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="pb-16 md:pb-0"></div> {/* Spacer for mobile nav */}
      <MobileNav />
    </div>
  );
}
