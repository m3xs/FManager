import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db';
import { Transaction } from '@fmanager/common';

const router = Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 40 * 1024 * 1024 }, // 40 MB
});

// GET /api/transactions
router.get('/', (req: Request, res: Response) => {
  const { category, from, to, search } = req.query;

  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: unknown[] = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (from) {
    query += ' AND date >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND date <= ?';
    params.push(to);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  const transactions = db.prepare(query).all(...params);
  res.json(transactions);
});

// GET /api/transactions/stats
router.get('/stats', (_req: Request, res: Response) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const thisMonth = (db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM transactions WHERE date LIKE ?"
  ).get(`${currentMonth}%`)) as { total: number; count: number };

  const allTime = (db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions"
  ).get()) as { total: number };

  const byCategory = db.prepare(
    "SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM transactions WHERE date LIKE ? GROUP BY category ORDER BY total DESC"
  ).all(`${currentMonth}%`);

  const recentMonths = db.prepare(`
    SELECT substr(date, 1, 7) as month, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
  `).all();

  res.json({ thisMonth: thisMonth.total, thisMonthCount: thisMonth.count, allTime: allTime.total, byCategory, recentMonths });
});

// GET /api/transactions/:id
router.get('/:id', (req: Request, res: Response) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(tx);
});

// POST /api/transactions
router.post('/', upload.single('receipt'), (req: Request, res: Response) => {
  const { title, amount, category, description, date } = req.body as Record<string, string>;

  if (!title || !amount || !date) {
    return res.status(400).json({ error: 'title, amount, and date are required' });
  }

  const receiptFilename = req.file ? req.file.filename : null;

  const result = db.prepare(`
    INSERT INTO transactions (title, amount, category, description, date, receipt_filename)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, parseFloat(amount), category || 'other', description || null, date, receiptFilename);

  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(tx);
});

// PATCH /api/transactions/:id
router.patch('/:id', upload.single('receipt'), (req: Request, res: Response) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as Transaction | undefined;
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { title, amount, category, description, date} = req.body as Record<string, string>;

  if (!title || !amount || !date) {
    return res.status(400).json({ error: 'title, amount, and date are required' });
  }

  if (req.file) {
    if (tx.receipt_filename) {
      const filePath = path.join(UPLOADS_DIR, tx.receipt_filename || '');
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  const result = db.prepare(`
    UPDATE transactions
    SET title = ?, amount = ?, category = ?, description = ?, date = ?, receipt_filename = ?
    WHERE id = ?
  `).run(title, parseFloat(amount), category || 'other', description || null, date, req.file ? req.file.filename : tx.receipt_filename, req.params.id);

  if (result.changes === 0) {
    return res.status(500).json({ error: 'Failed to update transaction' });
  }

  const updatedTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  res.json(updatedTx);
});


// DELETE /api/transactions/:id
router.delete('/:id', (req: Request, res: Response) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as { receipt_filename?: string } | undefined;
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  if (tx.receipt_filename) {
    const filePath = path.join(UPLOADS_DIR, tx.receipt_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/transactions/:id/receipt
router.get('/:id/receipt', (req: Request, res: Response) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as { receipt_filename?: string } | undefined;
  if (!tx || !tx.receipt_filename) return res.status(404).json({ error: 'No receipt for this transaction' });

  const filePath = path.join(UPLOADS_DIR, tx.receipt_filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Receipt file not found on disk' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${tx.receipt_filename}"`);
  fs.createReadStream(filePath).pipe(res);
});

// DELETE /api/transactions/:id/receipt
router.delete('/:id/receipt', (req: Request, res: Response) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as Transaction | undefined;
  if (!tx || !tx.receipt_filename) return res.status(404).json({ error: 'No receipt for this transaction' });

  const filePath = path.join(UPLOADS_DIR, tx.receipt_filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('UPDATE transactions SET receipt_filename = NULL WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
