import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providedPassword = (body?.password || '').trim();

    // Check against environment variables (set in Vercel) or fallback
    const expectedPassword = (
      process.env.ADMIN_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      'nihongo2026'
    ).trim();

    if (!providedPassword) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (providedPassword === expectedPassword) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login error' },
      { status: 500 }
    );
  }
}
