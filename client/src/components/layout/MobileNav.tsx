import React from "react";
import { Link, useLocation } from "wouter";
import { Car, Clock, Bell, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 py-2 px-6 flex justify-around items-center fixed bottom-0 left-0 right-0 z-10">
      <Link href="/">
        <div className={`flex flex-col items-center ${location === "/" ? "text-primary" : "text-dark"}`}>
          <Car className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Ride</span>
        </div>
      </Link>
      
      <Link href="/trips">
        <div className={`flex flex-col items-center ${location === "/trips" ? "text-primary" : "text-dark"}`}>
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">Activity</span>
        </div>
      </Link>
      
      <Link href="/notifications">
        <div className={`flex flex-col items-center ${location === "/notifications" ? "text-primary" : "text-dark"}`}>
          <Bell className="h-5 w-5" />
          <span className="text-xs mt-1">Alerts</span>
        </div>
      </Link>
      
      <Link href="/profile">
        <div className={`flex flex-col items-center ${location === "/profile" ? "text-primary" : "text-dark"}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Account</span>
        </div>
      </Link>
    </nav>
  );
}
