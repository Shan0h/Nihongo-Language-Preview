import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Shan0h';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Nihongo-Language';
const GITHUB_PREVIEW_REPO = process.env.GITHUB_PREVIEW_REPO || 'Nihongo-Language-Preview';

async function commitImageToGitHub(
  owner: string,
  repo: string,
  filePath: string,
  contentBase64: string,
  token: string
) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nihongo-Language-App',
      },
      body: JSON.stringify({
        message: `admin: upload image ${filePath} [${new Date().toISOString().substring(0, 19)}]`,
        content: contentBase64,
        branch: 'main',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';
    const questionId = (formData.get('questionId') as string) || 'question';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate mime type or extension
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    const extension = path.extname(file.name).toLowerCase() || '.jpg';
    const fileType = file.type.toLowerCase() || 'image/jpeg';
    const isValidType =
      allowedTypes.includes(fileType) ||
      ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(extension);

    if (!isValidType) {
      return NextResponse.json(
        { success: false, error: 'Only image files (JPG, PNG, WebP, GIF, SVG) are allowed.' },
        { status: 400 }
      );
    }

    // Sanitize category for folder path
    const safeCategory = category
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '') || 'general';

    // Generate clean unique filename
    const safeId = questionId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '') || 'q';
    const timestamp = Date.now();
    const filename = `${safeId}-${timestamp}${extension}`;
    const publicUrl = `/images/questions/${safeCategory}/${filename}`;
    const repoRelativePath = `public/images/questions/${safeCategory}/${filename}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const contentBase64 = buffer.toString('base64');
    const dataUrl = `data:${fileType};base64,${contentBase64}`;

    let savedLocally = false;
    try {
      const uploadDir = path.join(
        process.cwd(),
        'public',
        'images',
        'questions',
        safeCategory
      );
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      savedLocally = true;
    } catch (fsErr: any) {
      console.warn('Filesystem write not possible (e.g. Vercel read-only):', fsErr.message);
    }

    // If on Vercel and GITHUB_TOKEN is available, commit image directly to GitHub
    if (!savedLocally && GITHUB_TOKEN) {
      await commitImageToGitHub(GITHUB_OWNER, GITHUB_REPO, repoRelativePath, contentBase64, GITHUB_TOKEN);
      if (GITHUB_PREVIEW_REPO && GITHUB_PREVIEW_REPO !== GITHUB_REPO) {
        await commitImageToGitHub(GITHUB_OWNER, GITHUB_PREVIEW_REPO, repoRelativePath, contentBase64, GITHUB_TOKEN);
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: savedLocally || GITHUB_TOKEN ? publicUrl : dataUrl,
      dataUrl,
      targetPath: repoRelativePath,
      contentBase64,
      filename,
      savedLocally,
      message: savedLocally
        ? 'Image uploaded successfully to server.'
        : GITHUB_TOKEN
        ? 'Image committed directly to GitHub repository!'
        : 'Image prepared as data preview. Push to GitHub to persist.',
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
