import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { Notification } from '@/lib/models/notification';

export async function checkDueDates() {
  try {
    await connectDB();
    console.log('Checking due dates...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Today:', today);
    console.log('Tomorrow:', tomorrow);

    // Find orders due tomorrow
    const orders = await Order.find({
      dueDate: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'completed' }
    }).populate('customerId', 'name');

    console.log('Found orders due tomorrow:', orders.length);

    if (!orders || orders.length === 0) {
      console.log('No orders due tomorrow');
      return;
    }

    for (const order of orders) {
      console.log('Processing order:', order.orderID);
      
      // Check if notification already exists for this order
      const existingNotification = await Notification.findOne({
        orderId: order._id,
        createdAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!existingNotification) {
        console.log('Creating notification for order:', order.orderID);
        // Create notification
        const notification = await Notification.create({
          orderId: order._id,
          orderID: order.orderID,
          customerName: order.customerId?.name || 'Unknown Customer',
          dueDate: order.dueDate,
          hoursUntilDue: 24,
          isUrgent: false,
          isRead: false
        });
        console.log('Created notification:', notification._id);
      } else {
        console.log('Notification already exists for order:', order.orderID);
      }
    }

    // Clean up notifications for completed orders
    const completedOrders = await Order.find({ status: 'completed' }).distinct('_id');
    if (completedOrders.length > 0) {
      const result = await Notification.deleteMany({
        orderId: { $in: completedOrders }
      });
      console.log('Cleaned up notifications for completed orders:', result.deletedCount);
    }
  } catch (error) {
    console.error('Error checking due dates:', error);
  }
} 