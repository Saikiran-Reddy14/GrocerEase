import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGOURI) {
    throw new Error('MONGOURI environment variable is not set.');
  }
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log('Connected to database');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};
