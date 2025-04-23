import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  createdAt: Date;
}

const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true
  },
  password: { 
    type: String, 
    required: true
  },
  fullName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IUser>('User', UserSchema);