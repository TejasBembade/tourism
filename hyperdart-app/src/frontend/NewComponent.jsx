import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Badge,
  Tabs,
  Tab,
  Alert,
  Divider,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import ExploreIcon from '@mui/icons-material/Explore';
import MuseumIcon from '@mui/icons-material/Museum';
import CastleIcon from '@mui/icons-material/Castle';
import ParkIcon from '@mui/icons-material/Park';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DirectionsIcon from '@mui/icons-material/Directions';
import NavigationIcon from '@mui/icons-material/Navigation';
import SearchIcon from '@mui/icons-material/Search';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import WrongLocationIcon from '@mui/icons-material/WrongLocation';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const CATEGORIES = [
  { id: 'all', label: 'All Sights', icon: <ExploreIcon sx={{ fontSize: 16 }} /> },
  { id: 'temples', label: 'Temples & Sacred', icon: <AccountBalanceIcon sx={{ fontSize: 16 }} /> },
  { id: 'monuments', label: 'Monuments & Forts', icon: <CastleIcon sx={{ fontSize: 16 }} /> },
  { id: 'museums', label: 'Museums & Art', icon: <MuseumIcon sx={{ fontSize: 16 }} /> },
  { id: 'parks', label: 'Parks & Nature', icon: <ParkIcon sx={{ fontSize: 16 }} /> }
];

const SUGGESTED_QUERIES = [
  'Historical places in Jaipur',
  'Museums in Paris',
  'Temples near Kyoto',
  'Architectural landmarks in Rome',
  'Nature spots in Latur',
  'Free attractions in Delhi'
];

const SHOWCASE_DESTINATIONS = [
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Kyoto', lat: 35.0116, lon: 135.7681 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Latur', lat: 18.4088, lon: 76.5604 }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function getCategoryIcon(catId) {
  switch (catId) {
    case 'museums':
      return <MuseumIcon sx={{ fontSize: 18 }} />;
    case 'temples':
      return <AccountBalanceIcon sx={{ fontSize: 18 }} />;
    case 'monuments':
      return <CastleIcon sx={{ fontSize: 18 }} />;
    case 'parks':
      return <ParkIcon sx={{ fontSize: 18 }} />;
    default:
      return <PlaceIcon sx={{ fontSize: 18 }} />;
  }
}

