import { connectDB } from '@/lib/db';
import { Counter } from '@/lib/models/counter';

async function resetCounters() {
  try {
    await connectDB();
    await Counter.resetCounter('Customer');
    console.log('Customer counter reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting counters:', error);
    process.exit(1);
  }
}

resetCounters(); 