import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Question } from '@/data/questions';

const QUESTIONS_FILE_PATH = path.join(process.cwd(), 'data', 'questions.json');

async function readQuestions(): Promise<Question[]> {
  try {
    const raw = await fs.readFile(QUESTIONS_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading questions.json:', error);
    return [];
  }
}

async function writeQuestions(questions: Question[]): Promise<void> {
  await fs.writeFile(QUESTIONS_FILE_PATH, JSON.stringify(questions, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const questions = await readQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const incoming: Question = body.question;

    if (!incoming || !incoming.japanese_text || !incoming.correct_answer) {
      return NextResponse.json(
        { success: false, error: 'Question data is missing required fields (japanese_text, correct_answer)' },
        { status: 400 }
      );
    }

    const questions = await readQuestions();

    // Generate ID if not provided
    let questionId = incoming.id;
    if (!questionId || questionId.trim() === '') {
      const catPrefix = (incoming.category || 'q')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 5);
      questionId = `${catPrefix}-${Date.now()}`;
    }

    const questionToSave: Question = {
      ...incoming,
      id: questionId,
      options: Array.isArray(incoming.options)
        ? incoming.options
        : typeof incoming.options === 'string'
        ? (incoming.options as string).split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      category: incoming.category || 'Greetings',
      image: incoming.image || '❓',
      imageUrl: incoming.imageUrl || undefined,
    };

    // Check if existing
    const existingIndex = questions.findIndex((q) => q.id === questionToSave.id);

    if (existingIndex >= 0) {
      // Update in place
      questions[existingIndex] = {
        ...questions[existingIndex],
        ...questionToSave,
      };
    } else {
      // Append new question
      questions.push(questionToSave);
    }

    await writeQuestions(questions);

    return NextResponse.json({
      success: true,
      question: questionToSave,
      questionsCount: questions.length,
      isNew: existingIndex === -1,
      message: existingIndex >= 0 ? 'Question updated successfully' : 'Question added successfully',
    });
  } catch (error: any) {
    console.error('Error saving question:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Question id is required' },
        { status: 400 }
      );
    }

    const questions = await readQuestions();
    const initialLength = questions.length;
    const filtered = questions.filter((q) => q.id !== id);

    if (filtered.length === initialLength) {
      return NextResponse.json(
        { success: false, error: `Question with id '${id}' not found` },
        { status: 404 }
      );
    }

    await writeQuestions(filtered);

    return NextResponse.json({
      success: true,
      deletedId: id,
      questionsCount: filtered.length,
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}
