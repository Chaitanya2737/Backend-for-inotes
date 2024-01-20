// db.js

const mongoose = require('mongoose');

const connectToMongo = async () => {
  try {
    const mongoURI = 'mongodb://127.0.0.1:27017/employees';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Handle the error appropriately
  }
};

module.exports = connectToMongo;
