import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // Temporarily using the MemStorage for now
import { 
  insertUserSchema, 
  insertTripSchema, 
  updateTripSchema
} from "@shared/schema";
import { z } from "zod";

// JWT for authentication
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT secret - in a real app, this would be an environment variable
const JWT_SECRET = "ride_quick_super_secret_key";

// Helper interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

// Authentication middleware
const authenticate = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Public routes
  
  // User registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      // Return user data (excluding password) and token
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // User login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      // Return user data (excluding password) and token
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get all cab types
  app.get("/api/cab-types", async (req: Request, res: Response) => {
    try {
      const cabTypes = await storage.getAllCabTypes();
      res.json(cabTypes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Protected routes (require authentication)
  
  // Get user profile
  app.get("/api/users/me", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get nearby drivers
  app.get("/api/drivers/nearby", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const { lat, lng, maxDistance } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const distance = maxDistance ? parseFloat(maxDistance as string) : 5;
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid latitude or longitude" });
      }
      
      const drivers = await storage.getNearbyDrivers(latitude, longitude, distance);
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new trip
  app.post("/api/trips", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const tripData = insertTripSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Create the trip
      let trip = await storage.createTrip(tripData);
      
      // Find an available driver for the trip - increased search radius
      let nearbyDrivers = await storage.getNearbyDrivers(
        tripData.pickupLat, 
        tripData.pickupLng,
        10 // Increase search radius to 10km
      );
      
      // If still no drivers found, get any available driver (regardless of distance)
      if (nearbyDrivers.length === 0) {
        const allDrivers = await storage.getAllDrivers();
        nearbyDrivers = allDrivers.filter(driver => driver.isAvailable)
          .slice(0, 1); // Just get the first available driver
      }
      
      if (nearbyDrivers.length > 0) {
        const driver = nearbyDrivers[0];
        
        // Assign driver to the trip
        const updatedTripData = await storage.updateTrip(trip.id, {
          driverId: driver.id,
          status: "confirmed",
          startTime: new Date() // Set start time
        });
        // Make sure we have valid trip data
        if (updatedTripData) {
          trip = updatedTripData;
        }
        
        // Update driver availability
        await storage.updateDriverAvailability(driver.id, false);
        
        // Also update driver location to be near pickup point for better UX
        await storage.updateDriverLocation(
          driver.id, 
          trip.pickupLat + (Math.random() - 0.5) * 0.01, // Slightly offset from pickup
          trip.pickupLng + (Math.random() - 0.5) * 0.01
        );
        
        console.log(`Trip ${trip.id} confirmed with driver ${driver.id}`);
      } else {
        console.log(`No drivers found for trip ${trip.id}`);
      }
      
      res.status(201).json(trip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating trip:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user trips
  app.get("/api/trips", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const trips = await storage.getTripsByUserId(req.user.id);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get a specific trip
  app.get("/api/trips/:id", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // Ensure user owns the trip
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update trip status (cancel, etc.)
  app.patch("/api/trips/:id", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // Ensure user owns the trip
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Only allow updating status for now
      const updateData = updateTripSchema.partial().parse(req.body);
      
      // Handle status transitions
      if (updateData.status === 'completed' && trip.status === 'in_progress') {
        // If completing a trip, set end time
        updateData.endTime = new Date();
      } else if (updateData.status === 'in_progress' && trip.status === 'confirmed') {
        // If starting a trip, make sure start time is set
        if (!trip.startTime) {
          updateData.startTime = new Date();
        }
      }
      
      const updatedTrip = await storage.updateTrip(tripId, updateData);
      
      // If cancelling or completing trip, make driver available again
      if ((updateData.status === 'cancelled' || updateData.status === 'completed') && trip.driverId) {
        await storage.updateDriverAvailability(trip.driverId, true);
        
        // If completed, move driver to destination location
        if (updateData.status === 'completed') {
          await storage.updateDriverLocation(
            trip.driverId,
            trip.destinationLat,
            trip.destinationLng
          );
        }
      }
      
      console.log(`Trip ${trip.id} updated: ${trip.status} -> ${updateData.status}`);
      res.json(updatedTrip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error updating trip:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Complete a trip (convenience endpoint)
  app.post("/api/trips/:id/complete", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // Ensure user owns the trip
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Can only complete trips that are confirmed or in_progress
      if (trip.status !== 'confirmed' && trip.status !== 'in_progress') {
        return res.status(400).json({ 
          message: "Cannot complete trip", 
          details: "Trip must be confirmed or in progress to complete" 
        });
      }
      
      // If trip is confirmed but not started, start it first
      let updatedTrip = trip;
      if (trip.status === 'confirmed') {
        const inProgressTrip = await storage.updateTrip(tripId, {
          status: 'in_progress',
          startTime: new Date()
        });
        if (inProgressTrip) {
          updatedTrip = inProgressTrip;
        }
      }
      
      // Then complete the trip
      const completedTripData = await storage.updateTrip(tripId, {
        status: 'completed',
        endTime: new Date()
      });
      
      if (completedTripData) {
        updatedTrip = completedTripData;
      }
      
      // Make driver available again
      if (trip.driverId) {
        await storage.updateDriverAvailability(trip.driverId, true);
        
        // Move driver to destination location
        await storage.updateDriverLocation(
          trip.driverId,
          trip.destinationLat,
          trip.destinationLng
        );
      }
      
      console.log(`Trip ${trip.id} completed`);
      res.json(updatedTrip);
    } catch (error) {
      console.error("Error completing trip:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
