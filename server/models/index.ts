import UserModel from './User';
import DriverModel from './Driver';
import CabTypeModel from './CabType';
import TripModel from './Trip';

import { type IUser } from './User';
import { type IDriver } from './Driver';
import { type ICabType } from './CabType';
import { type ITrip } from './Trip';

// Export the models
export {
  UserModel,
  DriverModel,
  CabTypeModel,
  TripModel,
  // Export types
  type IUser,
  type IDriver,
  type ICabType,
  type ITrip
};