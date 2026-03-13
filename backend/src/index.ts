import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import transactionsRouter from './routes/transactions';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/transactions', authMiddleware, transactionsRouter);

// Serve uploaded files (protected)
app.use('/uploads', authMiddleware, express.static(path.join(__dirname, '..', 'uploads')));

app.listen(PORT, () => {
  console.log(`FManager backend running on http://localhost:${PORT}`);
});
