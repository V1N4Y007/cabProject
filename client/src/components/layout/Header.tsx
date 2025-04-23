import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAuthenticated, getUser, logout } from "@/lib/auth";
import { MapPin, User, Clock, LogOut, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [location, setLocation] = useLocation();
  const authenticated = isAuthenticated();
  const user = getUser();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    setLocation("/auth");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
      variant: "default",
    });
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo and main navigation */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-primary">
            RideQuick
          </Link>

          {authenticated && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/">
                <Button variant={location === "/" ? "default" : "ghost"} size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Book a Ride
                </Button>
              </Link>
              <Link href="/trips">
                <Button variant={location === "/trips" ? "default" : "ghost"} size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  My Trips
                </Button>
              </Link>
            </nav>
          )}
        </div>

        {/* User menu or auth buttons */}
        <div className="flex items-center space-x-4">
          {authenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden md:inline-block">
                      {user.fullName}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/trips" className="cursor-pointer w-full">
                    <Clock className="w-4 h-4 mr-2" />
                    My Trips
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm">Login</Button>
            </Link>
          )}

          {/* Mobile menu */}
          {authenticated && (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      Book a Ride
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/trips" className="cursor-pointer w-full">
                      <Clock className="w-4 h-4 mr-2" />
                      My Trips
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}