<div align="center">

<h1>🌍 HyperDart Tourism Explorer</h1>

<p><strong>AI-powered travel discovery — built for the HyperDart Hackathon 2026</strong></p>

<p>
  <img src="https://img.shields.io/badge/HyperDart-Hackathon%202026-6C47FF?style=for-the-badge&logo=rocket&logoColor=white" alt="Hackathon"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
  <img src="https://img.shields.io/badge/Geoapify-Places%20API-4CAF50?style=for-the-badge" alt="Geoapify"/>
  <img src="https://img.shields.io/badge/Open--Meteo-Weather%20API-00BCD4?style=for-the-badge" alt="Open-Meteo"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT"/>
</p>

<p>
  <a href="https://youtu.be/5InYmNZecLY"><strong>▶ Watch Demo Video</strong></a> &nbsp;|&nbsp;
  <a href="https://github.com/TejasBembade"><strong>👤 GitHub Profile</strong></a>
</p>

<br/>

> *"What are the most worthwhile attractions to visit here, why should I care, and how do I plan my day efficiently?"*
>
> **HyperDart Tourism Explorer answers all three — instantly, honestly, and beautifully.**

</div>

---

## 🏆 Why This Project Stands Out

Most travel apps show you a list of places. **HyperDart Tourism Explorer does something fundamentally harder** — it *understands natural language*, *verifies every result* through real geographic APIs, *explains the reasoning* behind each recommendation, and helps you build an *optimized 1-day itinerary* without ever fabricating a single data point.

This is not a map wrapper. It's a **grounded travel intelligence engine deployed on the edge.**

---

## ✨ Feature Overview

| Feature | Description |
|---|---|
| 🧠 **Natural Language Search** | Type *"historical places in Jaipur"* — engine extracts city and intent automatically |
| 📍 **Verified Attractions Only** | Powered by Geoapify Places v2 + OpenStreetMap — zero hallucinated venues |
| 💬 **Grounded "Why Visit?" AI** | Every card explains *why* this place matches your query, with a match score and interest tags |
| 🗺️ **SVG Radar Map** | Interactive radar with 10km/25km rings — click a numbered pin to highlight its card |
| 📅 **1-Day Itinerary Planner** | Add, remove, reorder stops; persist in `localStorage`; export to `.ics` calendar |
| 🔀 **Route Optimizer** | Nearest-Neighbor geographic heuristic finds the shortest travel path through your stops |
| 🌤️ **Live Weather** | Real-time temperature & sky conditions via Open-Meteo with indoor/outdoor advice |
| 🔖 **Saved Places** | One-click bookmarks tab persisted across sessions |
| 🕐 **Search History** | Recent searches shown as chips; clearable in one click |
| 🌙 **Dark / Light Mode** | Editorial-grade theme toggle; preference remembered |
| ⚠️ **Honest Error Handling** | Unknown locations show a graceful error card with one-click recovery suggestions |
| 📋 **Share Itinerary** | Copy your full day plan to clipboard with a single button |

---

## 🎬 Demo

