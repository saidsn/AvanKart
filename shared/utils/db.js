import mongoose from 'mongoose';

const dbname = process.env.DB_NAME || 'avankart';

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? `mongodb://avaadmin:Salamsagol123%21@35.153.85.225:27017/${dbname}?authSource=admin`
        : `mongodb://127.0.0.1:27017/${dbname}`;

    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      heartbeatFrequencyMS: 2000, // Ping the server every 2 seconds
      retryWrites: true, // Retry writes on transient errors
    };

    // Add connection event listeners for debugging
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
      console.log('🔄 Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🟢 Mongoose reconnected to MongoDB');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 Mongoose connection closed through app termination');
      process.exit(0);
    });

    await mongoose.connect(mongoURI, connectionOptions);
    console.log(`✅ MongoDB connected to ${process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'LOCAL'} DB`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState}`);
    console.log(`🏠 Database name: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;