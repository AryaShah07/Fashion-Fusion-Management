'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  orderId: string;
  orderID: number;
  customerName: string;
  dueDate: string;
  hoursUntilDue: number;
  isUrgent: boolean;
  isRead: boolean;
  createdAt: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.statusText);
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      console.log('Fetched notifications:', data.length);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initializing notifications component');
    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => {
      console.log('Cleaning up notifications component');
      clearInterval(interval);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      
      if (!response.ok) {
        console.error('Failed to mark notification as read:', response.statusText);
        throw new Error('Failed to mark notification as read');
      }
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      console.log('Successfully marked notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  console.log('Current notifications state:', {
    total: notifications.length,
    unread: unreadCount,
    loading
  });

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Orders Due Tomorrow
        </CardTitle>
        {unreadCount > 0 && (
          <Badge variant="secondary">{unreadCount} unread</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const dueDate = new Date(notification.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const isDueTomorrow = dueDate.getDate() === today.getDate() + 1;
            
            if (!isDueTomorrow) {
              console.log('Skipping notification for non-tomorrow order:', notification.orderID);
              return null;
            }

            return (
              <div
                key={notification._id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                } ${!notification.isRead ? 'font-medium' : ''}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">
                      Order #{notification.orderID} for {notification.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      Due tomorrow ({dueDate.toLocaleDateString()})
                    </span>
                  </div>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsRead(notification._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 