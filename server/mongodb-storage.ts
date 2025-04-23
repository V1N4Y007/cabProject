import { IStorage } from './storage';
import UserModel from './models/User';
import DriverModel from './models/Driver';
import CabTypeModel from './models/CabType';
import TripModel from './models/Trip';
import { 
  type User as UserType, 
  type Driver as DriverType, 
  type CabType as CabTypeType, 
  type Trip as TripType,
  type InsertUser,
  type InsertDriver,
  type InsertCabType,
  type InsertTrip,
  type UpdateTrip
} from '../shared/schema';
import mongoose from 'mongoose';
const { Types } = mongoose;

import { type IUser } from './models/User';
import { type IDriver } from './models/Driver';
import { type ICabType } from './models/CabType';
import { type ITrip } from './models/Trip';

class MongoDBStorage {
  /* User methods */
  async getUser(id: number): Promise<UserType | undefined> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return this.convertMongoUserToUserType(user);
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return this.convertMongoUserToUserType(user);
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return undefined;
      
      return this.convertMongoUserToUserType(user);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<UserType> {
    try {
      const newUser = new UserModel(user);
      const savedUser = await newUser.save();
      
      return this.convertMongoUserToUserType(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Helper method to convert MongoDB user document to User type
  private convertMongoUserToUserType(user: IUser): UserType {
    return {
      id: typeof user._id === 'string' ? parseInt(user._id) : parseInt(user._id.toString()),
      username: user.username,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      phone: user.phone || null,
      createdAt: user.createdAt
    };
  }

  /* Driver methods */
  async getDriver(id: number): Promise<IDriver | undefined> {
    try {
      const driver = await DriverModel.findById(id);
      return driver || undefined;
    } catch (error) {
      console.error('Error getting driver:', error);
      return undefined;
    }
  }

  async getAllDrivers(): Promise<IDriver[]> {
    try {
      return await DriverModel.find();
    } catch (error) {
      console.error('Error getting all drivers:', error);
      return [];
    }
  }

  async getNearbyDrivers(lat: number, lng: number, maxDistance: number = 5): Promise<IDriver[]> {
    try {
      // Find drivers that are available and calculate their distance from the requested location
      const drivers = await DriverModel.find({ isAvailable: true });
      
      // Filter drivers by distance
      return drivers.filter(driver => {
        const distance = this.calculateDistance(
          { lat, lng },
          { lat: driver.currentLat, lng: driver.currentLng }
        );
        return distance <= maxDistance;
      });
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      return [];
    }
  }

  async createDriver(driver: InsertDriver): Promise<IDriver> {
    try {
      const newDriver = new DriverModel(driver);
      return await newDriver.save();
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  async updateDriverLocation(id: number, lat: number, lng: number): Promise<IDriver | undefined> {
    try {
      const driver = await DriverModel.findByIdAndUpdate(
        id,
        { currentLat: lat, currentLng: lng },
        { new: true }
      );
      return driver || undefined;
    } catch (error) {
      console.error('Error updating driver location:', error);
      return undefined;
    }
  }

  async updateDriverAvailability(id: number, isAvailable: boolean): Promise<IDriver | undefined> {
    try {
      const driver = await DriverModel.findByIdAndUpdate(
        id,
        { isAvailable },
        { new: true }
      );
      return driver || undefined;
    } catch (error) {
      console.error('Error updating driver availability:', error);
      return undefined;
    }
  }

  /* Cab type methods */
  async getCabType(id: number): Promise<ICabType | undefined> {
    try {
      const cabType = await CabTypeModel.findById(id);
      return cabType || undefined;
    } catch (error) {
      console.error('Error getting cab type:', error);
      return undefined;
    }
  }

  async getAllCabTypes(): Promise<ICabType[]> {
    try {
      return await CabTypeModel.find();
    } catch (error) {
      console.error('Error getting all cab types:', error);
      return [];
    }
  }

  async createCabType(cabType: InsertCabType): Promise<ICabType> {
    try {
      const newCabType = new CabTypeModel(cabType);
      return await newCabType.save();
    } catch (error) {
      console.error('Error creating cab type:', error);
      throw error;
    }
  }

  /* Trip methods */
  async getTrip(id: number): Promise<ITrip | undefined> {
    try {
      const trip = await TripModel.findById(id);
      return trip || undefined;
    } catch (error) {
      console.error('Error getting trip:', error);
      return undefined;
    }
  }

  async getTripsByUserId(userId: number): Promise<ITrip[]> {
    try {
      return await TripModel.find({ userId });
    } catch (error) {
      console.error('Error getting trips by user ID:', error);
      return [];
    }
  }

  async getTripsByDriverId(driverId: number): Promise<ITrip[]> {
    try {
      return await TripModel.find({ driverId });
    } catch (error) {
      console.error('Error getting trips by driver ID:', error);
      return [];
    }
  }

  async createTrip(trip: InsertTrip): Promise<ITrip> {
    try {
      const newTrip = new TripModel(trip);
      return await newTrip.save();
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  async updateTrip(id: number, updateData: Partial<UpdateTrip>): Promise<ITrip | undefined> {
    try {
      const trip = await TripModel.findByIdAndUpdate(id, updateData, { new: true });
      return trip || undefined;
    } catch (error) {
      console.error('Error updating trip:', error);
      return undefined;
    }
  }

  /* Helper methods */
  private calculateDistance(point1: { lat: number, lng: number }, point2: { lat: number, lng: number }): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Create and export a singleton instance
export const mongoDBStorage = new MongoDBStorage();

// Export the class
export { MongoDBStorage };