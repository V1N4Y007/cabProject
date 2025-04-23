import { 
  users, 
  drivers, 
  cabTypes, 
  trips, 
  type User, 
  type InsertUser,
  type Driver,
  type InsertDriver,
  type CabType,
  type InsertCabType,
  type Trip,
  type InsertTrip,
  type UpdateTrip
} from "@shared/schema";

// Storage interface for all models
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Driver methods
  getDriver(id: number): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  getNearbyDrivers(lat: number, lng: number, maxDistance?: number): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverLocation(id: number, lat: number, lng: number): Promise<Driver | undefined>;
  updateDriverAvailability(id: number, isAvailable: boolean): Promise<Driver | undefined>;
  
  // Cab type methods
  getCabType(id: number): Promise<CabType | undefined>;
  getAllCabTypes(): Promise<CabType[]>;
  createCabType(cabType: InsertCabType): Promise<CabType>;
  
  // Trip methods
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUserId(userId: number): Promise<Trip[]>;
  getTripsByDriverId(driverId: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, updateData: Partial<UpdateTrip>): Promise<Trip | undefined>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drivers: Map<number, Driver>;
  private cabTypes: Map<number, CabType>;
  private trips: Map<number, Trip>;
  
  private userId: number;
  private driverId: number;
  private cabTypeId: number;
  private tripId: number;
  
  constructor() {
    this.users = new Map();
    this.drivers = new Map();
    this.cabTypes = new Map();
    this.trips = new Map();
    
    this.userId = 1;
    this.driverId = 1;
    this.cabTypeId = 1;
    this.tripId = 1;
    
    // Initialize with some default cab types
    this.initCabTypes();
    // Initialize with some default drivers
    this.initDrivers();
  }
  
  // Initialize default cab types
  private initCabTypes() {
    this.createCabType({
      name: "Standard",
      description: "4 seats, standard comfort",
      basePrice: 5,
      pricePerKm: 1.5,
      seatingCapacity: 4
    });
    
    this.createCabType({
      name: "Premium",
      description: "4 seats, premium features",
      basePrice: 8,
      pricePerKm: 2.25,
      seatingCapacity: 4
    });
    
    this.createCabType({
      name: "SUV",
      description: "6 seats, spacious",
      basePrice: 10,
      pricePerKm: 3,
      seatingCapacity: 6
    });
  }
  
  // Initialize some drivers with random locations
  private initDrivers() {
    // Create drivers near multiple locations globally
    const locations = [
      { name: "NYC", lat: 40.7128, lng: -74.0060 },
      { name: "Anand", lat: 22.5967198, lng: 72.8345504 }, // Anand, India
      { name: "London", lat: 51.5074, lng: -0.1278 },
      { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
      { name: "Sydney", lat: -33.8688, lng: 151.2093 }
    ];
    
    // Create 5 drivers near each location (25 total)
    locations.forEach((location, locationIndex) => {
      for (let i = 0; i < 5; i++) {
        const driverIndex = locationIndex * 5 + i;
        // Create closer offset for better chance of finding drivers
        const latOffset = (Math.random() - 0.5) * 0.02; // Smaller radius
        const lngOffset = (Math.random() - 0.5) * 0.02;
        
        this.createDriver({
          fullName: `Driver ${driverIndex + 1}`,
          phone: `555-${1000 + driverIndex}`,
          licensePlate: `ABC${1000 + driverIndex}`,
          carModel: driverIndex % 3 === 0 ? "Toyota Camry" : driverIndex % 3 === 1 ? "Honda Accord" : "Ford Explorer",
          currentLat: location.lat + latOffset,
          currentLng: location.lng + lngOffset
        });
      }
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: now,
      phone: user.phone || null // Ensure phone is string | null, not undefined
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Driver methods
  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }
  
  async getAllDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }
  
  async getNearbyDrivers(lat: number, lng: number, maxDistance: number = 5): Promise<Driver[]> {
    const availableDrivers = Array.from(this.drivers.values()).filter(
      driver => driver.isAvailable
    );
    
    // Calculate all distances
    const driversWithDistance = availableDrivers.map(driver => {
      const distance = this.calculateDistance(
        { lat, lng },
        { lat: driver.currentLat, lng: driver.currentLng }
      );
      return { driver, distance };
    });
    
    // Sort by distance
    driversWithDistance.sort((a, b) => a.distance - b.distance);
    
    // First try with original max distance
    let result = driversWithDistance
      .filter(item => item.distance <= maxDistance)
      .map(item => item.driver);
    
    // If no drivers found, gradually increase the search radius
    if (result.length === 0 && driversWithDistance.length > 0) {
      // Take the closest 3 drivers regardless of distance
      result = driversWithDistance.slice(0, 3).map(item => item.driver);
    }
    
    return result;
  }
  
  async createDriver(driver: InsertDriver): Promise<Driver> {
    const id = this.driverId++;
    const newDriver: Driver = { 
      ...driver, 
      id, 
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5 and 5.0
      isAvailable: true 
    };
    this.drivers.set(id, newDriver);
    return newDriver;
  }
  
  async updateDriverLocation(id: number, lat: number, lng: number): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const updatedDriver = { ...driver, currentLat: lat, currentLng: lng };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }
  
  async updateDriverAvailability(id: number, isAvailable: boolean): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const updatedDriver = { ...driver, isAvailable };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }
  
  // Cab type methods
  async getCabType(id: number): Promise<CabType | undefined> {
    return this.cabTypes.get(id);
  }
  
  async getAllCabTypes(): Promise<CabType[]> {
    return Array.from(this.cabTypes.values());
  }
  
  async createCabType(cabType: InsertCabType): Promise<CabType> {
    const id = this.cabTypeId++;
    const newCabType: CabType = { 
      ...cabType, 
      id,
      description: cabType.description || null // Ensure description is string | null, not undefined 
    };
    this.cabTypes.set(id, newCabType);
    return newCabType;
  }
  
  // Trip methods
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async getTripsByUserId(userId: number): Promise<Trip[]> {
    return Array.from(this.trips.values())
      .filter(trip => trip.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getTripsByDriverId(driverId: number): Promise<Trip[]> {
    return Array.from(this.trips.values())
      .filter(trip => trip.driverId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.tripId++;
    const now = new Date();
    const newTrip: Trip = { 
      ...trip, 
      id, 
      driverId: null, 
      status: "pending", 
      startTime: null, 
      endTime: null, 
      createdAt: now 
    };
    this.trips.set(id, newTrip);
    return newTrip;
  }
  
  async updateTrip(id: number, updateData: Partial<UpdateTrip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = { ...trip, ...updateData };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }
  
  // Helper method to calculate distance between two points in km
  private calculateDistance(point1: { lat: number, lng: number }, point2: { lat: number, lng: number }): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; // Distance in km
    return distance;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
