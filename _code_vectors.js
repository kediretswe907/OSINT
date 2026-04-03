// SMART QUERY BUILDER: Broader, SearXNG-friendly queries.
// No site: restrictions (SearXNG doesn't reliably support them).
// Goes from targeted → broad to maximize coverage.
const name = $input.item.json.Name || '';
const omang = $input.item.json.Omang || '';
const degree = $input.item.json.Degree || '';
const location = $input.item.json.LastKnownLocation || 'Botswana';

// Extract profession keyword from degree
const degreeMap = {
  'account': 'Accountant OR Auditor OR Finance',
  'engineer': 'Engineer',
  'civil': 'Civil Engineer OR Infrastructure OR Construction',
  'electr': 'Electrical Engineer OR Power OR Energy',
  'mechani': 'Mechanical Engineer',
  'educat': 'Teacher OR Educator OR Lecturer OR Instructor',
  'nurs': 'Nurse OR Registered Nurse OR Healthcare',
  'law': 'Lawyer OR Attorney OR Legal OR Advocate',
  'medic': 'Doctor OR Medical Officer OR Physician',
  'pharm': 'Pharmacist OR Pharmacy',
  'ict': 'IT OR Developer OR Software OR Systems',
  'comput': 'IT OR Developer OR Software OR Systems',
  'inform': 'IT OR Information Systems OR Data',
  'business': 'Manager OR Consultant OR Administrator OR MBA',
  'social work': 'Social Worker OR Welfare Officer',
  'psycho': 'Psychologist OR Counsellor OR Therapist',
  'agriculture': 'Agronomist OR Agriculture Officer OR Farming',
  'finance': 'Finance Officer OR Financial Analyst OR Banking',
  'human resource': 'HR OR Human Resources OR Recruitment',
  'market': 'Marketing OR Communications OR PR',
  'librar': 'Librarian OR Information Science',
  'journal': 'Journalist OR Reporter OR Media',
  'architect': 'Architect OR Urban Planning',
  'environ': 'Environmental Scientist OR EIA OR Conservation',
  'geol': 'Geologist OR Mining OR Exploration',
  'statis': 'Statistician OR Data Analyst OR Research'
};

let professionKeyword = '';
const lowerDegree = degree.toLowerCase();
for (const [key, value] of Object.entries(degreeMap)) {
  if (lowerDegree.includes(key)) {
    professionKeyword = value;
    break;
  }
}
if (!professionKeyword && degree) {
  const cleanDegree = degree.replace(/\([^)]*\)/g, '').replace(/bachelor|master|diploma|certificate|degree|of|in|the|and|bsc|ba|bcom|bed|beng/gi, '').trim();
  const words = cleanDegree.split(/\s+/).filter(w => w.length > 3);
  professionKeyword = words.slice(0, 2).join(' OR ') || 'professional';
}

// Split name for alternate search patterns
const nameParts = name.trim().split(/\s+/);
const firstName = nameParts[0] || '';
const surname = nameParts[nameParts.length - 1] || '';

// ═══ SEARCH STRATEGY ═══
// L1: Professional/Social — most likely to find LinkedIn, Facebook profiles
// No site: restriction (SearXNG doesn't reliably support it)
const l1Query = encodeURIComponent('"' + name + '" ' + (professionKeyword.split(' OR ')[0] || '') + ' ' + location);

// L2: Broad location search — catches employment, news, social, anything
// This is intentionally broad to maximize SearXNG hit rate
const l2Query = encodeURIComponent('"' + name + '" ' + location);

// L3: Just the name — catches EVERYTHING including corporate registries,
// international postings, conference papers, alumni lists
const l3Query = encodeURIComponent('"' + name + '"');

// L4: Surname + profession + location — catches cases where first name
// is abbreviated (e.g., "T. Moyo" or "T Moyo Accountant")
const l4Query = encodeURIComponent(surname + ' ' + (professionKeyword.split(' OR ')[0] || '') + ' ' + location);

// L5: Employment-focused with name variants
const l5Query = encodeURIComponent('"' + name + '" employer OR company OR "works at" OR "working at" OR appointed');

return [{ json: {
  Name: name,
  FirstName: firstName,
  Surname: surname,
  Omang: omang,
  Degree: degree,
  LastKnownLocation: location,
  TargetProfession: professionKeyword,
  l1Query, l2Query, l3Query, l4Query, l5Query,
  RunTimestamp: new Date().toISOString()
}}];
