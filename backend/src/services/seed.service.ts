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
      console.log('🔄 Checking database seed data & persistent backups...');

      // 1. Restore all users saved in persistent backup
      const backupUsers = getPersistentUsers();
      console.log(`📦 Found ${backupUsers.length} user(s) in persistent backup ledger.`);

      for (const item of backupUsers) {
        try {
          const existing = await prisma.user.findFirst({
            where: { OR: [{ username: item.username }, { email: item.email }] },
          });
          if (!existing) {
            await prisma.user.create({
              data: {
                username: item.username,
                email: item.email,
                passwordHash: item.passwordHash,
                avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.username}`,
              },
            });
            console.log(`✅ Auto-restored user account from backup: ${item.username}`);
          }
        } catch (uErr: any) {
          console.warn(`Could not restore user ${item.username}:`, uErr.message);
        }
      }

      // 2. Ensure default User 'mayank' exists
      let user = await prisma.user.findFirst({
        where: { OR: [{ username: 'mayank' }, { email: 'mayank@example.com' }] },
      });

      if (!user) {
        const passwordHash = await bcrypt.hash('123456', 10);
        user = await prisma.user.create({
          data: {
            username: 'mayank',
            email: 'mayank@example.com',
            passwordHash,
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mayank',
          },
        });
        console.log('✅ Auto-restored default user: mayank');
      }

      // 3. Ensure Repo 'todo-app' exists
      let todoRepo = await prisma.repository.findFirst({
        where: { ownerId: user.id, name: 'todo-app' },
      });

      const todoPath = path.resolve(STORAGE_ROOT, user.username, 'todo-app');

      if (!todoRepo) {
        await GitService.initRepository(todoPath, 'todo-app', 'Todo App test repository for Flicko', 'main');

        todoRepo = await prisma.repository.create({
          data: {
            name: 'todo-app',
            description: 'Todo App test repository for Flicko',
            isPrivate: false,
            defaultBranch: 'main',
            storagePath: todoPath,
            ownerId: user.id,
          },
        });

        // Add seed files for todo-app
        await GitService.commitFileChange(
          todoPath,
          'main',
          'index.html',
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Todo App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <header><h1>📝 My Todo App</h1></header>
    <div class="input-section">
      <input type="text" id="taskInput" placeholder="Add a new task..." />
      <button onclick="addTask()">Add Task</button>
    </div>
    <ul id="taskList" class="task-list"></ul>
  </div>
  <script src="utils.js"></script>
  <script src="app.js"></script>
</body>
</html>`,
          'feat(ui): add index.html structure',
          user.username,
          user.email
        );

        await GitService.commitFileChange(
          todoPath,
          'main',
          'style.css',
          `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; display: flex; justify-content: center; padding: 40px 20px; }
.container { background: white; border-radius: 16px; padding: 30px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
h1 { text-align: center; color: #2d3748; margin-bottom: 20px; }
.input-section { display: flex; gap: 10px; margin-bottom: 20px; }
.input-section input { flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; outline: none; }
.input-section button { padding: 12px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.task-list { list-style: none; }`,
          'style(theme): add gradient styling',
          user.username,
          user.email
        );

        await GitService.commitFileChange(
          todoPath,
          'main',
          'app.js',
          `let tasks = [];
function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: generateId(), text, completed: false });
  input.value = '';
  renderTasks();
}
function toggleTask(id) { tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); renderTasks(); }
function deleteTask(id) { tasks = tasks.filter(t => t.id !== id); renderTasks(); }
function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.style = 'padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;display:flex;gap:10px;';
    li.innerHTML = '<input type="checkbox" ' + (task.completed ? 'checked' : '') + ' onchange="toggleTask(\'' + task.id + '\')" /><span style="' + (task.completed ? 'text-decoration:line-through;color:#aaa' : '') + '">' + task.text + '</span><button onclick="deleteTask(\'' + task.id + '\')" style="margin-left:auto;background:#fed7d7;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;">Delete</button>';
    list.appendChild(li);
  });
}
function generateId() { return Math.random().toString(36).substr(2, 9); }`,
          'feat(logic): add task management functions',
          user.username,
          user.email
        );

        console.log('✅ Auto-restored repo: todo-app');
      }

      // 4. Ensure Repo 'girlfriend-day-surprise' exists
      let gfRepo = await prisma.repository.findFirst({
        where: { ownerId: user.id, name: 'girlfriend-day-surprise' },
      });

      const gfPath = path.resolve(STORAGE_ROOT, user.username, 'girlfriend-day-surprise');

      if (!gfRepo) {
        await GitService.initRepository(gfPath, 'girlfriend-day-surprise', 'Special romantic interactive website for Happy Girlfriend Day', 'main');

        gfRepo = await prisma.repository.create({
          data: {
            name: 'girlfriend-day-surprise',
            description: 'Special romantic interactive website for Happy Girlfriend Day',
            isPrivate: false,
            defaultBranch: 'main',
            storagePath: gfPath,
            ownerId: user.id,
          },
        });

        const gfIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Happy Girlfriend Day ❤️</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #ffe4e6 0%, #f43f5e 100%); font-family: 'Segoe UI', sans-serif; }
    .card { background: rgba(255,255,255,0.95); padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-width: 450px; }
    h1 { color: #e11d48; margin-bottom: 15px; font-size: 28px; }
    p { color: #475569; line-height: 1.6; font-size: 15px; }
    .btn { background: #f43f5e; color: white; border: none; padding: 12px 28px; border-radius: 50px; font-weight: bold; cursor: pointer; transition: transform 0.2s; margin-top: 20px; font-size: 16px; }
    .btn:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 50px; margin-bottom: 10px;">💖</div>
    <h1>Happy Girlfriend Day!</h1>
    <p>You make every single day brighter, sweeter, and more beautiful. Thank you for being the most amazing person!</p>
    <button class="btn" onclick="alert('❤️ You are my favorite person in the whole universe!')">Click for Love 💌</button>
  </div>
</body>
</html>`;

        await GitService.commitFileChange(gfPath, 'main', 'index.html', gfIndexHtml, 'feat: add romantic surprise page', user.username, user.email);

        console.log('✅ Auto-restored repo: girlfriend-day-surprise');
      }

      console.log('✨ Database seed & persistent user backups ready!');
    } catch (err: any) {
      console.error('Seed auto-restoration error:', err.message);
    }
  }
}
