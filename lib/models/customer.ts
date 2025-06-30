import mongoose from 'mongoose';
import { Counter } from './counter';

const measurementSchema = new mongoose.Schema({
  chest: Number,
  waist: Number,
  hips: Number,
  sleeveLength: Number,
  shoulder: Number,
  neck: Number,
  date: { type: Date, default: Date.now },
  notes: String
});

const customerSchema = new mongoose.Schema({
  customerID: { type: Number, required: true, unique: true },
  userId: { type: String, required: true }, // Clerk user ID
  name: { type: String, required: true },
  email: String,
  phone: String,
  address: String,
  measurements: [measurementSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-validate hook to ensure customerID is set before validation
customerSchema.pre('validate', async function(next) {
  if (this.isNew && !this.customerID) {
    try {
      const nextID = await Counter.getNextSequence('Customer');
      this.customerID = nextID;
    } catch (error: any) {
      console.error('Error generating customer ID:', error);
    }
  }
  next();
});

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);