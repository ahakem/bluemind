import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJSON, validateQuality } from '@/lib/geminiParser';

const GEMINI_MODEL = 'gemini-2.5-flash';

function buildPrompt(site: Record<string, unknown>): string {
  const name = (site.name as string) || 'Unknown Site';
  const location = [(site.location as string), (site.country as string)].filter(Boolean).join(', ') || 'Unknown';
  const existing = {
    description: (site.description as string)?.slice(0, 300) || '',
    maxDepth: site.maxDepth,
    waterType: site.waterType,
    tags: site.tags,
    highlights: site.highlights,
  };
  return `You are a professional dive site researcher. Use Google Search to find FACTUAL, SPECIFIC information about this dive site. Output ONLY a single raw JSON object — no markdown, no code fences, no comments, no explanation before or after.

DIVE SITE: ${name}
LOCATION: ${location}
WATER TYPE: ${(site.waterType as string) || 'unknown'}
EXISTING DATA: ${JSON.stringify(existing, null, 2)}

Search for: "${name} diving ${location}", "${name} dive site", "${name} freediving", "${name} depth"

Extract: exact depths (numbers + units), named features, species with scientific names, infrastructure, visibility ranges, access method, conditions.

BANNED PHRASES: crystal clear | stunning | perfect for all levels | diverse marine life | world-class | pristine | breathtaking | excellent visibility

If you cannot find specific verifiable data, output exactly:
{"error":"insufficient_data","searchQueriesUsed":[],"partialDataFound":{}}

Otherwise output exactly this JSON structure (no extra keys, no comments):
{"description":"3 paragraphs separated by \\n\\n: (1) location/access/topography (2) depths/features/infrastructure (3) marine life with species names","highlights":["specific fact 1","specific fact 2","specific fact 3","specific fact 4"],"maxDepth":"40m","visibilityRange":"15-25m","freediverFriendly":"yes","freediverFriendlyReason":"specific reason","hasLineDiving":"yes","lineDivingDetails":"details or null","freediverDepthRange":"5-40m","freediverAccess":"shore","freediverConditions":"calm","facilities":{"diveCenter":true,"restaurant":false,"parking":true,"equipment":true,"accommodation":false,"depthMarkers":[]},"marineLife":{"fish":[{"name":"","scientificName":"","frequency":"","location":"","season":""}],"corals":[{"type":"","location":"","condition":""}],"macro":[{"name":"","scientificName":"","frequency":"","location":"","behavior":""}],"pelagic":[{"name":"","frequency":"","season":""}],"specialSightings":[]},"sources":["url1","url2"],"waterType":"sea","confidence":"high"}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

  let body: { siteData: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { siteData } = body;
  if (!siteData) return NextResponse.json({ error: 'siteData required' }, { status: 400 });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
    });

    const result   = await model.generateContent(buildPrompt(siteData));
    const response = result.response;
    const raw      = response.text();
    const meta     = response.candidates?.[0]?.groundingMetadata;
    const sources  = (meta?.groundingChunks ?? []).map((c: { web?: { uri?: string } }) => c.web?.uri).filter(Boolean) as string[];
    const queries  = (meta?.webSearchQueries ?? []) as string[];

    const parsed = extractJSON(raw);

    if (!parsed) {
      return NextResponse.json({ status: 'parse_failed', raw: raw.slice(0, 3000), queries });
    }

    if (parsed.error === 'insufficient_data') {
      return NextResponse.json({ status: 'insufficient_data', queries, partial: parsed.partialDataFound });
    }

    parsed.sources = [...new Set([...sources, ...((parsed.sources as string[]) ?? [])])];
    const validation = validateQuality(parsed);

    return NextResponse.json({
      status: validation.isValid ? 'passed' : 'quality_failed',
      parsed,
      validation,
      queries,
      raw: raw.slice(0, 500),
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
