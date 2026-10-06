const mongoose = require('mongoose');
const config = require('./env');

let memoryServerInstance = null;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`Primary MongoDB connection failed (${primaryErr.message}).`);
    console.log(`Attempting in-memory MongoDB fallback for smooth local execution...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB In-Memory Server Connected: ${memoryUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error(`MongoDB connection failed completely: ${fallbackErr.message}`);
      console.error(`Please verify your MONGODB_URI in server/.env`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
