const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const config = require('./src/config/env');

const PORT = config.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` MeetingMind Backend Server Running      `);
      console.log(` Port: ${PORT}                           `);
      console.log(` Mode: ${config.NODE_ENV}                `);
      console.log(` URL:  http://localhost:${PORT}          `);
      console.log(`=========================================`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection Error: ${err.message}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
