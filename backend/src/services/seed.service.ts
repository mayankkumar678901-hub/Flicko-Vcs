import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';
import { GitService } from './git.service';
import { getPersistentUsers } from '../controllers/auth.controller';

const STORAGE_ROOT = process.env.REPOS_STORAGE_PATH || './repos_storage';

export class SeedService {
  static async ensureSeedData() {
    try {
      console.log('🔄 Checking database seed data...');

      // Count total users in database
      const totalUsers = await prisma.user.count();

      // If database already has users, DO NOT re-seed or resurrect deleted repositories!
      if (totalUsers > 0) {
        console.log(`✅ Database already has ${totalUsers} user(s). Skipping repo re-seeding (respecting user deletions).`);
        return;
      }

      console.log('🌱 Initial database setup: Seeding initial master account...');

      // 1. Create default User 'mayank' ONLY if DB is completely fresh
      const passwordHash = await bcrypt.hash('123456', 10);
      const user = await prisma.user.create({
        data: {
          username: 'mayank',
          email: 'mayank@example.com',
          passwordHash,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mayank',
        },
      });
      console.log('✅ Created default user: mayank');

      // 2. Create initial starter repo 'my-first-repo'
      const starterPath = path.resolve(STORAGE_ROOT, user.username, 'my-first-repo');
      await GitService.initRepository(
        starterPath,
        'my-first-repo',
        'Welcome to Flicko! Your first interactive web repository.',
        'main'
      );

      await prisma.repository.create({
        data: {
          name: 'my-first-repo',
          description: 'Welcome to Flicko! Your first interactive web repository.',
          isPrivate: false,
          defaultBranch: 'main',
          storagePath: starterPath,
          ownerId: user.id,
        },
      });

      console.log('✨ Initial database seed complete!');
    } catch (err: any) {
      console.error('Seed error:', err.message);
    }
  }
}
