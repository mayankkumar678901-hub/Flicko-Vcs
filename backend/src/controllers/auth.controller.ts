import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Check case-insensitive existence across all users
      const allUsers = await prisma.user.findMany();
      const existingUser = allUsers.find(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase() || u.email.toLowerCase() === cleanEmail
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already taken' });
      }

      const passwordHash = await bcrypt.hash(cleanPassword, 10);
      const user = await prisma.user.create({
        data: {
          username: cleanUsername,
          email: cleanEmail,
          passwordHash,
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
        },
      });

      const secret = process.env.JWT_SECRET || 'super-secret-vcs-jwt-key-2026';
      const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({ error: 'Email/Username and password are required' });
      }

      const cleanInput = emailOrUsername.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Fetch all users and compare lowercased for 100% case-insensitivity
      const allUsers = await prisma.user.findMany();
      const user = allUsers.find(
        (u) => u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(cleanPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const secret = process.env.JWT_SECRET || 'super-secret-vcs-jwt-key-2026';
      const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '7d' });

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Login failed' });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
