import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User schema for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
});

// Driver table schema
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  licensePlate: text("license_plate").notNull(),
  carModel: text("car_model").notNull(),
  rating: doublePrecision("rating").default(5.0),
  isAvailable: boolean("is_available").default(true),
  currentLat: doublePrecision("current_lat").notNull(),
  currentLng: doublePrecision("current_lng").notNull(),
});

// Driver schema for inserts
export const insertDriverSchema = createInsertSchema(drivers).pick({
  fullName: true,
  phone: true,
  licensePlate: true,
  carModel: true,
  currentLat: true,
  currentLng: true,
});

// Cab type schema
export const cabTypes = pgTable("cab_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: doublePrecision("base_price").notNull(),
  pricePerKm: doublePrecision("price_per_km").notNull(),
  seatingCapacity: integer("seating_capacity").notNull(),
});

// Cab type schema for inserts
export const insertCabTypeSchema = createInsertSchema(cabTypes).pick({
  name: true,
  description: true,
  basePrice: true,
  pricePerKm: true,
  seatingCapacity: true,
});

// Trip/booking schema
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  driverId: integer("driver_id"),
  cabTypeId: integer("cab_type_id").notNull(),
  pickupLat: doublePrecision("pickup_lat").notNull(),
  pickupLng: doublePrecision("pickup_lng").notNull(),
  destinationLat: doublePrecision("destination_lat").notNull(),
  destinationLng: doublePrecision("destination_lng").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  destinationAddress: text("destination_address").notNull(),
  distance: doublePrecision("distance").notNull(),
  price: doublePrecision("price").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, cancelled
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trip schema for inserts
export const insertTripSchema = createInsertSchema(trips).pick({
  userId: true,
  cabTypeId: true,
  pickupLat: true,
  pickupLng: true,
  destinationLat: true,
  destinationLng: true,
  pickupAddress: true,
  destinationAddress: true,
  distance: true,
  price: true,
});

// Trip update schema
export const updateTripSchema = createInsertSchema(trips).pick({
  driverId: true,
  status: true,
  startTime: true,
  endTime: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type CabType = typeof cabTypes.$inferSelect;
export type InsertCabType = z.infer<typeof insertCabTypeSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type UpdateTrip = z.infer<typeof updateTripSchema>;
