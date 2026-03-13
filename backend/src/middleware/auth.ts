import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({error: 'Unauthorized'});

    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        next();
    } catch {
        res.status(401).json({error: 'Unauthorized'});
    }
}