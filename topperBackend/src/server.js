require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 4000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`🚀 Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Respawning...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Worker ${process.pid} started - API running on port ${PORT}`);
      });
    } catch (err) {
      console.error(`❌ Worker ${process.pid} failed to start`, err);
      process.exit(1);
    }
  })();
}
