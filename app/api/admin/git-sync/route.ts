import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';

const execPromise = promisify(exec);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Shan0h';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Nihongo-Language';
const GITHUB_PREVIEW_REPO = process.env.GITHUB_PREVIEW_REPO || 'Nihongo-Language-Preview';

async function isGitCliAvailable(): Promise<boolean> {
  try {
    await execPromise('git --version');
    return true;
  } catch {
    return false;
  }
}

async function runGit(command: string) {
  return await execPromise(command, { cwd: process.cwd() });
}

// GitHub REST API helper to get current file SHA (if exists)
async function getGitHubFileSha(owner: string, repo: string, filePath: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=main`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Nihongo-Language-App',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha || null;
    }
  } catch (err) {
    console.warn(`Could not get SHA for ${filePath} in ${owner}/${repo}:`, err);
  }
  return null;
}

// GitHub REST API helper to commit/update a single file
async function commitFileToGitHub(
  owner: string,
  repo: string,
  filePath: string,
  contentBase64: string,
  message: string,
  token: string
): Promise<{ success: boolean; commitSha?: string; commitUrl?: string; error?: string }> {
  try {
    const existingSha = await getGitHubFileSha(owner, repo, filePath, token);

    const payload: Record<string, any> = {
      message,
      content: contentBase64,
      branch: 'main',
    };
    if (existingSha) {
      payload.sha = existingSha;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nihongo-Language-App',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || `GitHub API error ${res.status}` };
    }

    return {
      success: true,
      commitSha: data.commit?.sha?.substring(0, 7) || 'updated',
      commitUrl: data.commit?.html_url,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error reaching GitHub' };
  }
}

export async function GET() {
  const gitAvailable = await isGitCliAvailable();

  // If local git CLI is available (e.g. running on localhost)
  if (gitAvailable) {
    try {
      const { stdout: statusOutput } = await runGit('git status --porcelain');
      const { stdout: branchOutput } = await runGit('git branch --show-current');
      const { stdout: lastCommitOutput } = await runGit('git log -1 --format="%h - %s (%cr)"');

      const lines = statusOutput
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const questionOrImageChanges = lines.filter(
        (l) => l.includes('public/images/') || l.includes('data/')
      );

      return NextResponse.json({
        success: true,
        environment: 'local',
        hasChanges: lines.length > 0,
        hasQuestionChanges: questionOrImageChanges.length > 0,
        changedFiles: lines,
        branch: branchOutput.trim() || 'main',
        lastCommit: lastCommitOutput.trim(),
        hasToken: !!GITHUB_TOKEN,
      });
    } catch (error: any) {
      console.warn('Local git status error:', error);
    }
  }

  // Running on Vercel / serverless (no local git CLI)
  try {
    let lastCommit = 'Vercel Serverless Production';
    let branch = 'main';

    if (GITHUB_TOKEN) {
      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/main`, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'Nihongo-Language-App',
          },
          next: { revalidate: 60 },
        });
        if (res.ok) {
          const commitData = await res.json();
          const shortSha = commitData.sha ? commitData.sha.substring(0, 7) : 'head';
          const msg = commitData.commit?.message?.split('\n')[0] || '';
          lastCommit = `${shortSha} - ${msg}`;
        }
      } catch (err) {
        console.warn('Failed to fetch commit from GitHub API:', err);
      }
    }

    return NextResponse.json({
      success: true,
      environment: 'vercel-serverless',
      hasChanges: false,
      hasQuestionChanges: false,
      changedFiles: [],
      branch,
      lastCommit,
      hasToken: !!GITHUB_TOKEN,
      message: GITHUB_TOKEN
        ? 'GitHub Cloud Sync is active and ready.'
        : 'GITHUB_TOKEN not yet configured in Vercel environment variables.',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      environment: 'vercel-serverless',
      hasChanges: false,
      branch: 'main',
      lastCommit: 'Serverless Deployment',
      hasToken: !!GITHUB_TOKEN,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    let customMessage = 'Sync questions and assets from Admin portal';
    let questionsPayload: any = null;
    let uploadedFiles: Array<{ path: string; contentBase64: string }> = [];

    try {
      const body = await request.json();
      if (body?.message) customMessage = body.message;
      if (body?.questions) questionsPayload = body.questions;
      if (Array.isArray(body?.uploadedFiles)) uploadedFiles = body.uploadedFiles;
    } catch {
      // Body may be empty
    }

    const gitAvailable = await isGitCliAvailable();

    // ==========================================
    // PATH A: GitHub REST API (Preferred on Vercel or when GITHUB_TOKEN is set)
    // ==========================================
    if (GITHUB_TOKEN) {
      let questionsJsonContent = '';

      if (questionsPayload && Array.isArray(questionsPayload)) {
        questionsJsonContent = JSON.stringify(questionsPayload, null, 2) + '\n';
      } else {
        // Read from local filesystem if available
        try {
          const filePath = path.join(process.cwd(), 'data', 'questions.json');
          questionsJsonContent = await fs.readFile(filePath, 'utf-8');
        } catch (err) {
          console.warn('Could not read local questions.json:', err);
        }
      }

      if (!questionsJsonContent) {
        return NextResponse.json(
          { success: false, error: 'No questions data provided to sync.' },
          { status: 400 }
        );
      }

      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const commitMsg = `admin: ${customMessage} [${timestamp}]`;
      const base64Content = Buffer.from(questionsJsonContent, 'utf-8').toString('base64');

      const targetRepos = [
        { owner: GITHUB_OWNER, repo: GITHUB_REPO, name: 'origin' },
        ...(GITHUB_PREVIEW_REPO && GITHUB_PREVIEW_REPO !== GITHUB_REPO
          ? [{ owner: GITHUB_OWNER, repo: GITHUB_PREVIEW_REPO, name: 'preview' }]
          : []),
      ];

      const pushedRemotes: string[] = [];
      const pushErrors: string[] = [];
      let latestCommitHash = '';

      for (const target of targetRepos) {
        // 1. Commit questions.json
        const res = await commitFileToGitHub(
          target.owner,
          target.repo,
          'data/questions.json',
          base64Content,
          commitMsg,
          GITHUB_TOKEN
        );

        if (res.success) {
          pushedRemotes.push(`${target.owner}/${target.repo}`);
          if (res.commitSha) latestCommitHash = res.commitSha;

          // 2. Commit any uploaded image files
          for (const file of uploadedFiles) {
            if (file.path && file.contentBase64) {
              await commitFileToGitHub(
                target.owner,
                target.repo,
                file.path,
                file.contentBase64,
                `admin: upload asset ${file.path} [${timestamp}]`,
                GITHUB_TOKEN
              );
            }
          }
        } else {
          pushErrors.push(`${target.name} (${target.owner}/${target.repo}): ${res.error}`);
        }
      }

      const isOverallSuccess = pushedRemotes.length > 0;
      return NextResponse.json({
        success: isOverallSuccess,
        mode: 'github-api',
        commitHash: latestCommitHash,
        pushedRemotes,
        pushErrors,
        message: isOverallSuccess
          ? `Successfully committed (${latestCommitHash}) via GitHub Cloud API to ${pushedRemotes.join(', ')}! Vercel will automatically redeploy.`
          : `Failed to commit via GitHub API: ${pushErrors.join('; ')}`,
      });
    }

    // ==========================================
    // PATH B: Local Git CLI (Only when running on machine with git installed)
    // ==========================================
    if (gitAvailable) {
      // 1. Stage changes in data and public/images
      await runGit('git add data/ public/images/');

      let hasStaged = false;
      try {
        await runGit('git diff --cached --quiet');
        hasStaged = false;
      } catch {
        hasStaged = true;
      }

      let commitHash = '';
      if (hasStaged) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const commitMsg = `admin: ${customMessage} [${timestamp}]`;
        await runGit(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
        const { stdout: hashOut } = await runGit('git rev-parse --short HEAD');
        commitHash = hashOut.trim();
      } else {
        const { stdout: hashOut } = await runGit('git rev-parse --short HEAD');
        commitHash = hashOut.trim();
      }

      const { stdout: remotesOut } = await runGit('git remote');
      const remotes = remotesOut
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const pushedRemotes: string[] = [];
      const pushErrors: string[] = [];

      if (remotes.includes('origin')) {
        try {
          await runGit('git push origin main');
          pushedRemotes.push('origin/main');
        } catch (err: any) {
          console.error('Push to origin failed:', err);
          pushErrors.push(`origin: ${err.message || 'Push failed'}`);
        }
      }

      if (remotes.includes('preview')) {
        try {
          await runGit('git push preview main');
          pushedRemotes.push('preview/main');
        } catch (err: any) {
          console.error('Push to preview failed:', err);
          pushErrors.push(`preview: ${err.message || 'Push failed'}`);
        }
      }

      return NextResponse.json({
        success: pushErrors.length === 0,
        mode: 'local-git',
        committed: hasStaged,
        commitHash,
        pushedRemotes,
        pushErrors,
        message: hasStaged
          ? `Successfully committed (${commitHash}) and pushed to ${pushedRemotes.join(', ')}!`
          : `Already up to date. Verified on ${pushedRemotes.join(', ')}.`,
      });
    }

    // ==========================================
    // PATH C: Running on Vercel without GITHUB_TOKEN
    // ==========================================
    return NextResponse.json(
      {
        success: false,
        isVercel: true,
        needsToken: true,
        error:
          'Direct git commands cannot run in Vercel serverless functions. To enable 1-click cloud sync, please add GITHUB_TOKEN in your Vercel Project Settings > Environment Variables, or use the "Export JSON" button to download your changes.',
      },
      { status: 200 } // Return 200 so UI can gracefully handle and display helpful setup modal
    );
  } catch (error: any) {
    console.error('Git sync route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to GitHub' },
      { status: 500 }
    );
  }
}
