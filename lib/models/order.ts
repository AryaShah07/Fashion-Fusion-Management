import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

// Define the Order interface
export interface IOrder {
  orderID: number;
  customerId: {
    _id: string;
    name: string;
  };
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  items: Array<{
    description?: string;
    price?: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
}

const orderSchema = new mongoose.Schema<IOrder>({
  orderID: { type: Number, required: true, unique: true },
  customerId: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
  },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  items: [{
    description: String,
    price: Number,
  }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending',
  },
});

// Add the static method to the schema
orderSchema.static('getNextOrderID', async function() {
  try {
    await connectDB();
    const lastOrder = await this.findOne().sort({ orderID: -1 });
    return lastOrder ? lastOrder.orderID + 1 : 1;
  } catch (error) {
    console.error('Error getting next order ID:', error);
    throw error;
  }
});

// Create and export the model
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export type { IOrder };