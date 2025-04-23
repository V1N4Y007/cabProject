const User = require('./User');
const Driver = require('./Driver');
const CabType = require('./CabType');
const Trip = require('./Trip');

// Export the models
module.exports = {
  User,
  Driver,
  CabType,
  Trip
};

// Create type module to be able to reference these types
// These will be accessible in TypeScript via namespace
module.exports.IUser = User.IUser;
module.exports.IDriver = Driver.IDriver;
module.exports.ICabType = CabType.ICabType;
module.exports.ITrip = Trip.ITrip;