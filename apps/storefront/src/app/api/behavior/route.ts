import { NextRequest, NextResponse } from 'next/server'

const BEHAVIOR_URL = process.env.BEHAVIOR_SERVICE_URL || process.env.NEXT_PUBLIC_BEHAVIOR_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!BEHAVIOR_URL) {
      // In dev without a configured behavior service, just log and return 202
      // so clients don't error.
      // eslint-disable-next-line no-console
      console.log('Behavior event (noop):', body);
      return NextResponse.json({ status: 'noop' }, { status: 202 });
    }

    const res = await fetch(`${BEHAVIOR_URL}/api/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // keep it short; this is server-to-server
    });

    console.log(`Forwarded behavior event to ${BEHAVIOR_URL}:`, body, 'Response status:', res.status);
    const text = await res.text();
    
    return NextResponse.json({ forwarded: res.status, body: text }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to forward behavior event', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
