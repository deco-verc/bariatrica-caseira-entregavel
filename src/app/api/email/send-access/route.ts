import { NextRequest, NextResponse } from 'next/server';
import { sendAccessEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const secret = searchParams.get('secret');

  if (process.env.KIWIFY_WEBHOOK_SECRET && secret !== process.env.KIWIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, temporaryPassword } = await req.json();

    const result = await sendAccessEmail({
      name,
      email,
      temporaryPassword: temporaryPassword || process.env.DEFAULT_TEMP_PASSWORD || '12345',
      loginUrl: `${process.env.APP_URL}/login`
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
