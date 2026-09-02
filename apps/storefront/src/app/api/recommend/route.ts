import { NextRequest, NextResponse } from 'next/server'

const RECOMMEND_URL = process.env.RECOMMEND_SERVICE_URL || process.env.NEXT_PUBLIC_RECOMMEND_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!RECOMMEND_URL) {
      console.log('Recommend request (noop):', body);
      return NextResponse.json({ status: 'noop', recommendations: [] }, { status: 202 });
    }

    const res = await fetch(RECOMMEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Failed to forward recommend request', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
