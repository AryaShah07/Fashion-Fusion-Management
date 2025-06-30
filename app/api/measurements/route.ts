import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Customer } from '@/lib/models/customer';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { customerId, measurement } = await req.json();
    if (!customerId || !measurement) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate measurement fields
    const requiredFields = ['chest', 'waist', 'hips', 'sleeveLength', 'shoulder', 'neck'];
    for (const field of requiredFields) {
      if (typeof measurement[field] !== 'number') {
        return new NextResponse(`Invalid or missing ${field} measurement`, { status: 400 });
      }
    }

    await connectDB();

    // Try to find by MongoDB _id first, then by customerID if that fails
    let customer = await Customer.findOne({ _id: customerId, userId });
    
    // If not found by _id, try to find by customerID
    if (!customer) {
      customer = await Customer.findOne({ customerID: parseInt(customerId), userId });
    }
    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    customer.measurements.push(measurement);
    await customer.save();

    return NextResponse.json(customer.measurements[customer.measurements.length - 1]);
  } catch (error) {
    console.error('Error in measurements POST:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    if (!customerId) {
      return new NextResponse('Customer ID is required', { status: 400 });
    }

    await connectDB();

    // Try to find by MongoDB _id first, then by customerID if that fails
    let customer = await Customer.findOne({ _id: customerId, userId });
    
    // If not found by _id, try to find by customerID
    if (!customer) {
      customer = await Customer.findOne({ customerID: parseInt(customerId), userId });
    }
    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    return NextResponse.json(customer.measurements);
  } catch (error) {
    console.error('Error in measurements GET:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const index = url.searchParams.get('index');
    if (!customerId || index === null) {
      return new NextResponse('Customer ID and index are required', { status: 400 });
    }

    const { measurements } = await req.json();
    if (!measurements) {
      return new NextResponse('Measurements data is required', { status: 400 });
    }

    await connectDB();

    // Try to find by MongoDB _id first, then by customerID if that fails
    let customer = await Customer.findOne({ _id: customerId, userId });
    
    // If not found by _id, try to find by customerID
    if (!customer) {
      customer = await Customer.findOne({ customerID: parseInt(customerId), userId });
    }
    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    customer.measurements[parseInt(index)] = measurements;
    await customer.save();

    return NextResponse.json(customer.measurements[parseInt(index)]);
  } catch (error) {
    console.error('Error in measurements PUT:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const index = url.searchParams.get('index');
    if (!customerId || index === null) {
      return new NextResponse('Customer ID and index are required', { status: 400 });
    }

    await connectDB();

    // Try to find by MongoDB _id first, then by customerID if that fails
    let customer = await Customer.findOne({ _id: customerId, userId });
    
    // If not found by _id, try to find by customerID
    if (!customer) {
      customer = await Customer.findOne({ customerID: parseInt(customerId), userId });
    }
    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    customer.measurements.splice(parseInt(index), 1);
    await customer.save();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in measurements DELETE:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}