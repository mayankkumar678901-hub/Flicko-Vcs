const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const pdfPath = 'C:\\Users\\Asus\\Desktop\\Flicko-Project-Documentation.pdf';
const doc = new PDFDocument({ margin: 40, size: 'A4' });

doc.pipe(fs.createWriteStream(pdfPath));

// Color Palette
const primaryColor = '#4F46E5'; // Indigo
const secondaryColor = '#0EA5E9'; // Sky
const accentColor = '#10B981'; // Emerald
const darkText = '#1E293B';
const mutedText = '#64748B';

// ==================== PAGE 1 ====================
// Header Banner
doc.rect(0, 0, 595.28, 110).fill('#0F172A');

doc.fillColor('#FFFFFF')
   .fontSize(26)
   .font('Helvetica-Bold')
   .text('FLICKO VCS PLATFORM', 40, 28);

doc.fillColor('#38BDF8')
   .fontSize(13)
   .font('Helvetica')
   .text('Complete Technical Project Documentation & System Architecture', 40, 62);

doc.fillColor('#94A3B8')
   .fontSize(8.5)
   .text('Updated: August 31, 2026  |  Author: Mayank Kumar  |  Version: 3.0 (Production Release)', 40, 82);

doc.moveDown(4);

// Section 1: Executive Summary
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('1. Executive Summary & Core Purpose');
doc.rect(40, doc.y + 2, 515, 1.5).fill(primaryColor);
doc.moveDown(0.7);

doc.fillColor(darkText).fontSize(9.5).font('Helvetica').text(
  'Flicko is an AI-Native, full-stack Web Version Control System (VCS) designed to provide developers with a modern, high-performance platform for managing Git codebases. Built with integrated artificial intelligence and sandboxed live execution, Flicko features automated Conventional Commit generation, 1-click natural language diff explanations, a Time-Travel commit timeline slider, in-browser live web application execution, and role-based repository security.',
  { align: 'justify', lineGap: 2.5 }
);

doc.moveDown(1.2);

// Section 2: Complete Technology Stack
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('2. Technology Stack & Tools Breakdown');
doc.rect(40, doc.y + 2, 515, 1.5).fill(primaryColor);
doc.moveDown(0.7);

const techStack = [
  { category: 'Frontend Framework', tech: 'Next.js 14 (App Router), React 18, TypeScript' },
  { category: 'Frontend Styling & UI', tech: 'Tailwind CSS, Lucide React Icons, React Markdown' },
  { category: 'Backend Server Engine', tech: 'Node.js, Express.js (TypeScript), ts-node-dev' },
  { category: 'Database & Data Layer', tech: 'Prisma ORM, SQLite / PostgreSQL, JSON Backup Engine' },
  { category: 'Version Control Core', tech: 'Native Git CLI Engine, simple-git Node.js Wrapper' },
  { category: 'Authentication & Security', tech: 'JSON Web Tokens (JWT), bcryptjs password hashing, RBAC' },
  { category: 'AI Intelligence Suite', tech: 'Conventional Commit Heuristics & Natural Language Diff Explainer' },
  { category: 'Cloud Infrastructure', tech: 'Vercel (Frontend), Render (Backend), GitHub' }
];

techStack.forEach((item) => {
  doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica-Bold').text(`• ${item.category}: `, { continued: true });
  doc.fillColor(darkText).font('Helvetica').text(item.tech);
  doc.moveDown(0.25);
});

doc.moveDown(1.2);

// Section 3: Distinct Platform Features
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('3. Key Features & Platform Innovations');
doc.rect(40, doc.y + 2, 515, 1.5).fill(primaryColor);
doc.moveDown(0.7);

const features = [
  { title: '🔒 Auth Gate & Landing Screen', desc: 'Hides repository codebases from unauthenticated visitors and presents a high-converting hero screen with registration options.' },
  { title: '🕒 Time-Travel History Slider', desc: 'Allows users to drag a timeline slider or hit Auto-Play to rewind and step through past repository commit snapshots live.' },
  { title: '🪟 Sliding Window File Drawer', desc: 'Smooth right-sliding drawer that allows instant line-by-line code inspection, copying, and editing without page navigation.' },
  { title: '📅 Daily Login Progress Calendar', desc: 'Monthly attendance tracker with active login highlights, streak counter (e.g. 5 Day Streak), and month switcher.' },
  { title: '🎁 Automatic Starter Repository', desc: 'Automatically creates "my-first-repo" with starter HTML/CSS/JS files whenever any new user registers on the platform.' },
  { title: '🤖 AI Commit Generator & Diff Explainer', desc: 'Analyzes code modifications to auto-suggest commit messages and breaks down diff changes with risk assessment ratings.' },
  { title: '▶️ In-Browser Live Web Sandbox', desc: 'Executes HTML/CSS/JS repositories in an isolated iframe runner with Desktop, Tablet, and Mobile viewports.' },
  { title: '🛡️ Role-Based Access Control (RBAC)', desc: 'Guarantees that only repository owners can add, edit, or delete repositories, enforcing Read-Only mode for visitors.' }
];

