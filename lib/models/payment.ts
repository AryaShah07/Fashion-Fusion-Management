import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

interface IPayment extends mongoose.Document {
  paymentID: number;
  userId: string;
  orderId: {
    _id: string;
    orderID: number;
    customerId: {
      name: string;
    };
  };
  customerId: {
    _id: string;
    name: string;
  };
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  status: string;
  notes?: string;
}

interface PaymentModel extends mongoose.Model<IPayment> {
  getNextPaymentID(): Promise<number>;
}

const paymentSchema = new mongoose.Schema({
  paymentID: { type: Number, required: true, unique: true },
  userId: { type: String, required: true },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  customerId: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add static method for generating next payment ID
paymentSchema.static('getNextPaymentID', async function() {
  try {
    await connectDB();
    const lastPayment = await this.findOne().sort({ paymentID: -1 });
    return lastPayment ? lastPayment.paymentID + 1 : 1;
  } catch (error) {
    console.error('Error generating next payment ID:', error);
    throw error;
  }
});

// Create and export the model
export const Payment = mongoose.models.Payment || mongoose.model<IPayment, PaymentModel>('Payment', paymentSchema);