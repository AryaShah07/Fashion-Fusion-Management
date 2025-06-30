import mongoose from 'mongoose';

type CounterDocument = {
  model: string;
  seq: number;
} & mongoose.Document;

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

// Add a static method to get and increment the counter
counterSchema.static('getNextSequence', async function(model: string) {
  const counter = await this.findOneAndUpdate(
    { model },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
});

export const Counter = mongoose.models.Counter || mongoose.model<CounterDocument>('Counter', counterSchema);