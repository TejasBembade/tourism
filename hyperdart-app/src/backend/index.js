import express from 'express'
import cors from 'cors'
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';
import { parseNaturalQuery, generateWhyThisPlace, calculateRelevance, getEditorialImage } from './tourismIntelligence.js';

// Create Express app
const app = express();

// Middleware: JSON body parsing
app.use(express.json())


const devDomain = env.DEV_DOMAIN
const stagingDomain = env.STAGING_DOMAIN
const prodDomain = env.PROD_DOMAIN



// Middleware: CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // If your frontend runs on a different local port (e.g. 5174),
  // add it here like: 'http://localhost:5174'

  // ⚠️ DEV_DOMAIN and PROD_DOMAIN are injected via Cloudflare env vars.
  // These values are available at runtime once your component is
  // published and approved. Do NOT remove them — they are required
  // for deployed environments to work correctly.
  devDomain,
  stagingDomain,
  prodDomain
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))


// Placeholder for DB access
const getDB = () => env.DB

// In order to use table, it shoule be created using
// wrangler d1 execute my-db --local --command "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE);"
// Here my-db refers to the database name defined in wrangler.jsonc
// The create table command should also be part of schema.jsonc in order to create tables remotely


// Route: Basic Test
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from Express on Workers!' })
})

// Curated authentic attractions for fallback resilience
const CURATED_PLACES = {
  paris: [
    {
      id: 'eiffel-tower',
      name: 'Eiffel Tower',
      category: 'monuments',
      categoryLabel: 'Monument / Landmark',
      description: 'Iconic 330-metre wrought-iron lattice tower on the Champ de Mars, offering panoramic views of Paris.',
      address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
      lat: 48.8584,
      lon: 2.2945,
      rating: 4.8,
      tags: ['Landmark', 'Panoramic Views', 'Iconic'],
      website: 'https://www.toureiffel.paris/'
    },
    {
      id: 'louvre-museum',
      name: 'Louvre Museum',
      category: 'museums',
      categoryLabel: 'Museum & Art Gallery',
      description: 'World’s largest art museum and historic monument, home to the Mona Lisa and Venus de Milo.',
      address: 'Rue de Rivoli, 75001 Paris',
      lat: 48.8606,
      lon: 2.3376,
      rating: 4.9,
      tags: ['Museum', 'Art', 'History'],
      website: 'https://www.louvre.fr/'
    },
    {
      id: 'notre-dame',
      name: 'Cathédrale Notre-Dame de Paris',
      category: 'temples',
      categoryLabel: 'Historic Cathedral',
      description: 'Masterpiece of French Gothic architecture on Île de la Cité, dating back to the 12th century.',
      address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris',
      lat: 48.8530,
      lon: 2.3499,
      rating: 4.7,
      tags: ['Historic', 'Cathedral', 'Architecture'],
      website: 'https://www.notredamedeparis.fr/'
    },
    {
      id: 'arc-de-triomphe',
      name: 'Arc de Triomphe',
      category: 'monuments',
      categoryLabel: 'Monument / Memorial',
      description: 'Famous triumphal arch honouring those who fought and died for France, standing atop the Champs-Élysées.',
      address: 'Pl. Charles de Gaulle, 75008 Paris',
      lat: 48.8738,
      lon: 2.2950,
      rating: 4.7,
      tags: ['Monument', 'Champs-Élysées', 'History'],
      website: 'https://www.paris-arc-de-triomphe.fr/'
    },
    {
      id: 'musee-orsay',
      name: 'Musée d\'Orsay',
      category: 'museums',
      categoryLabel: 'Art Museum',
      description: 'Housed in the former Gare d\'Orsay railway station, featuring masterpieces by Monet, Van Gogh, and Degas.',
      address: '1 Rue de la Légion d\'Honneur, 75007 Paris',
      lat: 48.8599,
      lon: 2.3266,
      rating: 4.8,
      tags: ['Art Museum', 'Impressionism', 'Sculpture'],
      website: 'https://www.musee-orsay.fr/'
    },
    {
      id: 'sacre-coeur',
      name: 'Basilique du Sacré-Cœur',
      category: 'temples',
      categoryLabel: 'Historic Basilica / Viewpoint',
      description: 'Stunning white basilica perched at the summit of the Montmartre butte, overlooking all of Paris.',
      address: '35 Rue du Chevalier de la Barre, 75018 Paris',
      lat: 48.8867,
      lon: 2.3431,
      rating: 4.8,
      tags: ['Basilica', 'Montmartre', 'Panoramic View'],
      website: 'http://www.sacre-coeur-montmartre.com/'
    },
    {
      id: 'jardin-luxembourg',
      name: 'Jardin du Luxembourg',
      category: 'parks',
      categoryLabel: 'Historic Garden & Park',
      description: 'Serene 23-hectare park with tree-lined promenades, the Medici Fountain, and model sailboats.',
      address: '75006 Paris',
      lat: 48.8462,
      lon: 2.3371,
      rating: 4.7,
      tags: ['Park', 'Gardens', 'Relaxation'],
      website: 'https://www.senat.fr/visite/jardin/'
    },
    {
      id: 'sainte-chapelle',
      name: 'Sainte-Chapelle',
      category: 'monuments',
      categoryLabel: 'Gothic Royal Chapel',
      description: 'Rayonnant Gothic royal chapel famed for its breathtaking 13th-century stained-glass windows.',
      address: '10 Bd du Palais, 75001 Paris',
      lat: 48.8554,
      lon: 2.3450,
      rating: 4.8,
      tags: ['Stained Glass', 'Gothic', 'Historic'],
      website: 'http://www.sainte-chapelle.fr/'
    }
  ],
  nyc: [
    {
      id: 'statue-of-liberty',
      name: 'Statue of Liberty & Ellis Island',
      category: 'monuments',
      categoryLabel: 'National Monument',
      description: 'World-renowned symbol of freedom and democracy standing in New York Harbor.',
      address: 'Liberty Island, New York, NY 10004',
      lat: 40.6892,
      lon: -74.0445,
      rating: 4.8,
      tags: ['Iconic', 'Landmark', 'History'],
      website: 'https://www.nps.gov/stli/'
    },
    {
      id: 'central-park',
      name: 'Central Park',
      category: 'parks',
      categoryLabel: 'Urban Park / Nature',
      description: 'Sprawling 843-acre urban oasis with walking paths, lakes, Bow Bridge, and the Bethesda Terrace.',
      address: 'New York, NY',
      lat: 40.7851,
      lon: -73.9683,
      rating: 4.9,
      tags: ['Nature', 'Park', 'Landmark'],
      website: 'https://www.centralparknyc.org/'
    },
    {
      id: 'met-museum',
      name: 'The Metropolitan Museum of Art (The Met)',
      category: 'museums',
      categoryLabel: 'Art Museum',
      description: 'One of the world’s greatest museums, spanning 5,000 years of global art from ancient Egypt to contemporary.',
      address: '1000 5th Ave, New York, NY 10028',
      lat: 40.7794,
      lon: -73.9632,
      rating: 4.9,
      tags: ['Art', 'History', 'Museum'],
      website: 'https://www.metmuseum.org/'
    },
    {
      id: 'empire-state',
      name: 'Empire State Building',
      category: 'monuments',
      categoryLabel: 'Skyscraper Observatory',
      description: 'Art Deco 102-story skyscraper offering open-air 360-degree views of the New York City skyline.',
      address: '20 W 34th St., New York, NY 10001',
      lat: 40.7484,
      lon: -73.9857,
      rating: 4.7,
      tags: ['Skyline', 'Observation Deck', 'Architecture'],
      website: 'https://www.esbnyc.com/'
    },
    {
      id: 'brooklyn-bridge',
      name: 'Brooklyn Bridge',
      category: 'monuments',
      categoryLabel: 'Historic Suspension Bridge',
      description: 'Historic neo-Gothic suspension bridge connecting Manhattan and Brooklyn with scenic pedestrian walkways.',
      address: 'New York, NY 10038',
      lat: 40.7061,
      lon: -73.9969,
      rating: 4.8,
      tags: ['Bridge', 'Views', 'Walking'],
      website: 'https://www.nyc.gov/html/dot/html/infrastructure/brooklyn-bridge.shtml'
    }
  ],
  delhi: [
    {
      id: 'qutub-minar',
      name: 'Qutub Minar',
      category: 'monuments',
      categoryLabel: 'UNESCO World Heritage Monument',
      description: '73-metre tall minaret built in 1192, featuring intricate red sandstone carvings and historic ruins.',
      address: 'Seth Sarai, Mehrauli, New Delhi 110030',
      lat: 28.5244,
      lon: 77.1855,
      rating: 4.6,
      tags: ['UNESCO', 'Historical', 'Architecture'],
      website: 'https://delhitourism.gov.in/'
    },
    {
      id: 'red-fort',
      name: 'Red Fort (Lal Qila)',
      category: 'monuments',
      categoryLabel: 'Mughal Historic Fort',
      description: 'Magnificent 17th-century Mughal fortress of red sandstone representing the apex of Mughal creativity.',
      address: 'Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi 110006',
      lat: 28.6562,
      lon: 77.2410,
      rating: 4.5,
      tags: ['Fort', 'Mughal History', 'UNESCO'],
      website: 'https://delhitourism.gov.in/'
    },
    {
      id: 'humayun-tomb',
      name: 'Humayun’s Tomb',
      category: 'monuments',
      categoryLabel: 'Historic Mausoleum / Gardens',
      description: 'First garden-tomb on the Indian subcontinent, inspiring the later architecture of the Taj Mahal.',
      address: 'Mathura Road, Nizamuddin East, New Delhi 110013',
      lat: 28.5933,
      lon: 77.2507,
      rating: 4.7,
      tags: ['Mausoleum', 'Gardens', 'UNESCO'],
      website: 'https://delhitourism.gov.in/'
    },
    {
      id: 'lotus-temple',
      name: 'Lotus Temple (Bahá\'í House of Worship)',
      category: 'temples',
      categoryLabel: 'Temple / Place of Worship',
      description: 'Pioneering lotus flower-shaped marble temple open to all regardless of faith.',
      address: 'Lotus Temple Rd, Bahapur, Kalkaji, New Delhi 110019',
      lat: 28.5535,
      lon: 77.2588,
      rating: 4.6,
      tags: ['Temple', 'Architecture', 'Serenity'],
      website: 'https://www.bahai.in/'
    },
    {
      id: 'lodhi-garden',
      name: 'Lodhi Garden',
      category: 'parks',
      categoryLabel: 'Heritage Park & Gardens',
      description: '90-acre city park containing 15th-century Sayyid and Lodhi architectural tombs amidst lush flora.',
      address: 'Lodhi Rd, New Delhi 110003',
      lat: 28.5931,
      lon: 77.2197,
      rating: 4.7,
      tags: ['Park', 'Heritage', 'Nature'],
      website: 'https://delhitourism.gov.in/'
    }
  ]
};

