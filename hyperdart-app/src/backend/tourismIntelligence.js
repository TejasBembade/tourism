// Tourism Intelligence Engine for HyperDart Tourism Explorer
// Handles query normalization, intent detection, grounded relevance explanations, and curated editorial travel visuals.

// Curated high-quality editorial travel photography (Unsplash CDN with responsive crop)
const CURATED_SPECIFIC_IMAGES = {
  'eiffel tower': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
  'louvre museum': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
  'notre-dame': 'https://images.unsplash.com/photo-1478359844494-1092259d93e4?auto=format&fit=crop&w=800&q=80',
  'arc de triomphe': 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80',
  'sacre-coeur': 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80',
  'jardin du luxembourg': 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=800&q=80',
  'statue of liberty': 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80',
  'central park': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
  'the metropolitan museum of art': 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80',
  'empire state building': 'https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=800&q=80',
  'brooklyn bridge': 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?auto=format&fit=crop&w=800&q=80',
  'qutub minar': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'red fort': 'https://images.unsplash.com/photo-1592635196078-9fe3d54f2377?auto=format&fit=crop&w=800&q=80',
  'humayun': 'https://images.unsplash.com/photo-1585136917228-569cf247f1c1?auto=format&fit=crop&w=800&q=80',
  'lotus temple': 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
  'lodhi garden': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
  'colosseum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'vatican': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
  'pantheon': 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&w=800&q=80',
  'hawa mahal': 'https://images.unsplash.com/photo-1603262110263-fb010d6e85fd?auto=format&fit=crop&w=800&q=80',
  'amber palace': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  'fushimi inari': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  'kinkaku-ji': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  'kiyomizu-dera': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80'
};

const CATEGORY_EDITORIAL_IMAGES = {
  museums: [
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80'
  ],
  temples: [
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80'
  ],
  monuments: [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80'
  ],
  parks: [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  ]
};

export function getEditorialImage(name = '', category = 'monuments') {
  const n = name.toLowerCase();
  for (const [key, url] of Object.entries(CURATED_SPECIFIC_IMAGES)) {
    if (n.includes(key)) return url;
  }
  const pool = CATEGORY_EDITORIAL_IMAGES[category] || CATEGORY_EDITORIAL_IMAGES.monuments;
  const hash = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return pool[hash % pool.length];
}

export function parseNaturalQuery(rawQuery = '') {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();

  let category = 'all';
  const interests = [];

  // Category identification
  if (lower.includes('museum') || lower.includes('gallery') || lower.includes('art') || lower.includes('exhibit')) {
    category = 'museums';
    interests.push('Art & Culture');
  } else if (
    lower.includes('temple') ||
    lower.includes('church') ||
    lower.includes('mosque') ||
    lower.includes('shrine') ||
    lower.includes('cathedral') ||
    lower.includes('spiritual') ||
    lower.includes('sacred') ||
    lower.includes('worship')
  ) {
    category = 'temples';
    interests.push('Sacred & Spiritual');
  } else if (
    lower.includes('fort') ||
    lower.includes('castle') ||
    lower.includes('monument') ||
    lower.includes('historic') ||
    lower.includes('palace') ||
    lower.includes('heritage') ||
    lower.includes('ruins') ||
    lower.includes('tower')
  ) {
    category = 'monuments';
    interests.push('History & Heritage');
  } else if (
    lower.includes('park') ||
    lower.includes('garden') ||
    lower.includes('nature') ||
    lower.includes('lake') ||
    lower.includes('botanical') ||
    lower.includes('viewpoint') ||
    lower.includes('scenic')
  ) {
    category = 'parks';
    interests.push('Nature & Outdoors');
  }

  // Nuanced query constraints
  if (lower.includes('architect') || lower.includes('building')) interests.push('Architecture');
  if (lower.includes('family') || lower.includes('kid')) interests.push('Family Friendly');
  if (lower.includes('free') || lower.includes('budget')) interests.push('Free Sight');
  if (lower.includes('half-day') || lower.includes('quick')) interests.push('Half-Day Duration');

  // Destination extraction regex
  let destination = q;

  // Extract after prepositions: "in Jaipur", "near Kyoto", "around Rome", "at Paris"
  const prepMatch = q.match(/(?:in|near|around|at)\s+([A-Za-z\s]+?)(?:\s+(?:for|with|near|suitable|on|\?|\.|$)|$)/i);
  if (prepMatch && prepMatch[1] && prepMatch[1].trim().length > 1) {
    destination = prepMatch[1].trim();
  } else {
    // Clean filler prefixes
    destination = destination
      .replace(/^(what are the\s+)?(best|top|famous|great|must-visit|good|worthwhile)\s+/i, '')
      .replace(/^(tourist\s+attractions?|things\s+to\s+do|places\s+to\s+(visit|see)|sights|landmarks|points\s+of\s+interest)\s+(in|near|around|at)\s+/i, '')
      .replace(/^(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\s+places?|nature\s+attractions?)\s+(in|near|around|at)\s+/i, '')
      .replace(/\s+(for\s+(families|kids|couples|beginners)|suitable\s+for\s+.*|on\s+a\s+budget|near\s+the\s+city\s+cent(re|er))$/i, '')
      .replace(/^(in|near|around|at)\s+/i, '')
      .trim();
  }

  if (!destination) destination = q;

  return { destination, category, interests, normalizedQuery: q };
}

export function generateWhyThisPlace(attraction, queryAnalysis, destinationCity = '') {
  const { category, interests } = queryAnalysis;
  const dist = attraction.distanceKm != null ? `${attraction.distanceKm} km from center` : 'central';

  if (category === 'museums' || attraction.category === 'museums') {
    return `Matches your cultural focus; verified museum located ${dist} in ${destinationCity}.`;
  }
  if (category === 'temples' || attraction.category === 'temples') {
    return `Matches your spiritual & architectural focus; historic sacred site situated ${dist}.`;
  }
  if (category === 'monuments' || attraction.category === 'monuments') {
    if (interests && interests.includes('Architecture')) {
      return `Exemplifies notable historic architecture and heritage masonry in ${destinationCity} (${dist}).`;
    }
    return `Recognized heritage landmark of high historical significance in ${destinationCity} (${dist}).`;
  }
  if (category === 'parks' || attraction.category === 'parks') {
    return `Offers open greenery and scenic outdoor walking paths; situated ${dist}.`;
  }

  return `Prominent attraction in ${destinationCity}; recognized ${attraction.categoryLabel || 'sight'} situated ${dist}.`;
}

export function calculateRelevance(attraction, queryAnalysis) {
  let score = 70;
  if (queryAnalysis.category === attraction.category) score += 20;
  if (attraction.distanceKm != null && attraction.distanceKm <= 5) score += 8;
  else if (attraction.distanceKm != null && attraction.distanceKm <= 15) score += 5;
  if (attraction.description && attraction.description.length > 30) score += 2;
  return Math.min(99, score);
}
