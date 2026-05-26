export const MIN_QUALITY_SCORE = 60;

export const RED_FLAGS = [
  'crystal clear', 'stunning coral', 'stunning formation', 'perfect for all levels',
  'diverse marine life', 'world-class', 'pristine conditions', 'pristine waters',
  'breathtaking', 'excellent visibility', 'excellent conditions', 'abundant sea life',
  'teeming with', 'thriving ecosystem',
];

/** Balanced-bracket extractor — finds the first complete {...} object, skipping strings correctly. */
export function extractFirstObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

/** Repairs common LLM JSON defects: control chars, JS comments, Python literals, trailing commas. */
export function repairJSON(s: string): string {
  let result = '';
  let inStr = false, esc = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (esc)                 { result += c; esc = false; i++; continue; }
    if (c === '\\' && inStr) { result += c; esc = true;  i++; continue; }
    if (c === '"')           { inStr = !inStr; result += c; i++; continue; }
    if (inStr) {
      if (c === '\n') { result += '\\n'; i++; continue; }
      if (c === '\r') { result += '\\r'; i++; continue; }
      if (c === '\t') { result += '\\t'; i++; continue; }
      result += c; i++; continue;
    }
    // Strip // line comments
    if (c === '/' && s[i + 1] === '/') {
      i += 2; while (i < s.length && s[i] !== '\n') i++;
      continue;
    }
    // Strip /* block comments */
    if (c === '/' && s[i + 1] === '*') {
      i += 2;
      while (i < s.length - 1 && !(s[i] === '*' && s[i + 1] === '/')) i++;
      i += 2; continue;
    }
    // Python True / False / None
    if (s.startsWith('True',  i) && /\W/.test(s[i + 4] ?? ' ')) { result += 'true';  i += 4; continue; }
    if (s.startsWith('False', i) && /\W/.test(s[i + 5] ?? ' ')) { result += 'false'; i += 5; continue; }
    if (s.startsWith('None',  i) && /\W/.test(s[i + 4] ?? ' ')) { result += 'null';  i += 4; continue; }
    result += c; i++;
  }
  return result.replace(/,(\s*[}\]])/g, '$1');
}

export function extractJSON(text: string): Record<string, unknown> | null {
  const cleaned = text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim();

  const candidates: string[] = [];
  const codeBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) candidates.push(codeBlock[1].trim());
  const balanced = extractFirstObject(cleaned);
  if (balanced) candidates.push(balanced);
  candidates.push(cleaned);

  for (const c of candidates) {
    try { return JSON.parse(c); } catch { /**/ }
    try { return JSON.parse(repairJSON(c)); } catch { /**/ }
  }
  return null;
}

export function validateQuality(enhanced: Record<string, unknown>) {
  let score = 0;
  const issues: string[] = [];
  const text = [(enhanced.description as string) || '', ...((enhanced.highlights as string[]) || [])].join(' ');

  let flagCount = 0;
  RED_FLAGS.forEach((flag) => {
    if (text.toLowerCase().includes(flag.toLowerCase())) {
      score -= 10; flagCount++;
      issues.push(`Generic phrase: "${flag}"`);
    }
  });

  const hasDepthNumbers  = /\d+\s*m(?:eters?)?/i.test(text);
  const hasSpecificNames = /[A-Z][a-z]+(?:\s+[A-Za-z]+)?\s+(?:reef|wreck|wall|cave|garden|pinnacle|arch|canyon)/i.test(text);
  const hasSources       = Array.isArray(enhanced.sources) && (enhanced.sources as unknown[]).length >= 2;
  const hasConfidence    = ['high', 'medium'].includes(enhanced.confidence as string);
  const ml               = enhanced.marineLife as Record<string, unknown[]> | undefined;
  const hasMarineLife    = !!(ml && (ml.fish?.length || ml.corals?.length || ml.macro?.length || ml.pelagic?.length));
  const hasSciNames      = hasMarineLife && JSON.stringify(ml).includes('"scientificName"');

  if (hasDepthNumbers)  score += 20; else issues.push('No depth numbers');
  if (hasSpecificNames) score += 20; else issues.push('No named features');
  if (hasSources)       score += 25; else issues.push('< 2 sources');
  if (hasConfidence)    score += 15; else issues.push('No confidence rating');
  if (hasMarineLife)    score += 15; else issues.push('No marine life data');
  if (hasSciNames)      score += 5;

  const descLen   = ((enhanced.description as string) || '').length;
  const descParas = ((enhanced.description as string) || '').split('\n\n').length;
  const hlCount   = ((enhanced.highlights as unknown[]) || []).length;

  if (descLen < 300)  { score -= 20; issues.push(`Description too short (${descLen} chars)`); }
  if (descParas < 2)  { score -= 15; issues.push('Need ≥ 2 paragraphs'); }
  if (hlCount < 4)    { score -= 10; issues.push(`Too few highlights (${hlCount})`); }

  const final = Math.max(0, Math.min(100, score));
  return { score: final, flagCount, issues, isValid: final >= MIN_QUALITY_SCORE && flagCount === 0, hasDepthNumbers, hasSpecificNames, hasSources, hasMarineLife };
}
