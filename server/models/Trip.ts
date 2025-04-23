import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId | null;
  cabTypeId: mongoose.Types.ObjectId;
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  pickupAddress: string;
  destinationAddress: string;
  distance: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
}

const TripSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  driverId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Driver',
    default: null
  },
  cabTypeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'CabType',
    required: true 
  },
  pickupLat: { 
    type: Number, 
    required: true 
  },
  pickupLng: { 
    type: Number, 
    required: true 
  },
  destinationLat: { 
    type: Number, 
    required: true 
  },
  destinationLng: { 
    type: Number, 
    required: true 
  },
  pickupAddress: { 
    type: String, 
    required: true 
  },
  destinationAddress: { 
    type: String, 
    required: true 
  },
  distance: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startTime: { 
    type: Date, 
    default: null
  },
  endTime: { 
    type: Date, 
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<ITrip>('Trip', TripSchema);