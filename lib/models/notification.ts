import { Schema, model, models } from 'mongoose';

const notificationSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderID: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  hoursUntilDue: {
    type: Number,
    required: true
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Notification = models.Notification || model('Notification', notificationSchema); 