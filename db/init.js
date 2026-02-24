// db/init.js

// Database initialization code for multi-agent blackjack system
const mongoose = require('mongoose');

const dbURI = 'mongodb://localhost:27017/blackjack'; // Your MongoDB URI here

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;