// Category mapping helper for Geoapify
function getGeoapifyCategories(category) {
  switch (category) {
    case 'museums':
      return 'entertainment.museum';
    case 'monuments':
      return 'heritage,building.historic';
    case 'temples':
      return 'religion.place_of_worship';
    case 'parks':
      return 'leisure.park';
    default:
      return 'tourism.sights,tourism.attraction,entertainment.museum,heritage,building.historic,religion.place_of_worship,leisure.park';
  }
}

// Distance calculation using Haversine formula (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Route: Get Tourist Attractions
app.get('/api/attractions', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const city = (req.query.city || '').trim();
    const category = (req.query.category || 'all').toLowerCase();
    const radius = parseInt(req.query.radius) || 25000;

    const apiKey = env.GEOAPIFY_API_KEY || (typeof process !== 'undefined' && process.env?.GEOAPIFY_API_KEY) || '';

    // If API key is available and coordinates are valid, try Geoapify Places API
    if (apiKey && !isNaN(lat) && !isNaN(lon)) {
      try {
        let geoCategories = getGeoapifyCategories(category);
        let geoUrl = `https://api.geoapify.com/v2/places?categories=${geoCategories}&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${apiKey}`;

        let apiRes = await fetch(geoUrl);
        let data = apiRes.ok ? await apiRes.json() : null;

        // If specific category had 0 results, try broader 'all' category
        if ((!data || !data.features || data.features.length === 0) && category !== 'all') {
          const broaderCategories = getGeoapifyCategories('all');
          const broaderUrl = `https://api.geoapify.com/v2/places?categories=${broaderCategories}&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${apiKey}`;
          const broaderRes = await fetch(broaderUrl);
          if (broaderRes.ok) {
            data = await broaderRes.json();
          }
        }

        if (data && data.features && data.features.length > 0) {
          // Filter out commercial/catering
          const attractions = data.features
            .map((feature) => {
              const props = feature.properties || {};
              const cats = props.categories || [];

              const isRestaurant = cats.some((c) => c.startsWith('catering.'));
              const isHotel = cats.some((c) => c.startsWith('accommodation.'));
              const isShop = cats.some((c) => c.startsWith('commercial.') && !c.includes('art'));
              if (isRestaurant || isHotel || isShop) return null;

              const pLat = props.lat || feature.geometry?.coordinates?.[1];
              const pLon = props.lon || feature.geometry?.coordinates?.[0];

              let assignedCategory = 'monuments';
              if (cats.some(c => c.includes('museum'))) assignedCategory = 'museums';
              else if (cats.some(c => c.includes('worship') || c.includes('religion'))) assignedCategory = 'temples';
              else if (cats.some(c => c.includes('park') || c.includes('viewpoint') || c.includes('natural') || c.includes('leisure'))) assignedCategory = 'parks';

              // Ensure place name is meaningful (avoid pure postcodes or street numbers)
              let placeName = (props.name || '').trim();
              if (!placeName || /^\d+$/.test(placeName) || /^[A-Z0-9-]+\s+\d+$/i.test(placeName)) {
                placeName = (props.address_line1 && !/^\d+$/.test(props.address_line1))
                  ? props.address_line1
                  : `${city} ${props.categories?.[0]?.split('.').pop() || 'Sight'}`;
              }

              const dist = calculateDistance(lat, lon, pLat, pLon);
              const attractionObj = {
                id: props.place_id || `${pLat}_${pLon}`,
                name: placeName,
                category: assignedCategory,
                categoryLabel: props.categories?.[0]?.replace(/[_.]/g, ' ') || 'Attraction',
                description: props.description || (props.address_line2 ? `Located in ${props.address_line2}` : ''),
                address: props.formatted || props.address_line1 || '',
                lat: pLat,
                lon: pLon,
                rating: null, // Truthful data: no fabricated ratings
                distanceKm: dist,
                imageUrl: getEditorialImage(placeName, assignedCategory),
                website: props.website || props.contact?.website || null,
                visitDuration: assignedCategory === 'museums' ? '1.5 - 2.5 hrs' : assignedCategory === 'parks' ? '1 - 2 hrs' : '45 - 90 mins',
                tags: cats.slice(0, 3).map(c => c.split('.').pop())
              };

              attractionObj.whyThisPlace = generateWhyThisPlace(attractionObj, { category, interests: [] }, city);
              attractionObj.relevanceScore = calculateRelevance(attractionObj, { category, interests: [] });
              return attractionObj;
            })
            .filter(Boolean);

          if (attractions.length > 0) {
            return res.json({
              source: 'geoapify',
              count: attractions.length,
              city: city || 'Destination',
              center: { lat, lon },
              attractions
            });
          }
        }
      } catch (err) {
        console.warn('Geoapify request failed:', err.message);
      }
    }

    // Only use curated fallback if NO apiKey AND the city explicitly matches one of the sample cities
    const cityLower = city.toLowerCase();
    if (!apiKey && (cityLower.includes('paris') || cityLower.includes('new york') || cityLower.includes('delhi'))) {
      let matchedPlaces = CURATED_PLACES[cityLower.includes('paris') ? 'paris' : cityLower.includes('delhi') ? 'delhi' : 'nyc'];
      let filtered = matchedPlaces;
      if (category && category !== 'all') {
        filtered = matchedPlaces.filter((p) => p.category === category);
        if (filtered.length === 0) filtered = matchedPlaces;
      }
      return res.json({
        source: 'curated-sample',
        hasApiKey: false,
        count: filtered.length,
        city: city,
        center: { lat, lon },
        attractions: filtered.map(p => {
          const dist = calculateDistance(lat, lon, p.lat, p.lon);
          const enriched = {
            ...p,
            distanceKm: dist,
            imageUrl: getEditorialImage(p.name, p.category),
            visitDuration: p.category === 'museums' ? '2 hrs' : '1 hr',
            whyThisPlace: generateWhyThisPlace(p, { category, interests: [] }, city),
            relevanceScore: 92
          };
          return enriched;
        })
      });
    }

    // Honest empty response when no genuine sights are found (NEVER invent false Paris places)
    return res.json({
      source: 'geoapify',
      hasApiKey: Boolean(apiKey),
      count: 0,
      city: city || 'Destination',
      center: { lat, lon },
      attractions: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attractions', details: err.message });
  }
});