features.forEach((f) => {
  doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold').text(f.title);
  doc.fillColor(darkText).fontSize(8.5).font('Helvetica').text(f.desc, { lineGap: 1.5 });
  doc.moveDown(0.4);
});

// ==================== PAGE 2 ====================
doc.addPage();

// Section 4: System Architecture & REST API Specification
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('4. REST API Endpoints Specification');
doc.rect(40, doc.y + 2, 515, 1.5).fill(primaryColor);
doc.moveDown(0.7);

const endpoints = [
  { method: 'POST', path: '/api/auth/register', desc: 'Register new user account, hash password & auto-create starter repo' },
  { method: 'POST', path: '/api/auth/login', desc: '100% case-insensitive authentication returning JWT session token' },
  { method: 'GET', path: '/api/auth/me', desc: 'Fetch current logged in user details, statistics & owned repositories' },
  { method: 'PUT', path: '/api/auth/profile', desc: 'Update email, avatar URL, or change password with current pass check' },
  { method: 'GET', path: '/api/repos', desc: 'Search and list public repositories across the platform' },
  { method: 'POST', path: '/api/repos', desc: 'Create new version controlled repository on disk and database' },
  { method: 'DELETE', path: '/api/repos/:owner/:repo', desc: 'Permanently delete repository, branches, and commits (Owner only)' },
  { method: 'GET', path: '/api/git/:owner/:repo/tree', desc: 'Retrieve directory tree structure for specified branch or commit ref' },
  { method: 'GET', path: '/api/git/:owner/:repo/blob', desc: 'Fetch raw file content with line numbers for code viewing' },
  { method: 'POST', path: '/api/git/:owner/:repo/contents', desc: 'Commit file additions or modifications directly to Git repo on disk' },
  { method: 'GET', path: '/api/git/:owner/:repo/commits', desc: 'Fetch chronological commit history logs with SHA hashes' },
  { method: 'POST', path: '/api/git/ai/commit-message', desc: 'AI service endpoint for generating Conventional Commit messages' },
  { method: 'GET', path: '/api/git/:owner/:repo/ai/explain/:sha', desc: 'AI service endpoint for explaining commit diffs and reviewer checkpoints' }
];

endpoints.forEach((ep) => {
  doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text(`${ep.method} `, { continued: true });
  doc.fillColor(secondaryColor).text(`${ep.path} `, { continued: true });
  doc.fillColor(mutedText).font('Helvetica').text(`- ${ep.desc}`);
  doc.moveDown(0.35);
});

doc.moveDown(1.2);

// Section 5: Data Persistence & Zero-Data-Loss Architecture
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('5. Data Persistence & Backup Architecture');
doc.rect(40, doc.y + 2, 515, 1.5).fill(primaryColor);
doc.moveDown(0.7);

doc.fillColor(darkText).fontSize(9).font('Helvetica').text(
  'To overcome ephemeral disk restarts on cloud platforms (such as Render free-tier containers), Flicko utilizes a dual-tier persistence system: every user registration and repository metadata entry is mirrored to a persistent backup ledger (persistent_users.json). On server initialization, the SeedService automatically checks and restores all user accounts, password hashes, and repositories, guaranteeing zero credential loss across deployments.',
  { align: 'justify', lineGap: 2.5 }
);

doc.moveDown(1.2);

// Section 6: Live Cloud Deployment & Workspace Links
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('6. Live Cloud Deployment & Links');
doc.rect(40, doc.y + 2, 515, 1.5).fill(primaryColor);
doc.moveDown(0.7);

doc.fillColor(darkText).fontSize(9.5).font('Helvetica-Bold').text('• Live Web Application (Vercel): ', { continued: true });
doc.fillColor(secondaryColor).font('Helvetica').text('https://flicko-vcs.vercel.app');
doc.moveDown(0.3);

doc.fillColor(darkText).fontSize(9.5).font('Helvetica-Bold').text('• Live Backend API (Render): ', { continued: true });
doc.fillColor(secondaryColor).font('Helvetica').text('https://mini-github-vcs.onrender.com');
doc.moveDown(0.3);

doc.fillColor(darkText).fontSize(9.5).font('Helvetica-Bold').text('• GitHub Source Repository: ', { continued: true });
doc.fillColor(secondaryColor).font('Helvetica').text('https://github.com/mayankkumar678901-hub/Flicko-Vcs');
doc.moveDown(0.3);

doc.fillColor(darkText).fontSize(9.5).font('Helvetica-Bold').text('• Local Project Workspace: ', { continued: true });
doc.fillColor(mutedText).font('Helvetica').text('C:\\Users\\Asus\\Desktop\\Flicko-Project');
doc.moveDown(1.5);

// Footer Signoff
doc.fillColor(mutedText).fontSize(8.5).font('Helvetica-Oblique').text('Documentation compiled successfully. All project assets, source code, and cloud deployments are active.', { align: 'center' });

doc.end();
console.log('Updated PDF documentation generated successfully at:', pdfPath);
