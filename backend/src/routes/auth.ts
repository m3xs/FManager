import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';

const router = Router();
const isProduction = process.env.NODE_ENV === 'production';

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
    const { password } = req.body;

    const provided = Buffer.from(typeof password === 'string' ? password : '');
    const expected = Buffer.from(typeof process.env.AUTH_PASSWORD === 'string' ? process.env.AUTH_PASSWORD : '');

    const passwordsMatch =
        provided.length === expected.length && timingSafeEqual(provided, expected);

    if (passwordsMatch) {
        const token = jwt.sign({ok: true}, process.env.JWT_SECRET!, { expiresIn: '4h' });
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 4 * 60 * 60 * 1000, // 4 hours
            sameSite: 'lax',
            secure: isProduction,
        });
        res.status(200).json({ success: true});
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  });
  res.json({ success: true });
});

export default router;