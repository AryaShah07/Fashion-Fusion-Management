import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { Notification } from '@/lib/models/notification';

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find orders due in the next 24 hours
    const orders = await Order.find({
      dueDate: {
        $gte: now,
        $lte: twentyFourHoursFromNow
      },
      status: { $ne: 'completed' }
    }).populate('customerId', 'name');

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        message: 'No orders due within 24 hours',
        remindersSent: []
      });
    }

    const reminders = [];

    for (const order of orders) {
      const dueDate = new Date(order.dueDate);
      const hoursUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

      // Only create notifications at 24 and 12 hours before due date
      if (hoursUntilDue <= 24 && (hoursUntilDue > 22 || (hoursUntilDue <= 12 && hoursUntilDue > 10))) {
        try {
          // Create notification
          await Notification.create({
            orderId: order._id,
            orderID: order.orderID,
            customerName: order.customerId?.name || 'Unknown Customer',
            dueDate: order.dueDate,
            hoursUntilDue,
            isUrgent: hoursUntilDue <= 12
          });

          reminders.push({
            orderID: order.orderID,
            hoursUntilDue,
            customerName: order.customerId?.name
          });
        } catch (error) {
          console.error(`Failed to create notification for order ${order.orderID}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: reminders.length > 0 ? 'Notifications created successfully' : 'No notifications needed at this time',
      remindersSent: reminders
    });
  } catch (error: any) {
    console.error('Error checking due dates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check due dates', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 