// Route: Universal Tourism Search with Natural Language Intelligence + Geocoding
app.get('/api/search', async (req, res) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ status: 'error', message: 'Query parameter q is required.' });
    }

    const apiKey = env.GEOAPIFY_API_KEY || (typeof process !== 'undefined' && process.env?.GEOAPIFY_API_KEY) || '';

    // 1. Natural Language Intelligence Engine
    const queryAnalysis = parseNaturalQuery(rawQuery);
    let targetLocation = queryAnalysis.destination || rawQuery;
    let detectedCategory = (req.query.category && req.query.category !== 'all')
      ? req.query.category.toLowerCase()
      : queryAnalysis.category;

    // 2. Geocode the location
    let lat = null;
    let lon = null;
    let city = targetLocation;
    let country = '';

    if (apiKey) {
      try {
        const geoRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(targetLocation)}&apiKey=${apiKey}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.features && geoData.features.length > 0) {
            const first = geoData.features[0];
            lat = first.properties.lat;
            lon = first.properties.lon;
            city = first.properties.city || first.properties.name || targetLocation;
            country = first.properties.country || '';
          }
        }
      } catch (err) {
        console.warn('Geocoding error:', err.message);
      }
    }

    // If geocoding failed and not in fallback coordinates
    if (lat === null || lon === null) {
      const cityLower = targetLocation.toLowerCase();
      if (cityLower.includes('paris')) { lat = 48.8566; lon = 2.3522; city = 'Paris'; country = 'France'; }
      else if (cityLower.includes('new york') || cityLower.includes('nyc')) { lat = 40.7128; lon = -74.0060; city = 'New York'; country = 'USA'; }
      else if (cityLower.includes('delhi')) { lat = 28.6139; lon = 77.2090; city = 'Delhi'; country = 'India'; }
      else if (cityLower.includes('rome')) { lat = 41.9028; lon = 12.4964; city = 'Rome'; country = 'Italy'; }
      else if (cityLower.includes('kyoto')) { lat = 35.0116; lon = 135.7681; city = 'Kyoto'; country = 'Japan'; }
      else {
        return res.json({
          status: 'location_not_found',
          query: rawQuery,
          searchedLocation: targetLocation,
          message: `Location "${targetLocation}" could not be recognized. Please check the spelling or search for a recognized city or region.`
        });
      }
    }

    // 3. Fetch attractions for the geocoded location
    let attractions = [];
    if (apiKey) {
      try {
        let geoCategories = getGeoapifyCategories(detectedCategory);
        let placesUrl = `https://api.geoapify.com/v2/places?categories=${geoCategories}&filter=circle:${lon},${lat},25000&limit=25&apiKey=${apiKey}`;
        let pRes = await fetch(placesUrl);
        let pData = pRes.ok ? await pRes.json() : null;

        // If specific category yielded 0 results, fall back to 'all' sights for this location
        if ((!pData || !pData.features || pData.features.length === 0) && detectedCategory !== 'all') {
          const allCategories = getGeoapifyCategories('all');
          const broadUrl = `https://api.geoapify.com/v2/places?categories=${allCategories}&filter=circle:${lon},${lat},25000&limit=25&apiKey=${apiKey}`;
          const broadRes = await fetch(broadUrl);
          if (broadRes.ok) {
            pData = await broadRes.json();
            detectedCategory = 'all';
          }
        }

        if (pData && pData.features && pData.features.length > 0) {
          attractions = pData.features.map(f => {
            const props = f.properties || {};
            const cats = props.categories || [];
            const isRestaurant = cats.some(c => c.startsWith('catering.'));
            const isHotel = cats.some(c => c.startsWith('accommodation.'));
            const isShop = cats.some(c => c.startsWith('commercial.') && !c.includes('art'));
            if (isRestaurant || isHotel || isShop) return null;

            const pLat = props.lat || f.geometry?.coordinates?.[1];
            const pLon = props.lon || f.geometry?.coordinates?.[0];

            let assignedCategory = 'monuments';
            if (cats.some(c => c.includes('museum'))) assignedCategory = 'museums';
            else if (cats.some(c => c.includes('worship') || c.includes('religion'))) assignedCategory = 'temples';
            else if (cats.some(c => c.includes('park') || c.includes('viewpoint') || c.includes('natural') || c.includes('leisure'))) assignedCategory = 'parks';

            let placeName = (props.name || '').trim();
            if (!placeName || /^\d+$/.test(placeName) || /^[A-Z0-9-]+\s+\d+$/i.test(placeName)) {
              placeName = (props.address_line1 && !/^\d+$/.test(props.address_line1))
                ? props.address_line1
                : `${city} ${props.categories?.[0]?.split('.').pop() || 'Sight'}`;
            }

            const dist = calculateDistance(lat, lon, pLat, pLon);
            const item = {
              id: props.place_id || `${pLat}_${pLon}`,
              name: placeName,
              category: assignedCategory,
              categoryLabel: props.categories?.[0]?.replace(/[_.]/g, ' ') || 'Attraction',
              description: props.description || (props.address_line2 ? `Located in ${props.address_line2}` : ''),
              address: props.formatted || props.address_line1 || '',
              lat: pLat,
              lon: pLon,
              rating: null,
              distanceKm: dist,
              imageUrl: getEditorialImage(placeName, assignedCategory),
              website: props.website || props.contact?.website || null,
              visitDuration: assignedCategory === 'museums' ? '1.5 - 2.5 hrs' : assignedCategory === 'parks' ? '1 - 2 hrs' : '45 - 90 mins',
              tags: cats.slice(0, 3).map(c => c.split('.').pop())
            };

            item.whyThisPlace = generateWhyThisPlace(item, queryAnalysis, city);
            item.relevanceScore = calculateRelevance(item, queryAnalysis);
            return item;
          }).filter(Boolean);
        }
      } catch (err) {
        console.warn('Places fetch error:', err.message);
      }
    }

    // Fallback if no apiKey and matches sample city
    if (!apiKey && attractions.length === 0) {
      const cityLower = city.toLowerCase();
      if (CURATED_PLACES[cityLower]) {
        let pool = CURATED_PLACES[cityLower];
        if (detectedCategory !== 'all') {
          pool = pool.filter(p => p.category === detectedCategory);
        }
        attractions = pool.map(p => {
          const dist = calculateDistance(lat, lon, p.lat, p.lon);
          const enriched = {
            ...p,
            distanceKm: dist,
            imageUrl: getEditorialImage(p.name, p.category),
            visitDuration: p.category === 'museums' ? '2 hrs' : '1 hr',
            whyThisPlace: generateWhyThisPlace(p, queryAnalysis, city),
            relevanceScore: 94
          };
          return enriched;
        });
      }
    }

    // 4. Handle "No good spot / No tourist attractions" scenario
    if (attractions.length === 0) {
      return res.json({
        status: 'no_attractions',
        query: rawQuery,
        city: city,
        country: country,
        category: detectedCategory,
        queryAnalysis,
        center: { lat, lon },
        message: `No verified tourist attractions or sights were found near ${city}. This location may be residential, industrial, or rural.`
      });
    }

    // 5. Intelligent Ranking (by Relevance Score descending, then distance)
    attractions.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0) || (a.distanceKm || 0) - (b.distanceKm || 0));

    return res.json({
      status: 'success',
      query: rawQuery,
      city: city,
      country: country,
      category: detectedCategory,
      queryAnalysis,
      count: attractions.length,
      center: { lat, lon },
      attractions
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Search processing failed', details: err.message });
  }
});

