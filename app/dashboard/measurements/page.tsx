'use client';

import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusIcon, Pencil, Trash2 } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

export default function MeasurementsPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer?._id) {
      fetchMeasurements();
    } else {
      setMeasurements([]);
    }
  }, [selectedCustomer]);

  const fetchMeasurements = async () => {
    try {
      const response = await fetch(`/api/measurements?customerId=${selectedCustomer._id}`);
      if (!response.ok) throw new Error('Failed to fetch measurements');
      const data = await response.json();
      setMeasurements(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;
    
    try {
      const response = await fetch(`/api/measurements?customerId=${selectedCustomer._id}&index=${index}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete measurement');
      
      toast({
        title: 'Success',
        description: 'Measurement deleted successfully',
      });
      fetchMeasurements();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (e, index) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const measurements = {
        chest: Number(formData.get('chest')),
        waist: Number(formData.get('waist')),
        hips: Number(formData.get('hips')),
        shoulder: Number(formData.get('shoulder')),
        sleeveLength: Number(formData.get('sleeveLength')),
        neck: Number(formData.get('neck'))
      };

      const response = await fetch(`/api/measurements?customerId=${selectedCustomer._id}&index=${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update measurement');
      }
      
      toast({
        title: 'Success',
        description: 'Measurement updated successfully',
      });
      fetchMeasurements();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const newMeasurement = {
        chest: Number(formData.get('chest')),
        waist: Number(formData.get('waist')),
        hips: Number(formData.get('hips')),
        shoulder: Number(formData.get('shoulder')),
        sleeveLength: Number(formData.get('sleeveLength')),
        neck: Number(formData.get('neck'))
      };

      const response = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomer._id, measurement: newMeasurement }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add measurement');
      }
      
      toast({
        title: 'Success',
        description: 'Measurement added successfully',
      });
      fetchMeasurements();
      e.target.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format key names for display (convert camelCase to Title Case with spaces)
  const formatKeyName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  // Filter and format the display fields
  const getDisplayableFields = (measurement) => {
    // List of fields we want to display (exclude internal properties like _id)
    const displayFields = [
      'chest',
      'waist',
      'hips',
      'shoulder',
      'sleeveLength',
      'neck',
      'date'
    ];
    
    // Create an object with only the fields we want to display
    const displayObject = {};
    displayFields.forEach(field => {
      if (measurement[field] !== undefined) {
        displayObject[field] = measurement[field];
      }
    });
    
    return displayObject;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Customer Measurements</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Measurement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select value={selectedCustomer?._id || ''} onValueChange={(value) => setSelectedCustomer(customers.find(c => c._id === value))}>
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
            {selectedCustomer && (
              <form onSubmit={handleAddMeasurement} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chest</label>
                    <Input type="number" name="chest" step="0.1" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Waist</label>
                    <Input type="number" name="waist" step="0.1" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hips</label>
                    <Input type="number" name="hips" step="0.1" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shoulder</label>
                    <Input type="number" name="shoulder" step="0.1" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sleeve Length</label>
                    <Input type="number" name="sleeveLength" step="0.1" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Neck</label>
                    <Input type="number" name="neck" step="0.1" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Measurement'}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow 
                  key={customer._id} 
                  className={`cursor-pointer hover:bg-muted ${selectedCustomer?._id === customer._id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCustomer(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Measurements for {selectedCustomer.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.map((measurement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Measurement #{index + 1}</h3>
                      <div className="space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Measurement</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => handleEdit(e, index)} className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Chest</label>
                                  <Input
                                    type="number"
                                    name="chest"
                                    step="0.1"
                                    defaultValue={measurement.chest}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Waist</label>
                                  <Input
                                    type="number"
                                    name="waist"
                                    step="0.1"
                                    defaultValue={measurement.waist}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Hips</label>
                                  <Input
                                    type="number"
                                    name="hips"
                                    step="0.1"
                                    defaultValue={measurement.hips}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Shoulder</label>
                                  <Input
                                    type="number"
                                    name="shoulder"
                                    step="0.1"
                                    defaultValue={measurement.shoulder}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Sleeve Length</label>
                                  <Input
                                    type="number"
                                    name="sleeveLength"
                                    step="0.1"
                                    defaultValue={measurement.sleeveLength}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Neck</label>
                                  <Input
                                    type="number"
                                    name="neck"
                                    step="0.1"
                                    defaultValue={measurement.neck}
                                    required
                                  />
                                </div>
                              </div>
                              <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Filter out internal properties and display only relevant fields */}
                      {Object.entries(getDisplayableFields(measurement)).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{formatKeyName(key)}: </span>
                          <span>{key === 'date' ? formatDate(value) : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No measurements found for this customer.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}