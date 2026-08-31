import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

export interface TreeItem {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  sha?: string;
  size?: number;
}

export interface CommitItem {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  date: string;
}

export interface FileDiff {
  oldPath: string;
  newPath: string;
  status: 'added' | 'deleted' | 'modified';
  additions: number;
  deletions: number;
  diffText: string;
}

export class GitService {
  /**
   * Initializes a new non-bare git repository with an initial commit containing README.md.
   */
  static async initRepository(repoPath: string, repoName: string, description: string, defaultBranch: string = 'main') {
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
    }

    const git: SimpleGit = simpleGit(repoPath);
    await git.init();
    await git.checkoutLocalBranch(defaultBranch);

    // Config user for git operations inside this repository
    await git.addConfig('user.name', 'System Admin');
    await git.addConfig('user.email', 'admin@vcs.local');

    // Create initial README.md
    const readmeContent = `# ${repoName}\n\n${description || 'A new repository created on Mini-VCS platform.'}\n`;
    fs.writeFileSync(path.join(repoPath, 'README.md'), readmeContent, 'utf8');

    await git.add('README.md');
    await git.commit('Initial commit');
  }

  /**
   * Gets list of all branches in the repository.
   */
  static async listBranches(repoPath: string) {
    const git: SimpleGit = simpleGit(repoPath);
    const summary = await git.branchLocal();
    return {
      all: summary.all,
      current: summary.current,
    };
  }

  /**
   * Creates a new branch.
   */
  static async createBranch(repoPath: string, branchName: string, startPoint: string = 'HEAD') {
    const git: SimpleGit = simpleGit(repoPath);
    await git.checkoutBranch(branchName, startPoint);
  }

  /**
   * Deletes a branch.
   */
  static async deleteBranch(repoPath: string, branchName: string) {
    const git: SimpleGit = simpleGit(repoPath);
    await git.deleteLocalBranch(branchName, true);
  }

  /**
   * Lists directory tree at a given git ref (branch/sha) and subPath.
   */
  static async getTree(repoPath: string, ref: string = 'main', subPath: string = ''): Promise<TreeItem[]> {
    const git: SimpleGit = simpleGit(repoPath);
    
    // git ls-tree ref:subPath
    const treeTarget = subPath ? `${ref}:${subPath}` : ref;
    const rawOutput = await git.raw(['ls-tree', '-l', treeTarget]);

    if (!rawOutput) return [];

    const lines = rawOutput.split('\n').filter(line => line.trim() !== '');
    const items: TreeItem[] = lines.map(line => {
      // Format: <mode> <type> <sha> <size> \t <filename>
      // e.g.: 100644 blob 3b18e512db79e4c8300da17290d2358826720d20      12    README.md
      const [meta, name] = line.split('\t');
      const parts = meta.split(/\s+/);
      const mode = parts[0];
      const type = parts[1] === 'tree' ? 'tree' : 'blob';
      const sha = parts[2];
      const sizeStr = parts[3];
      const size = sizeStr !== '-' ? parseInt(sizeStr, 10) : undefined;

      const itemPath = subPath ? `${subPath}/${name}` : name;

      return {
        name,
        path: itemPath,
        type,
        sha,
        size,
      };
    });

    // Sort folders first, then files alphabetically
    return items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'tree' ? -1 : 1;
    });
  }

  /**
   * Retrieves raw content of a file at a given git ref and file path.
   */
  static async getBlob(repoPath: string, ref: string = 'main', filePath: string): Promise<string> {
    const git: SimpleGit = simpleGit(repoPath);
    try {
      const content = await git.show([`${ref}:${filePath}`]);
      return content;
    } catch (err: any) {
      throw new Error(`File not found at ref ${ref}: ${filePath}`);
    }
  }

  /**
   * Creates or updates a file and makes a commit.
   */
  static async commitFileChange(
    repoPath: string,
    ref: string,
    filePath: string,
    content: string,
    commitMessage: string,
    authorName: string,
    authorEmail: string
  ) {
    const git: SimpleGit = simpleGit(repoPath);

    // Switch to target branch/ref
    await git.checkout(ref);

    // Ensure parent directory exists
    const fullPath = path.join(repoPath, filePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Write file content
    fs.writeFileSync(fullPath, content, 'utf8');

    // Stage file
    await git.add(filePath);

    // Commit with custom author
    await git.commit(commitMessage, [filePath], {
      '--author': `"${authorName} <${authorEmail}>"`,
    });
  }

  /**
   * Gets commit history log.
   */
  static async getCommits(repoPath: string, ref: string = 'main', limit: number = 50): Promise<CommitItem[]> {
    const git: SimpleGit = simpleGit(repoPath);
    try {
      const log = await git.log([ref, '-n', `${limit}`]);

      return log.all.map(c => ({
        sha: c.hash,
        shortSha: c.hash.substring(0, 7),
        message: c.message,
        authorName: c.author_name,
        authorEmail: c.author_email,
        date: c.date,
      }));
    } catch (err) {
      return [];
    }
  }

  /**
   * Gets details for a specific commit, including line-by-line file diffs.
   */
  static async getCommitDetail(repoPath: string, sha: string) {
    const git: SimpleGit = simpleGit(repoPath);

    // Get commit metadata
    const log = await git.show([
      '--stat',
      '--patch',
      '--format=format:{"sha":"%H","authorName":"%an","authorEmail":"%ae","date":"%ad","message":"%s"}',
      sha,
    ]);

    // Parse commit metadata json from first line
    const jsonEndIndex = log.indexOf('\n');
    let meta: any = {};
    let patchOutput = log;

    if (jsonEndIndex !== -1) {
      const jsonStr = log.substring(0, jsonEndIndex).trim();
      patchOutput = log.substring(jsonEndIndex + 1);
      try {
        meta = JSON.parse(jsonStr);
      } catch (e) {
        meta = { sha };
      }
    }

    const diffs = this.parseGitPatch(patchOutput);

    return {
      commit: {
        sha: meta.sha || sha,
        shortSha: (meta.sha || sha).substring(0, 7),
        authorName: meta.authorName || 'Unknown',
        authorEmail: meta.authorEmail || '',
        date: meta.date || '',
        message: meta.message || '',
      },
      diffs,
    };
  }

  /**
   * Helper parser for git diff patch output into structured line-by-line diff items.
   */
  private static parseGitPatch(patchText: string): FileDiff[] {
    const fileDiffs: FileDiff[] = [];
    const rawFiles = patchText.split(/^diff --git /m).filter(Boolean);

    for (const rawFile of rawFiles) {
      const lines = rawFile.split('\n');
      const headerLine = lines[0]; // e.g. a/filename b/filename

      let oldPath = '';
      let newPath = '';
      let status: 'added' | 'deleted' | 'modified' = 'modified';

      const match = headerLine.match(/a\/(.+?)\s+b\/(.+)/);
      if (match) {
        oldPath = match[1];
        newPath = match[2];
      }

      let additions = 0;
      let deletions = 0;
      const diffLines: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('new file mode')) {
          status = 'added';
        } else if (line.startsWith('deleted file mode')) {
          status = 'deleted';
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
          additions++;
          diffLines.push(line);
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
          diffLines.push(line);
        } else if (line.startsWith('@@') || line.startsWith(' ')) {
          diffLines.push(line);
        }
      }

      fileDiffs.push({
        oldPath: oldPath || newPath,
        newPath: newPath || oldPath,
        status,
        additions,
        deletions,
        diffText: diffLines.join('\n'),
      });
    }

    return fileDiffs;
  }
}
