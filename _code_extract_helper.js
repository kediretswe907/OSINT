// RELAXED EXTRACT: Keeps MORE results, includes URLs, lets Gemini do the smart filtering.
// Uses simple full-name check (all words present) instead of aggressive proximity regex.
function extractSnippets(results, targetName, topN, maxChars, includeUrl) {
  const nameLower = targetName.toLowerCase();
  const nameWords = nameLower.split(/\s+/).filter(Boolean);
  
  if (nameWords.length === 0) return { snippet: 'NULL', count: 0 };

  // Simple name check: ALL name words must appear in the result text
  // We do NOT enforce proximity here — let Gemini decide if it's the right person
  const matched = results.filter(r => {
    const text = [(r.title || ''), (r.content || ''), (r.url || '')].join(' ').toLowerCase();
    return nameWords.every(w => text.includes(w));
  });

  let snippet = 'NULL';
  if (matched.length > 0) {
    const raw = matched
      .slice(0, topN)
      .map(r => {
        const parts = [(r.title || ''), (r.content || '')];
        if (includeUrl && r.url) parts.push('[URL: ' + r.url + ']');
        return parts.join(' ');
      })
      .join(' ||| ')
      .substring(0, maxChars);
    snippet = raw.replace(/["\\\n\r\t]/g, ' ').trim() || 'NULL';
  }
  return { snippet, count: matched.length };
}
