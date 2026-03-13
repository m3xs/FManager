import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
    const { password } = req.body;
    
    if (password === process.env.AUTH_PASSWORD) {
        const token = jwt.sign({ok: true}, process.env.JWT_SECRET!, { expiresIn: '4h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 4 * 60 * 60 * 1000 }); // 4 hours
        res.status(200).json({ success: true});
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
});

export default router;