import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VCS API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 VCS Backend Server running on http://localhost:${PORT}`);
});