// Route: Live Weather for Visit Date via Open-Meteo
app.get('/api/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid lat and lon are required' });
    }
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const wRes = await fetch(weatherUrl);
    if (!wRes.ok) throw new Error('Weather API error');
    const wData = await wRes.json();
    const current = wData.current || {};

    const code = current.weather_code || 0;
    let condition = 'Clear Sky';
    let icon = '☀️';
    let recommendation = 'Perfect day for walking and outdoor sightseeing!';

    if (code === 0) { condition = 'Clear Sky'; icon = '☀️'; recommendation = 'Great sunny day for sightseeing and photography!'; }
    else if (code >= 1 && code <= 3) { condition = 'Partly Cloudy'; icon = '⛅'; recommendation = 'Pleasant weather for walking tours and parks.'; }
    else if (code >= 45 && code <= 48) { condition = 'Foggy'; icon = '🌫️'; recommendation = 'Atmospheric conditions for historic sites.'; }
    else if (code >= 51 && code <= 67) { condition = 'Rainy'; icon = '🌧️'; recommendation = 'Carry an umbrella or explore world-class indoor museums!'; }
    else if (code >= 71 && code <= 77) { condition = 'Snowy'; icon = '❄️'; recommendation = 'Dress warm for winter sightseeing.'; }
    else if (code >= 80 && code <= 82) { condition = 'Rain Showers'; icon = '🌦️'; recommendation = 'Intermittent showers; ideal for museum and gallery visits.'; }
    else if (code >= 95) { condition = 'Thunderstorm'; icon = '⛈️'; recommendation = 'Stay safe indoors; visit covered cultural complexes.'; }

    res.json({
      temperature: Math.round(current.temperature_2m),
      unit: '°C',
      condition,
      icon,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      recommendation
    });
  } catch (err) {
    res.json({
      temperature: 24,
      unit: '°C',
      condition: 'Pleasant',
      icon: '⛅',
      recommendation: 'Good day for sightseeing.'
    });
  }
});

