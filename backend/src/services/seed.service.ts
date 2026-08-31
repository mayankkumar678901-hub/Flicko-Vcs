import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';
import { GitService } from './git.service';

const STORAGE_ROOT = process.env.REPOS_STORAGE_PATH || './repos_storage';

export class SeedService {
  static async ensureSeedData() {
    try {
      console.log('🔄 Checking database seed data...');

      // 1. Ensure User 'mayank' exists
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

      // 2. Ensure Repo 'todo-app' exists
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
}`,
          'feat(logic): add task management functions',
          user.username,
          user.email
        );

        console.log('✅ Auto-restored repo: todo-app');
      }

      // 3. Ensure Repo 'girlfriend-day-surprise' exists
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

        // Copy files from scratch if existing
        const scratchDir = 'C:/Users/Asus/.gemini/antigravity/scratch/girlfriend-day';
        if (fs.existsSync(scratchDir)) {
          const idxHtml = fs.readFileSync(path.join(scratchDir, 'index.html'), 'utf8');
          const stlCss = fs.readFileSync(path.join(scratchDir, 'styles.css'), 'utf8');
          const scrJs = fs.readFileSync(path.join(scratchDir, 'script.js'), 'utf8');

          await GitService.commitFileChange(gfPath, 'main', 'index.html', idxHtml, 'feat: add index.html', user.username, user.email);
          await GitService.commitFileChange(gfPath, 'main', 'styles.css', stlCss, 'style: add styles.css', user.username, user.email);
          await GitService.commitFileChange(gfPath, 'main', 'script.js', scrJs, 'feat: add script.js', user.username, user.email);
        }

        console.log('✅ Auto-restored repo: girlfriend-day-surprise');
      }

      console.log('✨ Database seed data ready!');
    } catch (err: any) {
      console.error('Seed auto-restoration error:', err.message);
    }
  }
}
