'use client';

import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';

interface Order {
  _id: string;
  orderID: number;
  customerId: {
    _id: string;
    name: string;
  };
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  items: Array<{
    description?: string;
    price?: number;
  }>;
  totalAmount: number;
}

interface Customer {
  _id: string;
  name: string;
}

interface ReminderResponse {
  orderID: number;
  customerName?: string;
  hoursUntilDue: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch orders',
        variant: 'destructive',
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch customers',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const amount = parseFloat(formData.get('amount') as string);
      
      if (isNaN(amount)) {
        throw new Error('Invalid amount');
      }

      const selectedCustomerData = customers.find(c => c._id === selectedCustomer);
      if (!selectedCustomerData) {
        throw new Error('Customer not found');
      }

      const orderData = {
        customerId: selectedCustomer,
        customerName: selectedCustomerData.name,
        dueDate: formData.get('dueDate'),
        patternDetails: formData.get('patternDetails'),
        amount: amount
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create order');
      }

      const newOrder = await response.json();
      setOrders([...orders, newOrder]);
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      form.reset();
      setSelectedCustomer('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status'], newDueDate: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          status: newStatus === 'in_progress' ? 'in-progress' : newStatus,
          dueDate: newDueDate 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to update order');
      }

      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" name="dueDate" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pattern Details</label>
                  <Textarea name="patternDetails" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input type="number" name="amount" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !selectedCustomer}>
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pattern Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{String(order.orderID).padStart(3, '0')}</TableCell>
                  <TableCell>{order.customerId?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.items?.[0]?.description || 'N/A'}</TableCell>
                  <TableCell>{order.totalAmount || 0}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Order</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select defaultValue={order.status} onValueChange={(value: Order['status']) => handleStatusUpdate(order._id, value, order.dueDate)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input 
                              type="date" 
                              defaultValue={new Date(order.dueDate).toISOString().split('T')[0]}
                              onChange={(e) => handleStatusUpdate(order._id, order.status, e.target.value)}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}