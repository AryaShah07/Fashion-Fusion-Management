'use client';

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScissorsIcon, Users, ShoppingBag, CreditCard, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Notifications } from '@/components/notifications';

interface Order {
  _id: string;
  orderID: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  dueDate: Date;
}

export default function DashboardPage() {
  const { userId } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeOrders: 0,
    pendingPayments: 0,
    dueToday: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      redirect('/');
      return;
    }
    fetchDashboardStats();
    // Fetch stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchDashboardStats = async () => {
    try {
      // Run due date checker
      await fetch('/api/cron');
      
      // Fetch customers count
      const customersResponse = await fetch('/api/customers');
      const customers = await customersResponse.json();
      
      // Fetch orders
      const ordersResponse = await fetch('/api/orders');
      const orders: Order[] = await ordersResponse.json();

      // Calculate stats
      const activeOrders = orders.filter(order => order.status === 'in-progress').length;
      
      // Calculate pending payments from orders (total amount - paid amount)
      const pendingPayments = orders.reduce((sum: number, order: Order) => {
        const remaining = order.totalAmount - (order.paidAmount || 0);
        return sum + (remaining > 0 ? remaining : 0);
      }, 0);

      // Calculate orders due today
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const dueToday = orders.filter((order: Order) => {
        const dueDate = new Date(order.dueDate);
        const orderDate = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate()
        );
        return (
          orderDate.getTime() === today.getTime() && 
          order.status !== 'completed' &&
          order.status !== 'delivered'
        );
      }).length;

      setStats({
        totalCustomers: customers.length,
        activeOrders,
        pendingPayments,
        dueToday
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard statistics',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Order Reminder</h2>
      <Notifications />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueToday}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}