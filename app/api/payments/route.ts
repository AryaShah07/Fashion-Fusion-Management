import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { Payment } from '@/lib/models/payment';
import { Order } from '@/lib/models/order';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { orderId, amount, paymentMethod } = body;

    console.log('Received payment data:', body);

    if (!orderId || !amount || !paymentMethod) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();

    // Find the order with customer information
    const order = await Order.findById(orderId);
    if (!order) {
      return new NextResponse(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create payment with all required fields
    const nextPaymentID = await Payment.getNextPaymentID();
    const payment = new Payment({
      paymentID: nextPaymentID,
      userId: userId,
      orderId: order._id,
      customerId: {
        _id: order.customerId._id,
        name: order.customerId.name
      },
      amount,
      paymentMethod,
      status: 'completed',
      paymentDate: new Date()
    });

    await payment.save();

    // Update order's payment status
    const totalPaid = await Payment.aggregate([
      { $match: { orderId: new mongoose.Types.ObjectId(orderId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = totalPaid[0]?.total || 0;
    const paymentStatus = paidAmount >= order.totalAmount ? 'paid' : 'partial';

    await Order.findByIdAndUpdate(orderId, {
      paidAmount,
      paymentStatus
    });

    // Return populated payment
    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'orderId',
        select: 'orderID customerId totalAmount status',
        populate: {
          path: 'customerId',
          select: 'name'
        }
      });

    return NextResponse.json(populatedPayment);
  } catch (error: any) {
    console.error('Payment error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to record payment',
        details: error.message
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Only fetch payments for the current user
    const payments = await Payment.find({ userId })
      .populate({
        path: 'orderId',
        select: 'orderID customerId totalAmount status',
        populate: {
          path: 'customerId',
          select: 'name'
        }
      })
      .sort({ paymentDate: -1 });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Payment fetch error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch payments',
        details: error.message
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}