import { connectDB } from '@/lib/db';
import { Counter } from '@/lib/models/counter';

async function resetCustomerCounter() {
  try {
    await connectDB();
    await Counter.findOneAndUpdate(
      { model: 'Customer' },
      { $set: { seq: 0 } },
      { upsert: true }
    );
    console.log('Customer counter reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting customer counter:', error);
    process.exit(1);
  }
}

resetCustomerCounter(); 