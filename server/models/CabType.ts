import mongoose, { Document, Schema } from 'mongoose';

export interface ICabType extends Document {
  name: string;
  description: string | null;
  basePrice: number;
  pricePerKm: number;
  seatingCapacity: number;
}

const CabTypeSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: null 
  },
  basePrice: { 
    type: Number, 
    required: true 
  },
  pricePerKm: { 
    type: Number, 
    required: true 
  },
  seatingCapacity: { 
    type: Number, 
    required: true 
  }
});

export default mongoose.model<ICabType>('CabType', CabTypeSchema);