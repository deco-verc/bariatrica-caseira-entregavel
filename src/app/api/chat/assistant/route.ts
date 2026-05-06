import { NextRequest, NextResponse } from 'next/server';
import { chatWithAssistant } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const response = await chatWithAssistant(messages);

    return NextResponse.json({ content: response });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
