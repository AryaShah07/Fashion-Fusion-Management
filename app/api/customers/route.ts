import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import mongoose from 'mongoose';
import { Customer } from '@/lib/models/customer';
import { connectDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    console.log('POST /api/customers called with userId:', userId);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    console.log('Received customer data:', data);

    if (!data.name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    
    // Create customer with required fields
    const customer = new Customer({
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      userId
    });

    // Save the customer
    await customer.save();
    console.log('Customer created successfully:', customer);

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    // Handle specific error cases
    if (error.name === 'ValidationError') {
      return new NextResponse(
        JSON.stringify({
          error: 'Validation Error',
          details: Object.values(error.errors).map((err: any) => err.message)
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (error.code === 11000) {
      return new NextResponse(
        JSON.stringify({
          error: 'Duplicate Error',
          details: 'A customer with this information already exists'
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create customer',
        details: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req: Request) {
  try {
    console.log('GET /api/customers called');
    const { userId } = auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No user ID found, returning unauthorized');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected, fetching customers...');
    
    // Log the raw query
    console.log('Querying customers with userId:', userId);
    const customers = await Customer.find({ userId });
    console.log('Raw MongoDB query result:', customers);
    
    // Check if customers collection exists
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    }
    
    // Check total documents in customers collection
    const count = await Customer.countDocuments();
    console.log('Total customers in database:', count);
    
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Error in GET /api/customers:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}