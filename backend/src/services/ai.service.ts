export interface CommitMessageSuggestion {
  title: string;
  type: string;
  scope?: string;
  description: string;
}

export interface DiffExplanation {
  summary: string;
  keyChanges: string[];
  impactLevel: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

export class AIService {
  /**
   * Intelligently generates conventional commit messages based on file paths and content changes.
   */
  static generateCommitMessage(filePath: string, content: string, oldContent?: string): CommitMessageSuggestion {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const filename = filePath.split('/').pop() || filePath;
    const lowerContent = content.toLowerCase();

    // Check if new file vs modified
    const isNew = !oldContent;

    // Detect feature types
    let type = 'feat';
    let scope = filename.replace(/\.[^/.]+$/, '');
    let description = '';

    if (isNew) {
      if (filename.toLowerCase().includes('readme')) {
        return {
          type: 'docs',
          scope: 'readme',
          title: 'docs: add project documentation and setup guide',
          description: 'Added initial README with feature overview and instructions.',
        };
      }
      if (ext === 'css' || ext === 'scss') {
        return {
          type: 'style',
          scope: 'ui',
          title: `style(${scope}): add styling and theme layout for ${filename}`,
          description: `Created new stylesheet with component styles and responsive design.`,
        };
      }
      if (ext === 'html') {
        return {
          type: 'feat',
          scope: 'ui',
          title: `feat(${scope}): create initial markup and UI structure`,
          description: `Added main HTML layout with interactive elements and asset links.`,
        };
      }
      return {
        type: 'feat',
        scope,
        title: `feat(${scope}): add initial ${filename} implementation`,
        description: `Created new module ${filename} with core logic.`,
      };
    }

    // Heuristics for updates/fixes
    if (lowerContent.includes('try {') || lowerContent.includes('catch') || lowerContent.includes('error') || lowerContent.includes('validate') || lowerContent.includes('alert(')) {
      type = 'fix';
      description = `Added input validation, error handling, or bug resolutions in ${filename}.`;
    } else if (lowerContent.includes('function') || lowerContent.includes('const') || lowerContent.includes('export')) {
      type = 'feat';
      description = `Updated logic and functions within ${filename}.`;
    } else if (ext === 'css') {
      type = 'style';
      description = `Refined color schemes, layouts, and typography in ${filename}.`;
    } else {
      type = 'refactor';
      description = `Updated and cleaned up ${filename}.`;
    }

    const title = `${type}(${scope}): ${description.toLowerCase().replace(/\.$/, '')}`;

    return {
      title,
      type,
      scope,
      description,
    };
  }

  /**
   * Generates a plain-English explanation of file diffs in a commit.
   */
  static explainDiff(commitMessage: string, diffs: any[]): DiffExplanation {
    const fileCount = diffs.length;
    let totalAdditions = 0;
    let totalDeletions = 0;
    const keyChanges: string[] = [];

    diffs.forEach(d => {
      totalAdditions += d.additions || 0;
      totalDeletions += d.deletions || 0;

      const path = d.newPath || d.oldPath;
      if (d.status === 'added') {
        keyChanges.push(`Created **${path}** with initial implementation (+${d.additions} lines).`);
      } else if (d.status === 'deleted') {
        keyChanges.push(`Removed deprecated file **${path}** (-${d.deletions} lines).`);
      } else {
        keyChanges.push(`Modified **${path}** (+${d.additions} additions, -${d.deletions} deletions).`);
      }
    });

    let impactLevel: 'low' | 'medium' | 'high' = 'low';
    if (fileCount > 4 || totalAdditions + totalDeletions > 150) {
      impactLevel = 'high';
    } else if (fileCount > 1 || totalAdditions + totalDeletions > 30) {
      impactLevel = 'medium';
    }

    const summary = `This commit ${commitMessage.toLowerCase().startsWith('add') || commitMessage.toLowerCase().startsWith('create') ? 'introduces' : 'updates'} changes across **${fileCount} file${fileCount !== 1 ? 's' : ''}** with **${totalAdditions} additions** and **${totalDeletions} deletions**.`;

    const suggestions = [
      totalDeletions > 0 ? 'Ensure deleted lines do not break dependent imports or functions.' : 'Verify unit tests cover newly introduced logic.',
      'Check responsive layout styling across desktop and mobile devices.',
    ];

    return {
      summary,
      keyChanges,
      impactLevel,
      suggestions,
    };
  }
}