> **▶ Live Demo Video:** [https://youtu.be/5InYmNZecLY](https://youtu.be/5InYmNZecLY)

### Showcase Queries — Try These First

```
🏰  "Historical places in Jaipur"   → Monuments, forts, heritage landmarks
🎨  "Museums in Paris"              → Art & cultural institutions with context
⛩️  "Temples near Kyoto"           → Sacred sites, shrines, distance-ranked
🌿  "Nature spots in Latur"        → Honest "limited results" feedback (no fabrication)
❌  "xyzabc123nonexistent"         → Graceful error + clickable recovery suggestions
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  HyperDart Platform                     │
│         (provides searchQuery + searchData props)       │
└──────────────────────────┬──────────────────────────────┘
                           │ props
                           ▼
┌─────────────────────────────────────────────────────────┐
│            NewComponent.jsx  (React 19)                 │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Attraction│ │SVG Radar │ │Itinerary │ │ Saved /  │  │
│  │  Cards   │ │  Map     │ │ Planner  │ │ History  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API calls
                           ▼
┌─────────────────────────────────────────────────────────┐
│         Express.js on Cloudflare Workers (Edge)         │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ tourismIntelligence │  │  Geoapify Places v2 API  │  │
│  │   .js  (NLP Layer)  │  │  Open-Meteo Weather API  │  │
│  └─────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Why It Was Chosen |
|:---|:---|:---|
| **Frontend** | React 19, Vite 6 | Fastest dev cycle; HMR; HyperDart-compatible module format |
| **UI Components** | MUI 6, Emotion, Custom CSS | Editorial cards, responsive grid, dark/light theme tokens |
| **Backend Runtime** | Cloudflare Workers + Wrangler | Edge-deployed; zero cold starts; matches HyperDart platform |
| **Backend Framework** | Express.js 5 | Clean REST routing on Workers with minimal overhead |
| **Geo Data** | Geoapify Places v2 + Geocoding | Verified POIs: monuments, museums, temples, parks — no hotels/shops |
| **Weather** | Open-Meteo REST API | Free, accurate, no-auth real-time weather data |
| **NLP Engine** | `tourismIntelligence.js` (custom) | Destination extraction + category scoring + match reasoning |
| **Persistence** | `localStorage` | Bookmarks, itinerary, search history — zero extra backend needed |
| **Map** | Custom SVG Radar | Zero-dependency geographic visualization synced to cards |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Geoapify API key** — [get one free at geoapify.com](https://www.geoapify.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/TejasBembade/hyperDart.git
cd hyperDart/hyperdart-app
npm install
```

### 2. Configure Backend Secrets

Create the file `src/backend/.dev.vars`:

```bash
GEOAPIFY_API_KEY=your_geoapify_api_key_here
ENVIRONMENT=development
```

> ⚠️ This file is **git-ignored** — your API key will never be committed to version control.

Install backend dependencies:

```bash
cd src/backend && npm install && cd ../..
```

### 3. Run Locally (Two Terminals)

**Terminal 1 — Frontend:**
```bash
npm start
# → http://localhost:5173/
```

**Terminal 2 — Backend Worker:**
```bash
cd src/backend && npm start
# → http://127.0.0.1:3001/
```

**Open in browser:**
- Full component: [http://localhost:5173/?fullscreen=hyperdart-app](http://localhost:5173/?fullscreen=hyperdart-app)
- Sandbox: [http://localhost:5173/](http://localhost:5173/)

---

## 📂 Project Structure

```
hyperdart-app/
├── hyperdart.config.js            # Component manifest, search triggers, regex
├── package.json                   # Frontend deps & build scripts
├── README.md
└── src/
    ├── frontend/
    │   ├── index.jsx              # withHD wrapper (HyperDart platform requirement)
    │   └── NewComponent.jsx       # ★ Core Tourism Explorer component
    └── backend/
        ├── index.js               # Express API handler on Cloudflare Worker
        ├── tourismIntelligence.js # Custom NLP parser + match scoring engine
        ├── wrangler.jsonc         # Cloudflare Worker configuration
        ├── .dev.vars              # Local secrets — git-ignored ✅
        └── package.json           # Worker deps & build scripts
```

---

## 🧪 Production Build

```bash
# Frontend bundle
npm run build

# Backend Cloudflare Worker bundle
cd src/backend && npm run build
```

Both builds complete with **0 errors, 0 warnings**.

---

## 🎯 HyperDart Hackathon Compliance

| Requirement | Status |
|---|:---:|
| Answers "What are the most worthwhile attractions?" | ✅ |
| Answers "Why should I visit them?" | ✅ |
| Answers "How do I plan my time efficiently?" | ✅ |
| Uses `withHD` wrapper in `src/frontend/index.jsx` | ✅ |
| Zero mock / fabricated / hallucinated data | ✅ |
| Filters out hotels, restaurants, retail | ✅ |
| Grounded "Why this place?" on every card | ✅ |
| Real-time live data (not hardcoded) | ✅ |
| Interactive visualization (SVG Radar Map) | ✅ |
| Itinerary planning + route optimization | ✅ |
| Export to calendar (.ics) | ✅ |
| Saved Places with `localStorage` | ✅ |
| Search history with clear | ✅ |
| Live Open-Meteo weather | ✅ |
| Dark / Light mode toggle | ✅ |
| Honest, graceful error handling | ✅ |
| Edge-deployed on Cloudflare Workers | ✅ |

---

## 🔮 Future Roadmap

- **Multi-day trip planner** — span itineraries across multiple days with time-block scheduling
- **Collaborative planning** — share itineraries via short URL with real-time sync
- **AI narration** — generate short audio travel guides for each destination
- **Offline mode** — cache previously explored cities via Service Workers

---

## 👤 Author

**Tejas Bembade**  
National Institute of Technology, Kurukshetra

[![GitHub](https://img.shields.io/badge/GitHub-TejasBembade-181717?style=flat-square&logo=github)](https://github.com/TejasBembade)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ for the HyperDart Hackathon 2026 &nbsp;·&nbsp; Tejas Bembade, NIT Kurukshetra</sub>
</div>
