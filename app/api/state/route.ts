import { NextResponse } from 'next/server';
import { readState, writeState } from '@/lib/kv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const state = await readState();
  return NextResponse.json(state, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const next = await writeState({
      groupMatches: body.groupMatches,
      bracketScores: body.bracketScores,
      reset: body.reset === true,
    });
    return NextResponse.json(next, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    console.error('POST /api/state failed', err);
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
}
