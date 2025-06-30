import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectDB } from '@/lib/db';
import { Notification } from '@/lib/models/notification';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();

    const notification = await Notification.findByIdAndUpdate(
      params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
} 