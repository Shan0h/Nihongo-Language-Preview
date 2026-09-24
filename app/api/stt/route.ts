import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Server-side Japanese Speech-to-Text endpoint powered by Groq Whisper
 * Transcribes audio recordings from MediaRecorder on ANY device (OnePlus 12, Samsung, iOS, etc.)
 * Bypasses all device-specific Google Speech Services restrictions with ~150ms latency.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const prompt = formData.get('prompt') as string | null;

    // Build multipart request for Groq Whisper
    const groqFormData = new FormData();
    groqFormData.append('file', file, 'audio.webm');
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', 'ja');
    groqFormData.append('response_format', 'json');
    groqFormData.append('temperature', '0.0');
    if (prompt && prompt.trim()) {
      // Groq Whisper API has a strict 896 character limit for prompt. Clamping to 800 prevents HTTP 400.
      const clampedPrompt = prompt.trim().slice(0, 800);
      groqFormData.append('prompt', clampedPrompt);
    } else {
      groqFormData.append('prompt', '日本語、単語、ひらがな、漢字');
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq Whisper STT API error:', groqResponse.status, errorText);
      return NextResponse.json(
        { error: 'Speech transcription service failed', details: errorText },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    const text = (data.text || '').trim();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Server STT error:', error);
    return NextResponse.json({ error: 'Internal server error in STT processing' }, { status: 500 });
  }
}
