import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import runMigrations from './db/migrate';
import apiRoutes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Enable CORS with support for credentials (cookies)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Mount central router
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Run migrations on startup
runMigrations().then(() => {
  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database and server:', err);
  process.exit(1);
});
