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

// Header Banner
doc.rect(0, 0, 595.28, 110).fill('#0F172A');

doc.fillColor('#FFFFFF')
   .fontSize(28)
   .font('Helvetica-Bold')
   .text('FLICKO VCS PLATFORM', 40, 30);

doc.fillColor('#38BDF8')
   .fontSize(14)
   .font('Helvetica')
   .text('Complete Technical Project Documentation & System Architecture', 40, 65);

doc.fillColor('#94A3B8')
   .fontSize(9)
   .text('Generated: August 31, 2026  |  Author: Mayank Kumar  |  Version: 2.0 (AI-Native)', 40, 85);

doc.moveDown(4);

// Section 1: Executive Summary
doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('1. Executive Summary & Purpose');
doc.rect(40, doc.y + 2, 515, 2).fill(primaryColor);
doc.moveDown(0.8);

doc.fillColor(darkText).fontSize(10).font('Helvetica').text(
  'Flicko is an advanced, full-stack Web Version Control System (VCS) designed to provide developers with a modern, high-performance web platform for managing Git repositories. Built with cutting-edge AI integrations and interactive live web execution, Flicko transcends traditional platforms like GitHub by providing automated AI commit message generation, 1-click natural language diff explanations, and sandboxed in-browser web app preview execution.',
  { align: 'justify', lineGap: 3 }
);

doc.moveDown(1.5);

// Section 2: Core Technologies Used
doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('2. Technology Stack & Tools Used');
doc.rect(40, doc.y + 2, 515, 2).fill(primaryColor);
doc.moveDown(0.8);

const techStack = [
  { category: 'Frontend Framework', tech: 'Next.js 14 (App Router), React 18, TypeScript' },
  { category: 'Frontend Styling & UI', tech: 'Tailwind CSS, Lucide React Icons, React Markdown' },
  { category: 'Backend Engine', tech: 'Node.js, Express.js (TypeScript), ts-node-dev' },
  { category: 'Database & ORM', tech: 'Prisma ORM, SQLite / PostgreSQL' },
  { category: 'Version Control Core', tech: 'Native Git CLI, simple-git Engine' },
  { category: 'Security & Auth', tech: 'JSON Web Tokens (JWT), bcryptjs password hashing' },
  { category: 'AI Intelligence', tech: 'Conventional Commit Heuristics & Natural Language Diff Explainer' },
  { category: 'Cloud Infrastructure', tech: 'Vercel (Frontend), Render (Backend), GitHub' }
];

techStack.forEach((item) => {
  doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text(`• ${item.category}: `, { continued: true });
  doc.fillColor(darkText).font('Helvetica').text(item.tech);
  doc.moveDown(0.3);
});

doc.moveDown(1.5);

// Section 3: Distinct Features & Innovation
doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('3. Key Features & Platform Innovations');
doc.rect(40, doc.y + 2, 515, 2).fill(primaryColor);
doc.moveDown(0.8);

const features = [
  { title: '🤖 AI Commit Assistant', desc: 'Analyzes code modifications in real time inside the web editor and auto-suggests structured Conventional Commit titles.' },
  { title: '✨ AI Diff Explainer & Code Reviewer', desc: 'Provides 1-click natural language breakdowns of complex commit diffs, impact rating (Low/Med/High), and reviewer checkpoints.' },
  { title: '▶️ In-Browser Live Web Sandbox Preview', desc: 'Allows users to run HTML/CSS/JS repositories live inside an interactive sandboxed iframe with Desktop, Tablet, and Mobile viewports.' },
  { title: '🛡️ Role-Based Access Control (RBAC)', desc: 'Enforces repository ownership rules. Non-owners get read-only access with locked buttons and API write protection.' },
  { title: '👤 User Profile & Account Settings Manager', desc: 'Includes customizable user avatars, email management, password updates, and repository portfolio stats.' },
  { title: '📜 Chronological Commit Timeline & Diff Viewer', desc: 'Displays detailed commit history logs, SHA hashes, and line-by-line file diffs (+ added, - removed).' }
];

features.forEach((f) => {
  doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold').text(f.title);
  doc.fillColor(darkText).fontSize(9.5).font('Helvetica').text(f.desc, { lineGap: 2 });
  doc.moveDown(0.6);
});

// Page Break for API Documentation & Deployment
doc.addPage();

// Section 4: System Architecture & API Specification
doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('4. REST API Endpoints Specification');
doc.rect(40, doc.y + 2, 515, 2).fill(primaryColor);
doc.moveDown(0.8);

const endpoints = [
  { method: 'POST', path: '/api/auth/register', desc: 'User registration with bcrypt hashing & JWT token issue' },
  { method: 'POST', path: '/api/auth/login', desc: 'Case-insensitive authentication returning JWT session' },
  { method: 'GET', path: '/api/auth/me', desc: 'Fetch current logged in user profile & owned repositories' },
  { method: 'PUT', path: '/api/auth/profile', desc: 'Update email address, avatar URL, or change password' },
  { method: 'GET / POST', path: '/api/repos', desc: 'List public repositories / Create new repository' },
  { method: 'GET', path: '/api/git/:owner/:repo/tree', desc: 'Fetch directory tree structure for branch ref' },
  { method: 'GET', path: '/api/git/:owner/:repo/blob', desc: 'Retrieve raw file content with line numbers' },
  { method: 'POST', path: '/api/git/:owner/:repo/contents', desc: 'Commit file changes directly to repository on disk' },
  { method: 'GET', path: '/api/git/:owner/:repo/commits', desc: 'Fetch commit log timeline for specified branch' },
  { method: 'POST', path: '/api/git/ai/commit-message', desc: 'AI service endpoint for auto-generating commit titles' },
  { method: 'GET', path: '/api/git/:owner/:repo/ai/explain/:sha', desc: 'AI service endpoint for explaining commit diffs' }
];

endpoints.forEach((ep) => {
  doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold').text(`${ep.method} `, { continued: true });
  doc.fillColor(secondaryColor).text(`${ep.path} `, { continued: true });
  doc.fillColor(mutedText).font('Helvetica').text(`- ${ep.desc}`);
  doc.moveDown(0.4);
});

doc.moveDown(1.5);

// Section 5: Live Cloud Deployment & Links
doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('5. Live Cloud Deployment & Links');
doc.rect(40, doc.y + 2, 515, 2).fill(primaryColor);
doc.moveDown(0.8);

doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text('• Live Web Application (Vercel): ', { continued: true });
doc.fillColor(secondaryColor).font('Helvetica').text('https://flicko-vcs.vercel.app');
doc.moveDown(0.4);

doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text('• Live Backend API (Render): ', { continued: true });
doc.fillColor(secondaryColor).font('Helvetica').text('https://mini-github-vcs.onrender.com');
doc.moveDown(0.4);

doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text('• GitHub Source Repository: ', { continued: true });
doc.fillColor(secondaryColor).font('Helvetica').text('https://github.com/mayankkumar678901-hub/Flicko-Vcs');
doc.moveDown(0.4);

doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text('• Local Project Workspace: ', { continued: true });
doc.fillColor(mutedText).font('Helvetica').text('C:\\Users\\Asus\\Desktop\\Flicko-Project');
doc.moveDown(2);

// Footer Signoff
doc.fillColor(mutedText).fontSize(9).font('Helvetica-Oblique').text('Documentation compiled successfully. All project assets, source code, and cloud deployments are active.', { align: 'center' });

doc.end();
console.log('PDF documentation generated successfully at:', pdfPath);