// Route: Reverse Geocode for 'Near Me' / Location Detection
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid lat and lon required' });
    }
    const apiKey = env.GEOAPIFY_API_KEY || (typeof process !== 'undefined' && process.env?.GEOAPIFY_API_KEY) || '';
    if (!apiKey) {
      return res.json({ city: 'My Location', country: '' });
    }
    const revUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;
    const rRes = await fetch(revUrl);
    if (rRes.ok) {
      const rData = await rRes.json();
      if (rData && rData.features && rData.features.length > 0) {
        const props = rData.features[0].properties || {};
        return res.json({
          city: props.city || props.town || props.county || props.state || 'My Location',
          country: props.country || '',
          formatted: props.formatted || ''
        });
      }
    }
    res.json({ city: 'My Location', country: '' });
  } catch (err) {
    res.json({ city: 'My Location', country: '' });
  }
});







// Route: Insert Data into D1
// app.post('/api/users', async (req, res) => {
//   console.log('reqq', req.body)
//   const { name, email } = req.body

//   if (!name || !email) {
//     return res.status(400).json({ error: 'Name and email are required' })
//   }

//   try {
//     const db = getDB();
//     console.log('db', db)
//     await db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
//       .bind(name, email)
//       .run()

//     res.status(201).json({ success: true, message: 'User added successfully' })
//   } catch (err) {
//     res.status(500).json({ error: 'Database error', details: err.message })
//   }
// })

// Route: Fetch All Users
// app.get('/api/users', async (req, res) => {
//   try {
//     const db = getDB()
//     const { results } = await db.prepare('SELECT * FROM users').all()
//     res.json(results)
//   } catch (err) {
//     res.status(500).json({ error: 'Database error', details: err.message })
//   }
// })

app.listen(3000)
export default httpServerHandler({ port: 3000 })
