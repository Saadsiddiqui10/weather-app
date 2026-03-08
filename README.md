# 🌤 Atmos — Weather App

A cinematic, full-screen weather application built with React and the OpenWeatherMap API. Features real-time weather data, animated backgrounds, search autocomplete, air quality monitoring, and a 7-day forecast.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite) ![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?style=flat) ![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-EB6E4B?style=flat)

---

## ✨ Features

- **Live Weather Data** — current conditions, temperature, humidity, wind speed, visibility, and pressure
- **7-Day Forecast** — daily high/low with precipitation probability
- **Hourly Temperature Chart** — interactive area chart with rain chance overlay
- **Search Autocomplete** — city suggestions with country flags as you type, powered by the OpenWeatherMap Geocoding API
- **Geolocation** — auto-detects your location on load
- **Air Quality Index (AQI)** — real-time AQI with PM2.5, PM10, NO₂, O₃ breakdown
- **UV Index** — current UV level with risk label
- **°C / °F Toggle** — seamless unit switching
- **Dynamic Theming** — background gradients and accent colors shift based on weather conditions (clear, rain, snow, storm, mist, cloudy)
- **Particle Canvas** — animated rain streaks, snowflakes, or golden dust particles matching the live weather
- **Cinematic Animations** — staggered card entrances, animated temperature counter, skeleton loading, spring hover effects

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/atmos-weather.git
cd atmos-weather

# Install dependencies
npm install

# Install Recharts
npm install recharts
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

---

## 🔑 API Key

This project uses the free tier of [OpenWeatherMap](https://openweathermap.org/api). The demo key included is for development only and has rate limits.

To use your own key:

1. Sign up at [openweathermap.org](https://openweathermap.org)
2. Go to **API Keys** in your account dashboard
3. Copy your key
4. In `src/App.jsx`, replace line 4:

```js
const API_KEY = "your_api_key_here";
```

The following endpoints are used (all available on the free tier):

- `api.openweathermap.org/data/2.5/weather` — current weather
- `api.openweathermap.org/data/2.5/forecast` — 5-day / 3-hour forecast
- `api.openweathermap.org/data/2.5/air_pollution` — AQI data
- `api.openweathermap.org/data/2.5/uvi` — UV index
- `api.openweathermap.org/geo/1.0/direct` — city search autocomplete

---

## 🗂 Project Structure

```
atmos-weather/
├── public/
├── src/
│   ├── App.jsx        # Main component — all weather logic and UI
│   ├── main.jsx       # React entry point
│   └── index.css      # Global reset (keep empty or minimal)
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Recharts | Hourly temperature area chart |
| OpenWeatherMap API | Weather, forecast, AQI, UV, geocoding |
| HTML5 Canvas | Animated particle backgrounds |
| CSS Animations | Cinematic card transitions and effects |

---

## 📦 Deployment

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for automatic deployments on every push.

### Deploy to Netlify

```bash
npm run build
# Drag and drop the /dist folder at netlify.com/drop
```

---

## 🙏 Acknowledgements

- Weather data by [OpenWeatherMap](https://openweathermap.org)
- Charts by [Recharts](https://recharts.org)
- Fonts: [Syne](https://fonts.google.com/specimen/Syne) + [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts

---

## 👨‍💻 Author

**Saad Siddiqui**
- GitHub: [@Saadsiddiquipsp10](https://github.com/Saadsiddiquipsp10)
- LinkedIn: [linkedin.com/in/saad-siddiqui-97442a23a](https://linkedin.com/in/saad-siddiqui-97442a23a)