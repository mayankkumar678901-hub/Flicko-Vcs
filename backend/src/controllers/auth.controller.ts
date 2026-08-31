import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { GitService } from '../services/git.service';

const PERSISTENT_FILE = path.resolve(__dirname, '../data/persistent_users.json');
const STORAGE_ROOT = process.env.REPOS_STORAGE_PATH || './repos_storage';

function getPersistentUsers(): any[] {
  try {
    if (fs.existsSync(PERSISTENT_FILE)) {
      return JSON.parse(fs.readFileSync(PERSISTENT_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function savePersistentUser(user: { username: string; email: string; passwordHash: string; avatarUrl?: string }) {
  try {
    const dir = path.dirname(PERSISTENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let list = getPersistentUsers();
    const idx = list.findIndex((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    fs.writeFileSync(PERSISTENT_FILE, JSON.stringify(list, null, 2), 'utf8');
    console.log('💾 User saved to persistent backup:', user.username);
  } catch (err: any) {
    console.error('Failed to save persistent user backup:', err.message);
  }
}

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

      // Fetch users from DB and persistent backups
      const dbUsers = await prisma.user.findMany();
      const backupUsers = getPersistentUsers();

      // Check if email already registered
      const emailExists =
        dbUsers.some((u) => u.email.toLowerCase() === cleanEmail) ||
        backupUsers.some((u) => u.email.toLowerCase() === cleanEmail);

      if (emailExists) {
        return res.status(400).json({ error: 'This email is already registered. Please sign in or use a different email.' });
      }

      // Check if username already taken
      const usernameExists =
        dbUsers.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase()) ||
        backupUsers.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());

      if (usernameExists) {
        return res.status(400).json({ error: 'This username is already taken. Please choose a different username.' });
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

      // Automatically create a starter repository for the new user!
      try {
        const repoName = 'my-first-repo';
        const repoStoragePath = path.resolve(STORAGE_ROOT, cleanUsername, repoName);
        await GitService.initRepository(
          repoStoragePath,
          repoName,
          'Welcome to Flicko! Your first interactive web repository.',
          'main'
        );

        await prisma.repository.create({
          data: {
            name: repoName,
            description: 'Welcome to Flicko! Your first interactive web repository.',
            isPrivate: false,
            defaultBranch: 'main',
            storagePath: repoStoragePath,
            ownerId: user.id,
          },
        });

        // Add starter index.html
        await GitService.commitFileChange(
          repoStoragePath,
          'main',
          'index.html',
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Flicko</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1e293b; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-bottom: 10px; }
    button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Welcome to Flicko, ${cleanUsername}!</h1>
    <p>Your repository is ready. Edit files and see live changes!</p>
    <button onclick="alert('Hello from Flicko!')">Click Me</button>
  </div>
</body>
</html>`,
          'Initial commit: Add starter index.html',
          user.username,
          user.email
        );
        console.log(`✨ Created starter repo for ${cleanUsername}`);
      } catch (repoErr: any) {
        console.error('Failed to create starter repo:', repoErr.message);
      }

      // Backup to persistent storage
      savePersistentUser({
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl || undefined,
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
        return res.status(401).json({ error: 'Invalid credentials. User not found.' });
      }

      const isPasswordValid = await bcrypt.compare(cleanPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
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
          repositories: {
            select: { id: true, name: true, description: true, isPrivate: true, defaultBranch: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
          },
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

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

      const { email, avatarUrl, currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const updateData: any = {};

      if (email && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        const existing = await prisma.user.findFirst({
          where: { email: cleanEmail, NOT: { id: user.id } },
        });
        if (existing) return res.status(400).json({ error: 'This email is already in use by another account.' });
        updateData.email = cleanEmail;
      }

      if (avatarUrl !== undefined && avatarUrl.trim()) {
        updateData.avatarUrl = avatarUrl.trim();
      }

      if (newPassword && newPassword.trim()) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to change password' });
        }
        const isValid = await bcrypt.compare(currentPassword.trim(), user.passwordHash);
        if (!isValid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        updateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: { id: true, username: true, email: true, avatarUrl: true, passwordHash: true, createdAt: true },
      });

      // Update persistent backup
      savePersistentUser({
        username: updatedUser.username,
        email: updatedUser.email,
        passwordHash: updatedUser.passwordHash,
        avatarUrl: updatedUser.avatarUrl || undefined,
      });

      return res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  }
}
