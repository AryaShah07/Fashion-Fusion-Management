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
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderID: number;
  customerId: {
    _id: string;
    name: string;
  };
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface Payment {
  _id: string;
  paymentID: number;
  orderId: {
    _id: string;
    orderID: number;
    customerId: {
      name: string;
    };
  };
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedOrder('');
    setSelectedPaymentMethod('');
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const paymentData = {
        orderId: selectedOrder,
        amount: Number(formData.get('amount')),
        paymentMethod: selectedPaymentMethod,
      };

      console.log('Submitting payment data:', paymentData);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to record payment');
      }

      const newPayment = await response.json();
      setPayments([...payments, newPayment]);
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      
      // Reset form
      resetForm();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order._id} value={order._id}>
                        Order #{String(order.orderID).padStart(3, '0')} - {order.customerId?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input type="number" name="amount" required step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !selectedOrder || !selectedPaymentMethod}>
                {loading ? 'Saving...' : 'Save Payment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>#{String(payment.paymentID).padStart(3, '0')}</TableCell>
                  <TableCell>#{String(payment.orderId?.orderID).padStart(3, '0')}</TableCell>
                  <TableCell>{payment.orderId?.customerId?.name || 'N/A'}</TableCell>
                  <TableCell>{payment.amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}