function NewComponent(props) {
  // Safe backend URL resolution
  const API_URL =
    process.env.NODE_ENV === 'production'
      ? props.deployedBackendURL || ''
      : import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  // Parse location and query from searchData / searchQuery
  const parsedData = useMemo(() => {
    let rawItem = Array.isArray(props.searchData) ? props.searchData[0] : props.searchData;
    let queryStr = props.searchQuery || rawItem?.query || 'Historical places in Jaipur';

    let city = 'Jaipur';
    let country = 'India';
    let lat = 26.9124;
    let lon = 75.7873;

    const entities = rawItem?.entities || [];
    const locationEntity = entities.find(
      (e) => e.entityType === 'LOCATION' || e.wgName === 'LOCATION' || e.entityInfo?.geo
    );

    if (locationEntity) {
      if (locationEntity.entityInfo?.city) city = locationEntity.entityInfo.city;
      else if (locationEntity.word) city = locationEntity.word;

      if (locationEntity.entityInfo?.country) country = locationEntity.entityInfo.country;

      if (locationEntity.entityInfo?.geo?.lat) lat = parseFloat(locationEntity.entityInfo.geo.lat);
      if (locationEntity.entityInfo?.geo?.long || locationEntity.entityInfo?.geo?.lng) {
        lon = parseFloat(locationEntity.entityInfo.geo.long || locationEntity.entityInfo.geo.lng);
      }
    }

    // Infer category intent from user query
    const qLower = queryStr.toLowerCase();
    let initialCategory = 'all';
    if (qLower.includes('museum') || qLower.includes('art') || qLower.includes('gallery')) {
      initialCategory = 'museums';
    } else if (qLower.includes('temple') || qLower.includes('church') || qLower.includes('mosque') || qLower.includes('shrine')) {
      initialCategory = 'temples';
    } else if (qLower.includes('monument') || qLower.includes('fort') || qLower.includes('castle') || qLower.includes('landmark') || qLower.includes('historic')) {
      initialCategory = 'monuments';
    } else if (qLower.includes('park') || qLower.includes('garden') || qLower.includes('lake') || qLower.includes('nature')) {
      initialCategory = 'parks';
    }

    return { city, country, lat, lon, initialCategory, queryStr };
  }, [props.searchData, props.searchQuery]);

  // Main UI States
  const [activeCity, setActiveCity] = useState(parsedData.city);
  const [activeCountry, setActiveCountry] = useState(parsedData.country);
  const [activeCoords, setActiveCoords] = useState({ lat: parsedData.lat, lon: parsedData.lon });
  const [selectedCategory, setSelectedCategory] = useState(parsedData.initialCategory);
  const [currentQuery, setCurrentQuery] = useState(parsedData.queryStr);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status & Validation
  const [searchStatus, setSearchStatus] = useState(null); // 'location_not_found' | 'no_attractions' | 'success' | null
  const [statusMessage, setStatusMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'distance'

  // Weather State
  const [weather, setWeather] = useState(null);

  // Tab & View States: 0: Attractions, 1: Saved Places, 2: Day Itinerary
  const [activeTab, setActiveTab] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [detailModalPlace, setDetailModalPlace] = useState(null);

  // Saved / Bookmarked Places (LocalStorage persisted)
  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      const stored = localStorage.getItem('hyperdart_saved_places');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Day Itinerary (LocalStorage persisted)
  const [itinerary, setItinerary] = useState(() => {
    try {
      const stored = localStorage.getItem('hyperdart_day_itinerary');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Search History (LocalStorage persisted)
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('hyperdart_search_history');
      return stored ? JSON.parse(stored) : ['Historical places in Jaipur', 'Museums in Paris'];
    } catch {
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [componentReported, setComponentReported] = useState(false);

  // Ref to track last processed query to prevent redundant searches
  const lastProcessedQueryRef = useRef('');
  const cardRefs = useRef({});

  // Persist savedPlaces to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hyperdart_saved_places', JSON.stringify(savedPlaces));
    } catch (e) {
      console.warn('Could not persist saved places:', e);
    }
  }, [savedPlaces]);

  // Persist itinerary to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hyperdart_day_itinerary', JSON.stringify(itinerary));
    } catch (e) {
      console.warn('Could not persist itinerary:', e);
    }
  }, [itinerary]);

  // Persist search history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hyperdart_search_history', JSON.stringify(searchHistory));
    } catch (e) {
      console.warn('Could not persist search history:', e);
    }
  }, [searchHistory]);

  const addSearchToHistory = (query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered].slice(0, 5);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('hyperdart_search_history');
    } catch {}
    setSnackbarMsg('Search history cleared.');
  };

  // Fetch Live Weather for Destination
  useEffect(() => {
    if (!activeCoords.lat || !activeCoords.lon) return;
    fetch(`${API_URL}/api/weather?lat=${activeCoords.lat}&lon=${activeCoords.lon}`)
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch((err) => console.warn('Weather fetch failed:', err.message));
  }, [API_URL, activeCoords]);

  // Execute Search from Query (Top Search Box, Chips, or Initial Load)
  const executeSearch = (rawQuery) => {
    const query = (rawQuery || '').trim();
    if (!query) return;

    setCurrentQuery(query);
    addSearchToHistory(query);
    setIsSearching(true);
    setLoading(true);
    setError(null);
    setSearchStatus(null);
    setStatusMessage('');

    let searchCategory = 'all';
    const qLower = query.toLowerCase();
    if (qLower.includes('museum') || qLower.includes('gallery') || qLower.includes('art')) searchCategory = 'museums';
    else if (qLower.includes('temple') || qLower.includes('church') || qLower.includes('mosque') || qLower.includes('shrine')) searchCategory = 'temples';
    else if (qLower.includes('monument') || qLower.includes('fort') || qLower.includes('castle') || qLower.includes('historic')) searchCategory = 'monuments';
    else if (qLower.includes('park') || qLower.includes('garden') || qLower.includes('nature')) searchCategory = 'parks';

    setSelectedCategory(searchCategory);

    fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}&category=${searchCategory}`)
      .then((res) => res.json())
      .then((data) => {
        setIsSearching(false);
        setLoading(false);

        if (data.status === 'location_not_found') {
          setSearchStatus('location_not_found');
          setStatusMessage(data.message || `We couldn't recognize "${query}". Please check the spelling or enter a known city.`);
          setAttractions([]);
        } else if (data.status === 'no_attractions') {
          setSearchStatus('no_attractions');
          setStatusMessage(data.message || `No tourist attractions found near ${data.city || query}.`);
          setActiveCity(data.city || query);
          if (data.country) setActiveCountry(data.country);
          if (data.center) setActiveCoords(data.center);
          setAttractions([]);
        } else if (data.status === 'success') {
          setSearchStatus('success');
          setStatusMessage('');
          setActiveCity(data.city);
          if (data.country) setActiveCountry(data.country);
          if (data.center) setActiveCoords(data.center);
          if (data.category) setSelectedCategory(data.category);

          const validPlaces = (data.attractions || []).filter(
            (p) => !p.distanceKm || p.distanceKm <= 50
          );
          setAttractions(validPlaces);
          if (validPlaces.length > 0) setSelectedPlaceId(validPlaces[0].id);
        } else {
          setError(data.message || 'Search failed. Please try again.');
        }

        // Notify HyperDart platform that component is fully loaded
        if (!componentReported && props?.messageHandlers?.componentLoaded) {
          props.messageHandlers.componentLoaded();
          setComponentReported(true);
        }
      })
      .catch((err) => {
        setIsSearching(false);
        setLoading(false);
        console.error('Search request error:', err);
        setError('Connection error while searching. Please try again.');
        if (!componentReported && props?.messageHandlers?.componentLoaded) {
          props.messageHandlers.componentLoaded();
          setComponentReported(true);
        }
      });
  };

  // Synchronize directly with HyperDart TOP search bar (props.searchQuery and props.searchData)
  useEffect(() => {
    let rawItem = Array.isArray(props.searchData) ? props.searchData[0] : props.searchData;
    let query = props.searchQuery || rawItem?.query;

    if (!query && rawItem?.entities?.length) {
      const loc = rawItem.entities.find((e) => e.entityType === 'LOCATION' || e.wgName === 'LOCATION' || e.entityInfo?.geo);
      if (loc) {
        query = loc.entityInfo?.city || loc.word;
      }
    }

    if (!query) {
      query = 'Historical places in Jaipur';
    }

    const cleanQuery = query.trim();
    if (cleanQuery && cleanQuery !== lastProcessedQueryRef.current) {
      lastProcessedQueryRef.current = cleanQuery;
      executeSearch(cleanQuery);
    }
  }, [props.searchQuery, props.searchData]);

  // When a suggested query or destination chip is clicked:
  // Update the top search bar in HyperDart via messageHandlers and execute the search
  const handleSelectQuery = (query) => {
    lastProcessedQueryRef.current = query;
    if (props.messageHandlers?.searchQuery) {
      props.messageHandlers.searchQuery(query);
    }
    executeSearch(query);
  };

  // Switch destination helper
  const switchCity = (cityName, lat, lon) => {
    lastProcessedQueryRef.current = cityName;
    if (props.messageHandlers?.searchQuery) {
      props.messageHandlers.searchQuery(`places to visit in ${cityName}`);
    }
    executeSearch(`places to visit in ${cityName}`);
  };

  // Category filter changes (re-fetch within active coordinates)
  const handleCategoryFilter = (catId) => {
    setSelectedCategory(catId);
    setLoading(true);
    fetch(`${API_URL}/api/attractions?lat=${activeCoords.lat}&lon=${activeCoords.lon}&city=${encodeURIComponent(activeCity)}&category=${catId}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        const valid = (data.attractions || []).filter((p) => !p.distanceKm || p.distanceKm <= 50);
        setAttractions(valid);
        if (valid.length > 0) {
          setSelectedPlaceId(valid[0].id);
          setSearchStatus('success');
        } else {
          setSearchStatus('no_attractions');
          setStatusMessage(`No verified sights found for category "${catId}" near ${activeCity}.`);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error('Category filter failed:', err);
      });
  };

  // Bookmark / Save Place toggle
  const toggleSavePlace = (place) => {
    setSavedPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id);
      if (exists) {
        setSnackbarMsg(`Removed "${place.name}" from Saved Places.`);
        return prev.filter((p) => p.id !== place.id);
      } else {
        setSnackbarMsg(`Saved "${place.name}" to Bookmarks!`);
        return [...prev, place];
      }
    });
  };

  // Itinerary Add/Remove
  const toggleItinerary = (place) => {
    setItinerary((prev) => {
      const exists = prev.some((p) => p.id === place.id);
      if (exists) {
        setSnackbarMsg(`Removed "${place.name}" from Day Plan.`);
        return prev.filter((p) => p.id !== place.id);
      } else {
        setSnackbarMsg(`Added "${place.name}" to Day Plan!`);
        return [...prev, place];
      }
    });
  };

  // Move Itinerary Stop Up / Down
  const moveItineraryStop = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === itinerary.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...itinerary];
    const item = updated.splice(index, 1)[0];
    updated.splice(targetIndex, 0, item);
    setItinerary(updated);
  };

  // Smart Route Optimization (Nearest Neighbor Heuristic)
  const optimizeItineraryRoute = () => {
    if (itinerary.length <= 1) return;
    const unvisited = [...itinerary];
    const optimized = [];
    let currentLat = activeCoords.lat;
    let currentLon = activeCoords.lon;

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const dist = calculateDistance(currentLat, currentLon, unvisited[i].lat, unvisited[i].lon) || 0;
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }
      const nextPlace = unvisited.splice(nearestIdx, 1)[0];
      optimized.push(nextPlace);
      currentLat = nextPlace.lat;
      currentLon = nextPlace.lon;
    }

    setItinerary(optimized);
    setSnackbarMsg('Route optimized! Stops ordered sequentially to minimize transit distance.');
  };

  // Total Itinerary Route Distance
  const itineraryTotalDistance = useMemo(() => {
    if (itinerary.length === 0) return 0;
    let total = calculateDistance(activeCoords.lat, activeCoords.lon, itinerary[0].lat, itinerary[0].lon) || 0;
    for (let i = 0; i < itinerary.length - 1; i++) {
      total += calculateDistance(itinerary[i].lat, itinerary[i].lon, itinerary[i + 1].lat, itinerary[i + 1].lon) || 0;
    }
    return Math.round(total * 10) / 10;
  }, [itinerary, activeCoords]);

  // Total Estimated Duration for Itinerary
  const itineraryTotalTime = useMemo(() => {
    if (itinerary.length === 0) return '0 hrs';
    let totalHours = 0;
    itinerary.forEach((p) => {
      if (p.category === 'museums') totalHours += 2;
      else if (p.category === 'parks') totalHours += 1.5;
      else totalHours += 1;
    });
    return `~${totalHours} hrs`;
  }, [itinerary]);

  // Copy Itinerary Text
  const copyItinerary = () => {
    if (itinerary.length === 0) return;
    const text = [
      `🌟 1-Day Itinerary for ${activeCity} (${activeCountry || ''})`,
      `Est. Total Time: ${itineraryTotalTime} • Route Transit: ~${itineraryTotalDistance} km\n`,
      ...itinerary.map((p, idx) => {
        const timeSlot = idx === 0 ? '09:30 AM' : idx === 1 ? '12:30 PM' : idx === 2 ? '03:30 PM' : '06:30 PM';
        return `${idx + 1}. [${timeSlot}] ${p.name} - ${p.categoryLabel || p.category}\n   📍 ${p.address || 'Address in city'}\n   ⏱️ Est. Visit: ${p.visitDuration || '1 hr'}`;
      }),
      `\nGenerated via HyperDart Tourism Explorer`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setSnackbarMsg('Itinerary copied to clipboard!');
  };

  // Export Calendar (.ics file)
  const downloadICS = () => {
    if (itinerary.length === 0) return;
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HyperDart//Tourism Explorer//EN',
      ...itinerary.flatMap((p, idx) => [
        'BEGIN:VEVENT',
        `SUMMARY:Visit ${p.name} (${activeCity})`,
        `DESCRIPTION:${p.categoryLabel || p.category} - ${p.description || ''}`,
        `LOCATION:${p.address || activeCity}`,
        `DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        'DURATION:PT2H',
        'END:VEVENT'
      ]),
      'END:VCALENDAR'
    ];

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeCity}-Itinerary.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSnackbarMsg('Calendar file (.ics) downloaded!');
  };

  // Sorted attractions based on sortBy state
  const displayedAttractions = useMemo(() => {
    const list = [...attractions];
    if (sortBy === 'distance') {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else {
      list.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
    return list;
  }, [attractions, sortBy]);

  // Click on map pin to highlight & scroll to card
  const handlePinClick = (place) => {
    setSelectedPlaceId(place.id);
    if (cardRefs.current[place.id]) {
      cardRefs.current[place.id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const isSidebar = props.format === 'sidebar';

  // Editorial Theme Palette
  const themeColors = {
    bg: darkMode ? '#0c1017' : '#fcfbf8',
    cardBg: darkMode ? '#161b22' : '#ffffff',
    cardBorder: darkMode ? '#262c36' : '#edebe8',
    cardHoverBorder: darkMode ? '#0284c7' : '#0f766e',
    textMain: darkMode ? '#f0f6fc' : '#1c1917',
    textMuted: darkMode ? '#8b949e' : '#57534e',
    textSubtle: darkMode ? '#6e7681' : '#78716c',
    heroBg: darkMode
      ? 'linear-gradient(135deg, #091e3a 0%, #0d1117 100%)'
      : 'linear-gradient(135deg, #0f766e 0%, #1e3a8a 100%)',
    accentTeal: '#0f766e',
    accentBlue: '#0284c7',
    accentOrange: '#c2410c'
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isSidebar ? 420 : 920,
        margin: '0 auto',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: themeColors.textMain,
        bgcolor: themeColors.bg,
        borderRadius: 3.5,
        overflow: 'hidden',
        boxShadow: darkMode
          ? '0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px #21262d'
          : '0 8px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
        border: '1px solid',
        borderColor: themeColors.cardBorder,
        p: { xs: 1.5, sm: 2.5 },
        transition: 'background-color 0.25s ease, color 0.25s ease'
      }}
    >
      {/* Editorial Destination Header */}
      <Box
        sx={{
          background: themeColors.heroBg,
          borderRadius: 3,
          p: { xs: 2.25, sm: 3 },
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          mb: 2.5,
          boxShadow: '0 10px 28px -6px rgba(15, 118, 110, 0.25)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ maxWidth: '82%' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
              <PlaceIcon sx={{ fontSize: 18, color: '#a7f3d0' }} />
              <Typography
                variant="overline"
                sx={{ letterSpacing: 1.4, fontWeight: 800, color: '#a7f3d0', fontSize: '0.72rem' }}
              >
                HYPERDART TOURISM EXPLORER
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.5rem', sm: '1.9rem' } }}>
              Discover places worth the journey.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.75, fontSize: '0.875rem', lineHeight: 1.45, maxWidth: 640 }}>
              AI-assisted travel discovery for <strong>{activeCity}</strong>{activeCountry ? `, ${activeCountry}` : ''}. Grounded in real geographic coordinates, honest category curation, and time-optimized planning.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Dark / Light Mode Toggle */}
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                size="small"
                onClick={() => setDarkMode(!darkMode)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.26)' }
                }}
              >
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Chip
              size="small"
              label={`${attractions.length} Sights`}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                backdropFilter: 'blur(6px)'
              }}
            />
          </Stack>
        </Stack>

        {/* Live Weather Strip (Open-Meteo Integration) */}
        {weather && (
          <Box
            sx={{
              mt: 2,
              p: '8px 14px',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{weather.icon}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {weather.temperature}°C • {weather.condition}
              </Typography>
              <Typography variant="caption" sx={{ color: '#e0f2fe', display: { xs: 'none', sm: 'inline' } }}>
                • {weather.recommendation}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label="Live Weather"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: 'rgba(255,255,255,0.22)',
                color: '#ffffff',
                fontWeight: 700
              }}
            />
          </Box>
        )}

        {/* Top Search Guidance & Active Query Indicator */}
        <Box
          sx={{
            mt: 2.25,
            p: '10px 16px',
            borderRadius: 2.25,
            bgcolor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <SearchIcon sx={{ color: '#a7f3d0', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}>
              Active Search: <strong style={{ color: '#a7f3d0' }}>"{currentQuery || activeCity}"</strong>
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#e0f2fe', opacity: 0.85, fontSize: '0.75rem' }}>
            Type any place or category in the <strong>top search bar ⬆</strong> to explore
          </Typography>
        </Box>

        {/* Clickable Suggested Queries */}
        <Box sx={{ mt: 1.75, pt: 1.25, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="caption" sx={{ color: '#a7f3d0', fontWeight: 700, mr: 0.5, fontSize: '0.72rem' }}>
              Suggested Queries:
            </Typography>
            {SUGGESTED_QUERIES.map((sq) => (
              <Chip
                key={sq}
                size="small"
                clickable
                label={sq}
                onClick={() => handleSelectQuery(sq)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 22,
                  backdropFilter: 'blur(4px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Quick Destination Switcher */}
        <Box sx={{ mt: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="caption" sx={{ color: '#e0f2fe', fontWeight: 600, mr: 0.5, fontSize: '0.72rem' }}>
              Destinations:
            </Typography>
            {SHOWCASE_DESTINATIONS.map((c) => {
              const isActive = activeCity.toLowerCase().includes(c.name.toLowerCase());
              return (
                <Chip
                  key={c.name}
                  size="small"
                  clickable
                  label={c.name}
                  onClick={() => switchCity(c.name, c.lat, c.lon)}
                  sx={{
                    bgcolor: isActive ? '#ffffff' : 'rgba(255,255,255,0.16)',
                    color: isActive ? '#0f766e' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    height: 22
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Recent Search History (Clearable & Clickable) */}
      {searchHistory.length > 0 && (
        <Box sx={{ mb: 2, px: 0.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <HistoryIcon sx={{ fontSize: 16, color: themeColors.textSubtle }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: themeColors.textSubtle }}>
                Recent Searches
              </Typography>
            </Stack>
            <Button
              size="small"
              onClick={clearSearchHistory}
              sx={{ textTransform: 'none', fontSize: '0.68rem', color: themeColors.textSubtle, minWidth: 0, p: 0 }}
            >
              Clear
            </Button>
          </Stack>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {searchHistory.map((item) => (
              <Chip
                key={item}
                size="small"
                label={item}
                clickable
                onClick={() => handleSelectQuery(item)}
                sx={{
                  fontSize: '0.725rem',
                  height: 22,
                  bgcolor: darkMode ? '#1c2128' : '#f5f5f4',
                  color: themeColors.textMuted,
                  border: '1px solid',
                  borderColor: themeColors.cardBorder
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Main Navigation Tabs */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
        mb={2}
        sx={{ borderBottom: '1px solid', borderColor: themeColors.cardBorder, pb: 0.75 }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              py: 0.5,
              px: { xs: 1, sm: 2 },
              color: themeColors.textMuted,
              '&.Mui-selected': { color: themeColors.accentTeal }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: themeColors.accentTeal,
              height: 3,
              borderRadius: 1.5
            }
          }}
        >
          <Tab
            icon={<ExploreIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Attractions (${attractions.length})`}
          />
          <Tab
            icon={
              <Badge badgeContent={savedPlaces.length} color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                <BookmarkIcon sx={{ fontSize: 18 }} />
              </Badge>
            }
            iconPosition="start"
            label="Saved Places"
          />
          <Tab
            icon={
              <Badge badgeContent={itinerary.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                <CalendarMonthIcon sx={{ fontSize: 18 }} />
              </Badge>
            }
            iconPosition="start"
            label="Day Itinerary"
          />
        </Tabs>

        {activeTab === 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Sorting control */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  height: 32,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  bgcolor: darkMode ? '#1c2128' : '#ffffff',
                  color: themeColors.textMain,
                  borderRadius: 1.75,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeColors.cardBorder
                  }
                }}
              >
                <MenuItem value="relevance" sx={{ fontSize: '0.78rem' }}>
                  Best Match
                </MenuItem>
                <MenuItem value="distance" sx={{ fontSize: '0.78rem' }}>
                  Nearest First
                </MenuItem>
              </Select>
            </FormControl>

            {/* Radar / Map Toggle */}
            <Tooltip title={showMap ? 'Hide visual map' : 'Show interactive radar map'}>
              <Button
                size="small"
                variant={showMap ? 'contained' : 'outlined'}
                startIcon={<MapIcon />}
                onClick={() => setShowMap(!showMap)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.75,
                  fontSize: '0.78rem',
                  height: 32,
                  bgcolor: showMap ? themeColors.accentTeal : undefined,
                  borderColor: themeColors.cardBorder,
                  color: showMap ? '#ffffff' : themeColors.textMuted
                }}
              >
                {showMap ? 'Hide Map' : 'Map View'}
              </Button>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {/* Category Pills (Active on Attractions Tab) */}
      {activeTab === 0 && (
        <Box sx={{ overflowX: 'auto', pb: 1, mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Chip
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.label}
                  clickable
                  onClick={() => handleCategoryFilter(cat.id)}
                  sx={{
                    bgcolor: isActive ? themeColors.accentTeal : darkMode ? '#161b22' : '#ffffff',
                    color: isActive ? '#ffffff' : themeColors.textMuted,
                    border: '1px solid',
                    borderColor: isActive ? themeColors.accentTeal : themeColors.cardBorder,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    height: 30,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isActive ? '#115e59' : darkMode ? '#21262d' : '#f5f5f4'
                    },
                    '& .MuiChip-icon': {
                      color: isActive ? '#ffffff' : themeColors.textSubtle
                    }
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {/* STATE 1: LOCATION NOT FOUND */}
      {searchStatus === 'location_not_found' && (
        <Card
          sx={{
            p: 3.5,
            mb: 2.5,
            borderRadius: 3,
            border: '1px solid #fecaca',
            bgcolor: darkMode ? '#2d1515' : '#fff5f5',
            textAlign: 'center'
          }}
        >
          <WrongLocationIcon sx={{ fontSize: 48, color: '#ef4444', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: darkMode ? '#fca5a5' : '#991b1b', mb: 0.75 }}>
            Location Not Recognized
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? '#fecaca' : '#b91c1c', maxWidth: 500, mx: 'auto', mb: 2.5 }}>
            {statusMessage || "We couldn't recognize this place name. Please check the spelling or search in the top search bar for a recognized city or region."}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: darkMode ? '#fca5a5' : '#7f1d1d', fontWeight: 700, mb: 1.5 }}>
            Popular destinations you can try:
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
            {['Jaipur', 'Kyoto', 'Paris', 'Rome', 'New York', 'Delhi', 'Latur'].map((c) => (
              <Chip
                key={c}
                label={c}
                clickable
                size="small"
                onClick={() => handleSelectQuery(`places to visit in ${c}`)}
                sx={{
                  bgcolor: darkMode ? '#451a1a' : '#ffffff',
                  border: '1px solid #fca5a5',
                  color: darkMode ? '#fca5a5' : '#991b1b',
                  fontWeight: 700
                }}
              />
            ))}
          </Stack>
        </Card>
      )}

      {/* STATE 2: NO ATTRACTIONS FOUND */}
      {searchStatus === 'no_attractions' && (
        <Card
          sx={{
            p: 3.5,
            mb: 2.5,
            borderRadius: 3,
            border: '1px solid #fed7aa',
            bgcolor: darkMode ? '#2d180b' : '#fffaf5',
            textAlign: 'center'
          }}
        >
          <LocationOffIcon sx={{ fontSize: 48, color: '#f97316', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: darkMode ? '#fdba74' : '#9a3412', mb: 0.75 }}>
            No Attractions Found For "{selectedCategory}" in {activeCity}
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? '#ffedd5' : '#c2410c', maxWidth: 520, mx: 'auto', mb: 2.5 }}>
            {statusMessage || `We found no verified attractions under category "${selectedCategory}" in ${activeCity}. You can browse all available sights or explore a nearby city.`}
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              size="small"
              onClick={() => handleCategoryFilter('all')}
              sx={{ bgcolor: '#ea580c', color: '#ffffff', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Show All Sights in {activeCity}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => switchCity('Paris', 48.8566, 2.3522)}
              sx={{ borderColor: '#ea580c', color: darkMode ? '#fdba74' : '#c2410c', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Explore Paris
            </Button>
          </Stack>
        </Card>
      )}

      {/* Synchronized Interactive Radar Map View */}
      {activeTab === 0 && showMap && attractions.length > 0 && (
        <Card
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 3,
            border: '1px solid',
            borderColor: themeColors.cardBorder,
            bgcolor: themeColors.cardBg,
            boxShadow: 'none'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.25}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <NavigationIcon sx={{ fontSize: 16, color: themeColors.accentTeal }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                Geographic Distribution • {activeCity}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: themeColors.textSubtle }}>
              Click any pin (#1 - #{attractions.length}) to focus and locate the attraction card
            </Typography>
          </Stack>

          {/* SVG Map Canvas */}
          <Box
            sx={{
              position: 'relative',
              height: 200,
              bgcolor: darkMode ? '#090d14' : '#f7f6f2',
              borderRadius: 2.25,
              border: '1px solid',
              borderColor: themeColors.cardBorder,
              overflow: 'hidden'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {/* Concentric distance reference rings */}
              <circle cx="200" cy="100" r="85" fill="none" stroke={darkMode ? '#21262d' : '#e2e8f0'} strokeDasharray="3 3" />
              <circle cx="200" cy="100" r="50" fill="none" stroke={darkMode ? '#21262d' : '#e2e8f0'} strokeDasharray="2 2" />
              <circle cx="200" cy="100" r="6" fill="#0f766e" />
              <text x="210" y="104" fontSize="10" fill={darkMode ? '#2dd4bf' : '#0f766e'} fontWeight="bold">
                {activeCity} (Center)
              </text>
              <text x="200" y="47" fontSize="8" fill={darkMode ? '#4b5563' : '#9ca3af'} textAnchor="middle">
                ~10 km radius
              </text>
              <text x="200" y="12" fontSize="8" fill={darkMode ? '#4b5563' : '#9ca3af'} textAnchor="middle">
                ~25 km radius
              </text>

              {displayedAttractions.map((place, idx) => {
                const dLat = (place.lat - activeCoords.lat) * 2200;
                const dLon = (place.lon - activeCoords.lon) * 2200;
                const cx = Math.max(25, Math.min(375, 200 + dLon));
                const cy = Math.max(25, Math.min(175, 100 - dLat));
                const isSelected = selectedPlaceId === place.id;

                return (
                  <g
                    key={place.id}
                    onClick={() => handlePinClick(place)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 14 : 9}
                      fill={isSelected ? '#c2410c' : '#0f766e'}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    <text
                      x={cx}
                      y={cy + 3.5}
                      fontSize="9"
                      fill="#ffffff"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Box>
        </Card>
      )}

      {/* TAB 0: TOP ATTRACTIONS LIST (CLEAN CARDS WITHOUT IMAGES) */}
      {activeTab === 0 && searchStatus !== 'location_not_found' && searchStatus !== 'no_attractions' && (
        <Box>
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((n) => (
                <Card key={n} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: themeColors.cardBg, border: '1px solid', borderColor: themeColors.cardBorder }}>
                  <Skeleton variant="text" width="50%" height={32} />
                  <Skeleton variant="text" width="30%" height={22} sx={{ my: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1.5, mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Card>
              ))}
            </Stack>
          ) : error ? (
            <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
              {error}
            </Alert>
          ) : displayedAttractions.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: themeColors.cardBg }}>
              <PlaceIcon sx={{ fontSize: 48, color: themeColors.textSubtle, mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                No attractions found for "{selectedCategory}" in {activeCity}
              </Typography>
              <Typography variant="body2" sx={{ color: themeColors.textMuted, mb: 2 }}>
                Try selecting "All Sights" to view everything in {activeCity}.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => handleCategoryFilter('all')}>
                Show All Sights
              </Button>
            </Card>
          ) : (
            <Stack spacing={2}>
              {displayedAttractions.map((place, index) => {
                const inItinerary = itinerary.some((p) => p.id === place.id);
                const isSaved = savedPlaces.some((p) => p.id === place.id);
                const isSelected = selectedPlaceId === place.id;

                return (
                  <Card
                    key={place.id}
                    ref={(el) => (cardRefs.current[place.id] = el)}
                    onClick={() => setSelectedPlaceId(place.id)}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isSelected ? themeColors.accentTeal : themeColors.cardBorder,
                      boxShadow: isSelected
                        ? '0 8px 24px -4px rgba(15, 118, 110, 0.22)'
                        : '0 2px 8px rgba(0,0,0,0.03)',
                      bgcolor: themeColors.cardBg,
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: themeColors.cardHoverBorder,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                      {/* Top Row: Index Marker Avatar, Title & Match Score & Save Bookmark */}
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {/* Number Pin Index & Category Icon */}
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            minWidth: 38,
                            borderRadius: 2.25,
                            bgcolor: isSelected ? themeColors.accentTeal : darkMode ? '#1c2430' : '#f0fdfa',
                            color: isSelected ? '#ffffff' : '#0f766e',
                            border: '1px solid',
                            borderColor: isSelected ? themeColors.accentTeal : darkMode ? '#263345' : '#ccfbf1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 0.25
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1 }}>
                            {index + 1}
                          </Typography>
                          <Box sx={{ fontSize: '0.65rem', lineHeight: 1, mt: 0.25 }}>
                            {getCategoryIcon(place.category)}
                          </Box>
                        </Box>

                        {/* Title and Header Badges */}
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800,
                                lineHeight: 1.25,
                                fontSize: '1.1rem',
                                color: themeColors.textMain,
                                cursor: 'pointer',
                                '&:hover': { color: themeColors.accentTeal }
                              }}
                              onClick={() => setDetailModalPlace(place)}
                            >
                              {place.name}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                              {place.relevanceScore != null && (
                                <Chip
                                  size="small"
                                  icon={<AutoAwesomeIcon sx={{ fontSize: '0.75rem !important', color: '#0f766e !important' }} />}
                                  label={`${place.relevanceScore}% Match`}
                                  sx={{
                                    height: 22,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    bgcolor: darkMode ? '#042f2e' : '#f0fdfa',
                                    color: '#0f766e',
                                    border: '1px solid',
                                    borderColor: darkMode ? '#115e59' : '#ccfbf1'
                                  }}
                                />
                              )}

                              <Tooltip title={isSaved ? 'Remove from Saved' : 'Save to Bookmarks'}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSavePlace(place);
                                  }}
                                  sx={{
                                    color: isSaved ? '#f59e0b' : themeColors.textSubtle,
                                    p: 0.5
                                  }}
                                >
                                  {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>

                          {/* Metadata Tags: Category, Distance, Duration */}
                          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ my: 0.85 }}>
                            <Chip
                              size="small"
                              label={place.categoryLabel || place.category}
                              sx={{
                                bgcolor: darkMode ? '#162338' : '#e0f2fe',
                                color: darkMode ? '#7dd3fc' : '#0369a1',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                height: 22
                              }}
                            />
                            {place.distanceKm != null && place.distanceKm <= 50 && (
                              <Chip
                                size="small"
                                icon={<NavigationIcon sx={{ fontSize: '0.75rem !important' }} />}
                                label={`${place.distanceKm} km from center`}
                                sx={{
                                  bgcolor: darkMode ? '#1e293b' : '#f1f5f9',
                                  color: themeColors.textMuted,
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 22
                                }}
                              />
                            )}
                            {place.visitDuration && (
                              <Chip
                                size="small"
                                icon={<AccessTimeIcon sx={{ fontSize: '0.75rem !important' }} />}
                                label={place.visitDuration}
                                sx={{
                                  bgcolor: darkMode ? '#222831' : '#f5f5f4',
                                  color: themeColors.textMuted,
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 22
                                }}
                              />
                            )}
                          </Stack>

                          {/* Grounded "Why this place?" Banner */}
                          {place.whyThisPlace && (
                            <Box
                              sx={{
                                mb: 1.25,
                                p: '7px 12px',
                                borderRadius: 1.75,
                                bgcolor: darkMode ? '#0b1d28' : '#f0fdfa',
                                borderLeft: '3px solid',
                                borderColor: themeColors.accentTeal,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75
                              }}
                            >
                              <Typography variant="caption" sx={{ color: darkMode ? '#a7f3d0' : '#0f766e', fontWeight: 600, fontSize: '0.78rem', lineHeight: 1.4 }}>
                                <strong>Why visit:</strong> {place.whyThisPlace}
                              </Typography>
                            </Box>
                          )}

                          {/* Description */}
                          {place.description && (
                            <Typography variant="body2" sx={{ color: themeColors.textMuted, fontSize: '0.86rem', mb: 1, lineHeight: 1.45 }}>
                              {place.description}
                            </Typography>
                          )}

                          {/* Address */}
                          {place.address && (
                            <Typography variant="caption" sx={{ color: themeColors.textSubtle, display: 'block', mb: 1.25 }}>
                              📍 {place.address}
                            </Typography>
                          )}

                          <Divider sx={{ my: 1.25, borderColor: themeColors.cardBorder }} />

                          {/* Card Actions */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<DirectionsIcon fontSize="small" />}
                                href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                                target="_blank"
                                rel="noreferrer"
                                sx={{ textTransform: 'none', fontSize: '0.775rem', fontWeight: 600, color: themeColors.accentTeal }}
                              >
                                Directions
                              </Button>

                              <Button
                                size="small"
                                variant="text"
                                startIcon={<InfoOutlinedIcon fontSize="small" />}
                                onClick={() => setDetailModalPlace(place)}
                                sx={{ textTransform: 'none', fontSize: '0.775rem', fontWeight: 600, color: themeColors.textMuted }}
                              >
                                Details
                              </Button>
                            </Stack>

                            {/* Add to Day Itinerary Button */}
                            <Button
                              size="small"
                              variant={inItinerary ? 'contained' : 'outlined'}
                              color={inItinerary ? 'success' : 'primary'}
                              startIcon={inItinerary ? <CheckCircleIcon fontSize="small" /> : <AddCircleOutlineIcon fontSize="small" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItinerary(place);
                              }}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                borderRadius: 2,
                                bgcolor: inItinerary ? '#15803d' : undefined,
                                borderColor: !inItinerary ? themeColors.accentTeal : undefined,
                                color: !inItinerary ? themeColors.accentTeal : '#ffffff',
                                '&:hover': {
                                  bgcolor: inItinerary ? '#166534' : 'rgba(15, 118, 110, 0.08)'
                                }
                              }}
                            >
                              {inItinerary ? 'In Day Plan' : 'Add to Day Plan'}
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* TAB 1: SAVED PLACES (BOOKMARKS) */}
      {activeTab === 1 && (
        <Box>
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2.5,
              bgcolor: themeColors.cardBg,
              border: '1px solid',
              borderColor: themeColors.cardBorder
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                  Saved Attractions • Bookmarks
                </Typography>
                <Typography variant="body2" sx={{ color: themeColors.textMuted, fontSize: '0.85rem' }}>
                  {savedPlaces.length} attractions saved in your local collection
                </Typography>
              </Box>

              {savedPlaces.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CalendarMonthIcon fontSize="small" />}
                    onClick={() => {
                      savedPlaces.forEach((sp) => {
                        if (!itinerary.some((it) => it.id === sp.id)) {
                          setItinerary((prev) => [...prev, sp]);
                        }
                      });
                      setSnackbarMsg('Added all saved places to Day Itinerary!');
                      setActiveTab(2);
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, bgcolor: themeColors.accentTeal }}
                  >
                    Add All to Day Plan
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => {
                      setSavedPlaces([]);
                      setSnackbarMsg('All saved places cleared.');
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Clear All
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>

          {savedPlaces.length === 0 ? (
            <Card sx={{ p: 4.5, textAlign: 'center', borderRadius: 3, bgcolor: themeColors.cardBg, border: '1px solid', borderColor: themeColors.cardBorder }}>
              <BookmarkBorderIcon sx={{ fontSize: 48, color: themeColors.textSubtle, mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                No saved attractions yet
              </Typography>
              <Typography variant="body2" sx={{ color: themeColors.textMuted, mb: 2.5, maxWidth: 440, mx: 'auto' }}>
                Click the bookmark icon on any attraction card to save it here for future planning.
              </Typography>
              <Button variant="contained" size="small" onClick={() => setActiveTab(0)} sx={{ bgcolor: themeColors.accentTeal, textTransform: 'none', fontWeight: 700 }}>
                Explore Attractions
              </Button>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {savedPlaces.map((place) => {
                const inItinerary = itinerary.some((p) => p.id === place.id);
                return (
                  <Card
                    key={place.id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: themeColors.cardBorder,
                      bgcolor: themeColors.cardBg
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                          {place.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textMuted, display: 'block' }}>
                          {place.categoryLabel || place.category} • {place.distanceKm != null ? `${place.distanceKm} km from center` : 'In City'}
                        </Typography>
                        {place.address && (
                          <Typography variant="caption" sx={{ color: themeColors.textSubtle, display: 'block', mt: 0.25 }}>
                            📍 {place.address}
                          </Typography>
                        )}
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant={inItinerary ? 'contained' : 'outlined'}
                          color={inItinerary ? 'success' : 'primary'}
                          onClick={() => toggleItinerary(place)}
                          sx={{ textTransform: 'none', fontSize: '0.725rem', fontWeight: 700, borderRadius: 1.75 }}
                        >
                          {inItinerary ? 'In Plan' : '+ Day Plan'}
                        </Button>
                        <IconButton size="small" color="error" onClick={() => toggleSavePlace(place)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* TAB 2: SMART 1-DAY ITINERARY PLANNER */}
      {activeTab === 2 && (
        <Box>
          <Box
            sx={{
              p: 2.25,
              mb: 2,
              borderRadius: 2.5,
              bgcolor: themeColors.cardBg,
              border: '1px solid',
              borderColor: themeColors.cardBorder
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                  Sequential 1-Day Itinerary • {activeCity}
                </Typography>
                <Typography variant="body2" sx={{ color: themeColors.textMuted, fontSize: '0.85rem' }}>
                  {itinerary.length} destinations scheduled • Est. Visit Duration: {itineraryTotalTime} • Route Transit: ~{itineraryTotalDistance} km
                </Typography>
              </Box>

              {itinerary.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Tooltip title="Optimize route using Nearest Neighbor heuristic to minimize walking & transit distance">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AutoFixHighIcon fontSize="small" />}
                      onClick={optimizeItineraryRoute}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, bgcolor: themeColors.accentTeal }}
                    >
                      Optimize Route
                    </Button>
                  </Tooltip>

                  <Tooltip title="Copy formatted text to share on WhatsApp or notes">
                    <IconButton size="small" onClick={copyItinerary} sx={{ border: '1px solid', borderColor: themeColors.cardBorder }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download .ics file for Google / Apple Calendar">
                    <IconButton size="small" onClick={downloadICS} sx={{ border: '1px solid', borderColor: themeColors.cardBorder }}>
                      <EventAvailableIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => {
                      setItinerary([]);
                      setSnackbarMsg('Itinerary cleared.');
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Clear
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>

          {itinerary.length === 0 ? (
            <Card sx={{ p: 4.5, textAlign: 'center', borderRadius: 3, bgcolor: themeColors.cardBg, border: '1px solid', borderColor: themeColors.cardBorder }}>
              <CalendarMonthIcon sx={{ fontSize: 48, color: themeColors.textSubtle, mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                Your day plan is empty
              </Typography>
              <Typography variant="body2" sx={{ color: themeColors.textMuted, mb: 2.5, maxWidth: 440, mx: 'auto' }}>
                Click "+ Add to Day Plan" on any attraction card to schedule your 1-day exploration.
              </Typography>
              <Button variant="contained" size="small" onClick={() => setActiveTab(0)} sx={{ bgcolor: themeColors.accentTeal, textTransform: 'none', fontWeight: 700 }}>
                Browse Attractions
              </Button>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {itinerary.map((place, idx) => {
                const timeSlot =
                  idx === 0
                    ? 'Morning (09:30 AM - 11:30 AM)'
                    : idx === 1
                    ? 'Midday (12:00 PM - 02:00 PM)'
                    : idx === 2
                    ? 'Afternoon (02:30 PM - 04:30 PM)'
                    : idx === 3
                    ? 'Late Afternoon (05:00 PM - 06:30 PM)'
                    : 'Evening (07:00 PM onwards)';

                return (
                  <Card
                    key={place.id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: themeColors.cardBorder,
                      bgcolor: themeColors.cardBg
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {/* Stop Number Index */}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: darkMode ? '#0c322c' : '#ccfbf1',
                            color: '#0f766e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem'
                          }}
                        >
                          {idx + 1}
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: themeColors.accentTeal, fontWeight: 800 }}>
                            {timeSlot}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textMain }}>
                            {place.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textMuted }}>
                            {place.categoryLabel || place.category} • Est: {place.visitDuration || '1.5 hrs'} • {place.distanceKm != null ? `${place.distanceKm} km from center` : 'In City'}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Reorder and Delete Actions */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton
                          size="small"
                          disabled={idx === 0}
                          onClick={() => moveItineraryStop(idx, 'up')}
                          sx={{ color: themeColors.textSubtle }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={idx === itinerary.length - 1}
                          onClick={() => moveItineraryStop(idx, 'down')}
                          sx={{ color: themeColors.textSubtle }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => toggleItinerary(place)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}

              {/* Sequential Transit Guidance Box */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: darkMode ? '#052e16' : '#f0fdf4',
                  border: '1px solid',
                  borderColor: darkMode ? '#14532d' : '#bbf7d0'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: darkMode ? '#86efac' : '#166534' }}>
                  ✓ Route Geographically Ordered
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? '#bbf7d0' : '#15803d' }}>
                  Total estimated transit between stops: ~{itineraryTotalDistance} km. Total visit duration: {itineraryTotalTime}. Click "Optimize Route" to order sequentially.
                </Typography>
              </Card>
            </Stack>
          )}
        </Box>
      )}

      {/* Place Detail Modal (Clean without images) */}
      {detailModalPlace && (
        <Dialog
          open={Boolean(detailModalPlace)}
          onClose={() => setDetailModalPlace(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              p: 1.5,
              bgcolor: themeColors.cardBg,
              color: themeColors.textMain,
              border: '1px solid',
              borderColor: themeColors.cardBorder
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>{detailModalPlace.name}</DialogTitle>
          <DialogContent>
            <Stack direction="row" spacing={1} sx={{ my: 1 }} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={detailModalPlace.categoryLabel || detailModalPlace.category}
                sx={{ bgcolor: themeColors.accentTeal, color: '#ffffff', fontWeight: 700 }}
              />
              {detailModalPlace.distanceKm != null && detailModalPlace.distanceKm <= 50 && (
                <Chip size="small" label={`${detailModalPlace.distanceKm} km from center`} />
              )}
              {detailModalPlace.visitDuration && (
                <Chip size="small" label={`⏱️ ${detailModalPlace.visitDuration}`} />
              )}
            </Stack>

            {detailModalPlace.whyThisPlace && (
              <Box sx={{ p: 1.5, my: 1.5, borderRadius: 2, bgcolor: darkMode ? '#042f2e' : '#f0fdfa', border: '1px solid', borderColor: '#ccfbf1' }}>
                <Typography variant="body2" sx={{ color: '#0f766e', fontWeight: 600 }}>
                  🌟 <strong>Why Visit:</strong> {detailModalPlace.whyThisPlace}
                </Typography>
              </Box>
            )}

            {detailModalPlace.description && (
              <Typography variant="body2" sx={{ color: themeColors.textMuted, my: 1.5, lineHeight: 1.5 }}>
                {detailModalPlace.description}
              </Typography>
            )}

            {detailModalPlace.address && (
              <Typography variant="caption" sx={{ display: 'block', color: themeColors.textSubtle, mt: 1 }}>
                📍 Full Address: {detailModalPlace.address}
              </Typography>
            )}

            <Typography variant="caption" sx={{ display: 'block', color: themeColors.accentTeal, fontWeight: 600, mt: 1.5 }}>
              Coordinates: {detailModalPlace.lat}, {detailModalPlace.lon}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DirectionsIcon />}
              href={`https://www.google.com/maps/dir/?api=1&destination=${detailModalPlace.lat},${detailModalPlace.lon}`}
              target="_blank"
              rel="noreferrer"
              sx={{ textTransform: 'none', fontWeight: 600, borderColor: themeColors.cardBorder, color: themeColors.textMuted }}
            >
              Directions
            </Button>
            <Button
              variant="outlined"
              startIcon={savedPlaces.some((p) => p.id === detailModalPlace.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              onClick={() => toggleSavePlace(detailModalPlace)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {savedPlaces.some((p) => p.id === detailModalPlace.id) ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                toggleItinerary(detailModalPlace);
                setDetailModalPlace(null);
              }}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: themeColors.accentTeal }}
            >
              {itinerary.some((p) => p.id === detailModalPlace.id) ? 'Remove from Plan' : 'Add to Day Plan'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Instant Feedback Toast */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={2800}
        onClose={() => setSnackbarMsg('')}
        message={snackbarMsg}
      />

      {/* HyperDart Source Footer */}
      <Box sx={{ mt: 3, pt: 1.5, borderTop: '1px solid', borderColor: themeColors.cardBorder, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: themeColors.textSubtle, fontSize: '0.725rem' }}>
          HyperDart Tourism Explorer • Grounded Tourism Discovery • Geoapify Places & Open-Meteo API
        </Typography>
      </Box>
    </Box>
  );
}

export default NewComponent;