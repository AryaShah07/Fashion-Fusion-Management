import { Resend } from 'resend';
import { Order } from '@/lib/models/order';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDueDateNotification(order: Order) {
  const dueDate = new Date(order.dueDate);
  const hoursUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  
  let subject = '';
  let message = '';

  if (hoursUntilDue <= 24 && hoursUntilDue > 12) {
    subject = `Reminder: Order #${order.orderID} due in 24 hours`;
    message = `This is a reminder that Order #${order.orderID} for ${order.customerId.name} is due in 24 hours. Please ensure all work is completed on time.`;
  } else if (hoursUntilDue <= 12) {
    subject = `Urgent: Order #${order.orderID} due in 12 hours`;
    message = `This is an urgent reminder that Order #${order.orderID} for ${order.customerId.name} is due in 12 hours. Please complete the work immediately.`;
  }

  try {
    await resend.emails.send({
      from: 'Fashion Fusion <notifications@fashionfusion.com>',
      to: process.env.ADMIN_EMAIL || '',
      subject,
      html: `
        <h2>${subject}</h2>
        <p>${message}</p>
        <p>Order Details:</p>
        <ul>
          <li>Order ID: ${order.orderID}</li>
          <li>Customer: ${order.customerId.name}</li>
          <li>Due Date: ${dueDate.toLocaleString()}</li>
          <li>Status: ${order.status}</li>
        </ul>
      `,
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
} 