# Mini-VCS: Full-Stack Web-based Version Control System

A modern, full-stack web-based Version Control System (mini-GitHub/Gitea clone) featuring repository management, directory file tree navigation, syntax-highlighted code preview, in-browser file editing and committing, branch management, commit log timelines, and structured line-by-line file diff viewing.

---

## 🌟 Key Features

- 📁 **Repository Management**: Create, list, search, view, and delete public & private repositories.
- 🌿 **Branch System**: List, create new branches from any ref, and delete branches.
- 🌳 **Directory File Tree**: Navigate folder hierarchies with size & file type icons.
- 📄 **Code Viewer**: Syntax-highlighted code preview with line numbers and one-click copy.
- ✏️ **In-Browser File Editor**: Create or edit files directly in the browser and commit changes with custom commit messages.
- 📜 **Commit Timeline**: Chronological log of commit messages, author details, dates, and 7-character commit SHA badges.
- 🔍 **Line-by-Line Diff Viewer**: Visual diff inspector for each commit showing changed files, additions (`+` green lines), and deletions (`-` red lines).
- 📖 **README Renderer**: Automatic rendering of repository `README.md` markdown files.
- 🔐 **Authentication**: User registration and login powered by JWT & bcrypt hashing.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, `simple-git` (Git CLI engine wrapper), Prisma ORM (SQLite / PostgreSQL).
- **Frontend**: Next.js 14 (React), Tailwind CSS, Lucide React icons, Axios, React Markdown.
- **Storage**: Local filesystem managing bare Git repositories (`repos_storage/`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js**: v18.0.0 or higher
- **Git**: v2.20.0 or higher

---

### 2. Backend Setup & Startup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the Database (Prisma SQLite):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the Backend Development Server:
   ```bash
   npm run dev
   ```
   *The API server will run at [http://localhost:5000](http://localhost:5000)*

---

### 3. Frontend Setup & Startup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js Frontend Server:
   ```bash
   npm run dev
   ```
   *The Web UI will be accessible at [http://localhost:3000](http://localhost:3000)*

---

## 🔌 Backend API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user |
| `/api/auth/login` | `POST` | Authenticate user & get JWT token |
| `/api/auth/me` | `GET` | Get current user profile |
| `/api/repos` | `GET` | List all public repositories |
| `/api/repos` | `POST` | Create a new repository |
| `/api/repos/:owner/:repo` | `GET` | Get repository metadata |
| `/api/repos/:owner/:repo` | `DELETE` | Delete repository & storage |
| `/api/git/:owner/:repo/branches` | `GET` | List all branches |
| `/api/git/:owner/:repo/branches` | `POST` | Create a new branch |
| `/api/git/:owner/:repo/branches/:branch` | `DELETE` | Delete a branch |
| `/api/git/:owner/:repo/tree` | `GET` | Get directory file tree at ref & path |
| `/api/git/:owner/:repo/blob` | `GET` | Get raw file content |
| `/api/git/:owner/:repo/contents` | `POST` | Create/edit file & commit to branch |
| `/api/git/:owner/:repo/commits` | `GET` | Get commit history log |
| `/api/git/:owner/:repo/commit/:sha` | `GET` | Get commit details & structured diffs |

---

## 📂 Project Directory Structure

```
mini-github-vcs/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # User & Repository models
│   ├── src/
│   │   ├── config/             # Database connection
│   │   ├── controllers/        # Auth, Repo, Git controllers
│   │   ├── middleware/         # Auth JWT middleware
│   │   ├── services/           # GitService simple-git wrapper
│   │   ├── routes/             # Express API routes
│   │   └── index.ts            # Server entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # CodeViewer, DiffViewer, FileTree, Navbar, etc.
│   │   └── lib/                # Axios API client
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```
