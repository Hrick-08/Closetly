import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import closetRoutes from './routes/closet.js';
import outfitsRoutes from './routes/outfits.js';
import searchRoutes from './routes/search.js';
import shopRoutes from './routes/shop.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/closet', closetRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
