import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/order';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const orderData = await req.json();
    console.log('Received order data:', orderData);

    if (!orderData.customerId || !orderData.dueDate || !orderData.amount) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    await connectDB();

    const nextOrderID = await Order.getNextOrderID();
    console.log('Generated nextOrderID:', nextOrderID);

    const order = new Order({
      orderID: nextOrderID,
      customerId: {
        _id: orderData.customerId,
        name: orderData.customerName || 'Unknown Customer'
      },
      dueDate: new Date(orderData.dueDate),
      items: [{
        description: orderData.patternDetails,
        price: orderData.amount
      }],
      totalAmount: orderData.amount,
      status: 'pending',
      paidAmount: 0,
      paymentStatus: 'pending'
    });

    console.log('Order object before save:', order);
    await order.save();
    console.log('Order saved successfully');

    const savedOrder = await Order.findById(order._id).lean();
    return NextResponse.json(savedOrder);
  } catch (error: any) {
    console.error('Error in orders POST:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create order',
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
    const orders = await Order.find({})
      .sort({ orderID: 1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error in orders GET:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { orderId, ...updateData } = await req.json();
    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    await connectDB();

    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { ...updateData },
      { new: true }
    );

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error in orders PUT:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    await connectDB();

    const order = await Order.findOneAndDelete({ _id: orderId, userId });
    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in orders DELETE:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}