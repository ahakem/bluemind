import { NextRequest, NextResponse } from 'next/server';
import { extractJSON, validateQuality } from '@/lib/geminiParser';

export async function POST(req: NextRequest) {
  let body: { raw: string; sources?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { raw, sources = [] } = body;
  if (!raw) return NextResponse.json({ error: 'raw required' }, { status: 400 });

  const parsed = extractJSON(raw);

  if (!parsed) {
    return NextResponse.json({ status: 'parse_failed', raw: raw.slice(0, 500) });
  }

  if (parsed.error === 'insufficient_data') {
    return NextResponse.json({ status: 'insufficient_data' });
  }

  if (sources.length) {
    parsed.sources = [...new Set([...sources, ...((parsed.sources as string[]) ?? [])])];
  }

  const validation = validateQuality(parsed);

  return NextResponse.json({
    status: validation.isValid ? 'passed' : 'quality_failed',
    parsed,
    validation,
    queries: [],
    raw: raw.slice(0, 500),
  });
}
