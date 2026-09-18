import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
    const isValidType =
      allowedTypes.includes(file.type.toLowerCase()) ||
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

    // Target directory inside public/
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'images',
      'questions',
      safeCategory
    );
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate clean unique filename
    const safeId = questionId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '') || 'q';
    const timestamp = Date.now();
    const filename = `${safeId}-${timestamp}${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Save binary data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/images/questions/${safeCategory}/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      filename,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
