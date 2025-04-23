import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getUser, isAuthenticated, logout } from "@/lib/auth";
import { Menu, X, ChevronDown } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const user = getUser();
  const authenticated = isAuthenticated();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm z-10 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-primary font-display font-bold text-2xl cursor-pointer">
              RideQuick
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <span className={`${location === "/" ? "text-primary" : "text-dark"} hover:text-primary transition cursor-pointer`}>
              Book a Ride
            </span>
          </Link>
          
          {authenticated && (
            <Link href="/trips">
              <span className={`${location === "/trips" ? "text-primary" : "text-dark"} hover:text-primary transition cursor-pointer`}>
                My Trips
              </span>
            </Link>
          )}
          
          <Link href="/support">
            <span className={`${location === "/support" ? "text-primary" : "text-dark"} hover:text-primary transition cursor-pointer`}>
              Support
            </span>
          </Link>
          
          {authenticated ? (
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-dark font-medium">{user?.fullName || user?.username}</span>
                    <ChevronDown className="h-4 w-4 text-dark" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/profile">
                      <span className="w-full cursor-pointer">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/payment">
                      <span className="w-full cursor-pointer">Payment Methods</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">
                      <span className="w-full cursor-pointer">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error" onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-dark hover:text-primary transition">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-white hover:bg-opacity-90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden focus:outline-none" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-dark" />
          ) : (
            <Menu className="h-6 w-6 text-dark" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md absolute w-full z-20">
          <div className="px-4 py-3 space-y-3">
            <Link href="/">
              <span className={`block ${location === "/" ? "text-primary" : "text-dark"} hover:text-primary transition`}>
                Book a Ride
              </span>
            </Link>
            
            {authenticated && (
              <Link href="/trips">
                <span className={`block ${location === "/trips" ? "text-primary" : "text-dark"} hover:text-primary transition`}>
                  My Trips
                </span>
              </Link>
            )}
            
            <Link href="/support">
              <span className={`block ${location === "/support" ? "text-primary" : "text-dark"} hover:text-primary transition`}>
                Support
                </span>
            </Link>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {authenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-dark font-medium">{user?.fullName || user?.username}</span>
                </div>
                <Link href="/profile">
                  <span className="block text-dark hover:text-primary transition text-sm">
                    My Profile
                  </span>
                </Link>
                <Link href="/payment">
                  <span className="block text-dark hover:text-primary transition text-sm">
                    Payment Methods
                  </span>
                </Link>
                <Link href="/settings">
                  <span className="block text-dark hover:text-primary transition text-sm">
                    Settings
                  </span>
                </Link>
                <span 
                  className="block text-error hover:text-red-700 transition text-sm cursor-pointer"
                  onClick={logout}
                >
                  Logout
                </span>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-primary text-white hover:bg-opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
