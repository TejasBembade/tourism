# 🌍 HyperDart Tourism Explorer

> **AI-Assisted Tourism Discovery Engine for HyperDart Hackathon**  
> An editorial-grade, recruiter-ready tourism discovery application that answers:  
> *"What are the most worthwhile attractions to visit in this destination, why should I visit them, and how can I plan my time efficiently?"*

---

## 🏛️ Project Overview

**HyperDart Tourism Explorer** transforms ordinary search queries into rich, grounded travel discovery experiences. Built as a native HyperDart component wrapped with `withHD`, it combines natural language query processing, live geographic coordinates, honest category curation, real-time weather forecasts, and time-optimized day itineraries.

### 🌟 Key Highlights
- **Natural-Language Travel Intelligence**: Understands conversational intent (e.g., *"Historical places to visit in Jaipur"*, *"Museums in Paris"*, *"Temples near Kyoto"*, *"Nature spots in Latur"*).
- **Grounded "Why This Place?" Reasoning**: Explains transparently why each attraction matches the query based on category, interest tags, and distance from city center—preventing fabricated AI claims.
- **Editorial Travel Design**: Modern aesthetic inspired by premium travel journals—warm alabaster backgrounds (`#fcfbf8`), deep charcoal typography, forest teal & ocean sapphire accents, high-res photography, and dark/light mode.
- **Truthful Data Integrity**:
  - Excludes commercial hotels, restaurants, and shops.
  - Restricts attractions to a strict 50km radius around the target city.
  - Zero fabricated star ratings or invented reviews (reports factual details directly from Geoapify and OpenStreetMap).
  - Distinguishes empty or unverified locations honestly instead of defaulting to unrelated cities like Paris.
- **Sequential 1-Day Itinerary Planner**:
  - Add and remove stops with persistent browser storage (`localStorage`).
  - Reorder stops manually (Up / Down) or use **Optimize Route** (Nearest Neighbor geographic heuristic).
  - Dynamic total visit duration and transit distance calculation.
  - One-click **Export to Calendar (.ics)** and **Copy to Clipboard**.
- **Interactive Synchronized Radar Map**:
  - SVG radar visualization with 10 km and 25 km distance rings.
  - Click any numbered pin (#1–#20) to focus and highlight the corresponding attraction card.
- **Live Weather Integration**: Real-time temperature, condition, and contextual outdoor/indoor advice powered by **Open-Meteo**.
- **Saved Places (Bookmarks)** & **Search History**: Instant local bookmarks tab and recent searches with clearable history.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite 6 | Lightning-fast component rendering & HMR |
| **Design System** | MUI 6, Emotion, Custom CSS | Editorial typography, responsive cards, dark/light theme |
| **Backend Runtime** | Cloudflare Workers, Wrangler | Edge-deployed API handler matching HyperDart specs |
| **Backend Framework**| Express.js 5 | Lightweight REST routing for workers |
| **Data Providers** | Geoapify Places v2, Geocoding API | Verified tourist sights, historic monuments, museums |
| **Weather Provider** | Open-Meteo REST API | Live weather conditions, temperature, recommendations |
| **NLP Engine** | `tourismIntelligence.js` | Destination extraction, category inference, match scoring |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Environment Setup
The backend utilizes Cloudflare Wrangler with `.dev.vars` for local secrets.
In `src/backend/.dev.vars`:
```bash

ENVIRONMENT=development
```
*(Note: `.dev.vars` is git-ignored to prevent credential leaks).*

### 3. Running Frontend & Backend Locally

**Terminal 1 — Frontend (Vite Dev Server):**
```bash
cd hyperdart-app
npm start
# Runs Vite on http://localhost:5173/
```

**Terminal 2 — Backend (Cloudflare Worker):**
```bash
cd hyperdart-app/src/backend
npm start
# Runs Wrangler on http://127.0.0.1:3001/
```

Open your browser to:
- Sandbox view: [http://localhost:5173/](http://localhost:5173/)
- Fullscreen component view: [http://localhost:5173/?fullscreen=hyperdart-app](http://localhost:5173/?fullscreen=hyperdart-app)

---

## 🧪 Production Build & Verification

To verify that the code compiles cleanly for production:

```bash
# 1. Build the frontend component bundle
cd hyperdart-app
npm run build

# 2. Build the backend Cloudflare Worker bundle
cd src/backend
npm run build
```
Both builds should pass with **0 errors**.

---

## 🎯 Recommended Showcase Demo Queries

Try these 4 queries to evaluate the intelligence and data handling:

1. **`Historical places in Jaipur`**
   - *Highlights*: Natural language query processing, extracts Jaipur and maps to `monuments` category. Displays Jal Mahal, Amber Fort, and Hawa Mahal with grounded reasons ("Recognized heritage landmark..."), visit durations (45–90 mins), and 99% match scores.
2. **`Museums in Paris`**
   - *Highlights*: Immediate category detection for art/museums, displays the Louvre, Musée d'Orsay, and Centre Pompidou with cultural recommendations.
3. **`Temples near Kyoto`**
   - *Highlights*: Sacred/spiritual place filtering, displays iconic shrines (Fushimi Inari, Kinkaku-ji) with distance tags from Kyoto center.
4. **`xyzqwertynonexistent` (or misspelled location)**
   - *Highlights*: Truthful error handling. Shows a graceful "Location Not Recognized" card with clickable suggestion chips (Jaipur, Kyoto, Paris, Rome, New York, Delhi, Latur) for instant recovery.

---

## 📂 Project Structure

```
hyperdart-app/
├── hyperdart.config.js          # Component manifest, search triggers, regex
├── package.json                 # Frontend dependencies & build scripts
├── src/
│   ├── frontend/
│   │   ├── index.jsx            # withHD wrapper (read-only requirement)
│   │   └── NewComponent.jsx     # Master Tourism Explorer React Component
│   └── backend/
│       ├── index.js             # Express API on Cloudflare Worker
│       ├── tourismIntelligence.js # NLP query parser, match scorer, why-visit logic
│       ├── wrangler.jsonc       # Worker configuration
│       ├── .dev.vars            # Local environment secrets (Geoapify key)
│       └── package.json         # Worker dependencies & build scripts
└── README.md                    # Project documentation
```

---

## 🏆 Hackathon Compliance Checklist

- [x] Answers *"What are the most worthwhile attractions, why visit them, and how to plan?"*
- [x] Preserves `withHD` in `src/frontend/index.jsx`.
- [x] Zero mock or fabricated ratings (strictly truthful data).
- [x] Filters out restaurants, hotels, and retail stores from attractions.
- [x] Grounded "Why this place?" explanation on every card.
- [x] Interactive SVG Radar Map synchronized with card clicks.
- [x] Sequential 1-Day Itinerary with Nearest-Neighbor route optimization.
- [x] Export to Calendar (.ics) and copy to clipboard.
- [x] Saved Places (Bookmarks) tab with `localStorage` persistence.
- [x] Search history chips with clear functionality.
- [x] Live Open-Meteo weather integration.
- [x] Editorial travel aesthetic with dark/light mode toggle.
