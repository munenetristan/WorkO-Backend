require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in environment. Please set it in .env.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in environment. Please set it in .env.');
    process.exit(1);
  }
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
