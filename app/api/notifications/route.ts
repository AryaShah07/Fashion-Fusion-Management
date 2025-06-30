import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectDB } from '@/lib/db';
import { Notification } from '@/lib/models/notification';
import { Order } from '@/lib/models/order';

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get notifications for orders due tomorrow
    const notifications = await Notification.find({
      orderId: {
        $in: await Order.find({
          dueDate: {
            $gte: tomorrow,
            $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          },
          status: { $ne: 'completed' }
        }).distinct('_id')
      }
    }).sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
} 