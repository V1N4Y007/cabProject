import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  fullName: string;
  phone: string;
  licensePlate: string;
  carModel: string;
  rating: number;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
  createdAt: Date;
}

const DriverSchema: Schema = new Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  licensePlate: { 
    type: String, 
    required: true 
  },
  carModel: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    default: 5.0, 
    min: 1, 
    max: 5 
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  currentLat: { 
    type: Number, 
    required: true 
  },
  currentLng: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IDriver>('Driver', DriverSchema);