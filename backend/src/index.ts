import express from 'express';
import cors from 'cors';
import path from 'path';
import transactionsRouter from './routes/transactions';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.use('/api/transactions', transactionsRouter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.listen(PORT, () => {
  console.log(`FManager backend running on http://localhost:${PORT}`);
});
