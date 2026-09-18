import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runGit(command: string) {
  return await execPromise(command, { cwd: process.cwd() });
}

export async function GET() {
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
      hasChanges: lines.length > 0,
      hasQuestionChanges: questionOrImageChanges.length > 0,
      changedFiles: lines,
      branch: branchOutput.trim(),
      lastCommit: lastCommitOutput.trim(),
    });
  } catch (error: any) {
    console.error('Git status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to inspect Git status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let customMessage = 'Sync questions and assets from Admin portal';
    try {
      const body = await request.json();
      if (body?.message) {
        customMessage = body.message;
      }
    } catch {
      // Body may be empty, use default
    }

    // 1. Stage changes in data and public/images (or all changes)
    await runGit('git add data/ public/images/');

    // Check if there are staged changes
    let hasStaged = false;
    try {
      await runGit('git diff --cached --quiet');
      // If code 0, no changes staged
      hasStaged = false;
    } catch {
      // If non-zero exit code, changes exist
      hasStaged = true;
    }

    let commitHash = '';
    if (hasStaged) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const commitMsg = `admin: ${customMessage} [${timestamp}]`;
      const { stdout: commitOut } = await runGit(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
      const { stdout: hashOut } = await runGit('git rev-parse --short HEAD');
      commitHash = hashOut.trim();
    } else {
      const { stdout: hashOut } = await runGit('git rev-parse --short HEAD');
      commitHash = hashOut.trim();
    }

    // Check existing remotes
    const { stdout: remotesOut } = await runGit('git remote');
    const remotes = remotesOut
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const pushedRemotes: string[] = [];
    const pushErrors: string[] = [];

    // Push to origin if available
    if (remotes.includes('origin')) {
      try {
        await runGit('git push origin main');
        pushedRemotes.push('origin/main');
      } catch (err: any) {
        console.error('Push to origin failed:', err);
        pushErrors.push(`origin: ${err.message || 'Push failed'}`);
      }
    }

    // Push to preview if available
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
      committed: hasStaged,
      commitHash,
      pushedRemotes,
      pushErrors,
      message: hasStaged
        ? `Successfully committed (${commitHash}) and pushed to ${pushedRemotes.join(', ')}!`
        : `Already up to date. Verified on ${pushedRemotes.join(', ')}.`,
    });
  } catch (error: any) {
    console.error('Git sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to GitHub' },
      { status: 500 }
    );
  }
}
