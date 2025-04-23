import mongoose from 'mongoose';
import { log } from './vite';
import CabTypeModel from './models/CabType';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://23it134:KDSofms6VZfa1gHk@cluster0.vgkjql2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    log('MongoDB connected successfully', 'mongodb');
    
    // Initialize database with default data if needed
    await initializeDatabase();
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'mongodb');
    process.exit(1);
  }
};

// Initialize database with essential data
const initializeDatabase = async () => {
  try {
    // Check if cab types exist, if not add some default ones
    const cabTypesCount = await CabTypeModel.countDocuments();
    
    if (cabTypesCount === 0) {
      log('Initializing database with default cab types...', 'mongodb');
      
      // Default cab types
      const defaultCabTypes = [
        {
          name: 'Standard',
          description: '4 seats, standard sedan',
          basePrice: 5,
          pricePerKm: 1.5,
          seatingCapacity: 4
        },
        {
          name: 'Premium',
          description: '4 seats, luxury sedan',
          basePrice: 8,
          pricePerKm: 2.5,
          seatingCapacity: 4
        },
        {
          name: 'SUV',
          description: '6 seats, spacious SUV',
          basePrice: 10,
          pricePerKm: 3,
          seatingCapacity: 6
        }
      ];
      
      await CabTypeModel.insertMany(defaultCabTypes);
      log('Default cab types added successfully', 'mongodb');
    }
    
    // Other initialization can go here
    
  } catch (error) {
    log(`Database initialization error: ${error}`, 'mongodb');
  }
};

export default connectDB;