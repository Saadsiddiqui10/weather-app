import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API_KEY = "bd5e378503939ddaee76f12ad7a97608";

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(from + (to - from) * ease));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas({ condition }) {
  const canvasRef = useRef();
  const particles = useRef([]);
  const raf = useRef();

  const isRain = condition?.includes("Rain") || condition?.includes("Drizzle");
  const isSnow = condition?.includes("Snow");
  const isClear = condition?.includes("Clear");
  const isStorm = condition?.includes("Thunder");
  const active = isRain || isSnow || isClear || isStorm;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = isRain ? 180 : isSnow ? 120 : isClear ? 80 : isStorm ? 60 : 0;

    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: isRain || isStorm ? Math.random() * 18 + 10 : 0,
      r: isSnow ? Math.random() * 3 + 1 : isClear ? Math.random() * 1.5 + 0.5 : 0,
      vx: isRain ? Math.random() * 1.5 - 0.5 : isSnow ? Math.random() * 0.6 - 0.3 : isClear ? Math.random() * 0.3 - 0.15 : Math.random() * 2 - 1,
      vy: isRain ? Math.random() * 12 + 8 : isSnow ? Math.random() * 1.2 + 0.4 : isClear ? -(Math.random() * 0.5 + 0.1) : Math.random() * 6 + 4,
      opacity: Math.random() * 0.5 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.05 + 0.01,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        p.twinkle += p.twinkleSpeed;
        const alpha = isRain || isStorm
          ? p.opacity * (0.7 + 0.3 * Math.sin(p.twinkle))
          : isSnow
          ? p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle))
          : p.opacity * (0.4 + 0.6 * Math.abs(Math.sin(p.twinkle)));

        if (isRain || isStorm) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + p.len);
          ctx.strokeStyle = isStorm ? `rgba(180,200,255,${alpha})` : `rgba(120,180,255,${alpha})`;
          ctx.lineWidth = isStorm ? 1.5 : 1;
          ctx.stroke();
        } else if (isSnow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,240,255,${alpha})`;
          ctx.fill();
        } else if (isClear) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,230,150,${alpha})`;
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.y < -20) p.y = canvas.height + 20;
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [condition]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:2, opacity: isRain || isStorm ? 0.45 : isSnow ? 0.6 : 0.25 }} />;
}

// ─── Weather Icons ────────────────────────────────────────────────────────────
const SunIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="sg"><stop offset="0%" stopColor="#FFF9C4"/><stop offset="100%" stopColor="#FF8F00"/></radialGradient>
      <filter id="sglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#sglow)">
      <circle cx="50" cy="50" r="0" fill="url(#sg)"><animate attributeName="r" values="0;22;20" dur="0.6s" fill="freeze"/><animate attributeName="r" values="20;23;20" dur="3s" begin="0.6s" repeatCount="indefinite"/></circle>
      <g><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="18s" repeatCount="indefinite"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <rect key={i} x="47.5" y="6" width="5" height="14" rx="2.5" fill="#FFD54F" opacity="0" transform={`rotate(${a} 50 50)`}>
            <animate attributeName="opacity" values="0;0.9" dur="0.3s" begin={`${0.4+i*0.05}s`} fill="freeze"/>
          </rect>
        ))}
      </g>
    </g>
  </svg>
);

const CloudIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ECEFF1"/><stop offset="100%" stopColor="#78909C"/></linearGradient></defs>
    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;5,0;0,0" dur="7s" begin="0.5s" repeatCount="indefinite"/>
      <circle cx="36" cy="56" r="18" fill="url(#cg)" opacity="0.9"/>
      <circle cx="54" cy="48" r="22" fill="url(#cg)"/>
      <circle cx="72" cy="56" r="16" fill="url(#cg)" opacity="0.9"/>
      <rect x="18" y="56" width="68" height="20" rx="10" fill="url(#cg)"/>
    </g>
  </svg>
);

const RainIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><linearGradient id="rcg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#607D8B"/><stop offset="100%" stopColor="#37474F"/></linearGradient></defs>
    <circle cx="33" cy="40" r="15" fill="url(#rcg)"/><circle cx="50" cy="34" r="19" fill="url(#rcg)"/><circle cx="67" cy="40" r="14" fill="url(#rcg)"/>
    <rect x="18" y="40" width="56" height="14" rx="7" fill="url(#rcg)"/>
    {[25,38,51,64,77].map((x,i)=>(
      <g key={i}><line x1={x} y1="60" x2={x-5} y2="76" stroke="#64B5F6" strokeWidth="2.5" strokeLinecap="round">
        <animate attributeName="opacity" values="0;1;0" dur={`${0.9+i*0.18}s`} repeatCount="indefinite" begin={`${i*0.15}s`}/>
        <animate attributeName="y1" values="58;62;58" dur={`${0.9+i*0.18}s`} repeatCount="indefinite" begin={`${i*0.15}s`}/>
        <animate attributeName="y2" values="74;78;74" dur={`${0.9+i*0.18}s`} repeatCount="indefinite" begin={`${i*0.15}s`}/>
      </line></g>
    ))}
  </svg>
);

const SnowIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><linearGradient id="scg"><stop offset="0%" stopColor="#E3F2FD"/><stop offset="100%" stopColor="#90CAF9"/></linearGradient></defs>
    <circle cx="33" cy="40" r="15" fill="url(#scg)"/><circle cx="50" cy="34" r="19" fill="url(#scg)"/><circle cx="67" cy="40" r="14" fill="url(#scg)"/>
    <rect x="18" y="40" width="56" height="14" rx="7" fill="url(#scg)"/>
    {[28,42,56,70].map((x,i)=>(
      <text key={i} x={x} y="84" fontSize="13" fill="white" textAnchor="middle" opacity="0.9">
        *<animate attributeName="y" values={`${82+i};${86+i};${82+i}`} dur={`${1.8+i*0.4}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur={`${1.8+i*0.4}s`} repeatCount="indefinite"/>
      </text>
    ))}
  </svg>
);

const StormIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><linearGradient id="stg"><stop offset="0%" stopColor="#2E3A45"/><stop offset="100%" stopColor="#1A252F"/></linearGradient></defs>
    <circle cx="33" cy="38" r="15" fill="url(#stg)"/><circle cx="50" cy="32" r="19" fill="url(#stg)"/><circle cx="67" cy="38" r="14" fill="url(#stg)"/>
    <rect x="18" y="38" width="56" height="14" rx="7" fill="url(#stg)"/>
    <polygon points="55,54 43,72 51,72 45,90 63,66 54,66" fill="#FFD600">
      <animate attributeName="opacity" values="1;0.1;1;0.8;1" dur="2s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="scale" values="1,1;1.05,1.05;1,1" additive="sum" dur="2s" repeatCount="indefinite"/>
    </polygon>
  </svg>
);

const MistIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {[18,32,46,60,74].map((y,i)=>(
      <rect key={i} x="8" y={y} width={62-i*7} height="7" rx="3.5" fill="#90A4AE" opacity="0.55">
        <animate attributeName="x" values={`${8};${16};${8}`} dur={`${3.5+i*0.7}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.55;0.25;0.55" dur={`${3.5+i*0.7}s`} repeatCount="indefinite"/>
      </rect>
    ))}
  </svg>
);

function WeatherIcon({ condition, size = 80 }) {
  const c = condition || "";
  if (c.includes("Clear")) return <SunIcon size={size}/>;
  if (c.includes("Rain") || c.includes("Drizzle")) return <RainIcon size={size}/>;
  if (c.includes("Snow")) return <SnowIcon size={size}/>;
  if (c.includes("Thunder")) return <StormIcon size={size}/>;
  if (["Mist","Fog","Haze","Smoke","Dust"].some(k=>c.includes(k))) return <MistIcon size={size}/>;
  return <CloudIcon size={size}/>;
}

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES = {
  default: { bg:"#080d18", grad:"radial-gradient(ellipse 80% 60% at 20% 10%, #0f1f3d 0%, #080d18 70%)", accent:"#5C85FF", text:"#dde8ff" },
  clear:   { bg:"#09152b", grad:"radial-gradient(ellipse 90% 70% at 25% 5%, #1a3a70 0%, #09152b 55%), radial-gradient(ellipse 50% 50% at 85% 85%, #3d1800 0%, transparent 60%)", accent:"#FFA940", text:"#fff6e0" },
  rain:    { bg:"#050e18", grad:"radial-gradient(ellipse 80% 60% at 15% 25%, #082840 0%, #050e18 65%)", accent:"#3DB8F5", text:"#d8f0ff" },
  snow:    { bg:"#070f1e", grad:"radial-gradient(ellipse 80% 60% at 50% 0%, #112a4a 0%, #070f1e 65%)", accent:"#A8D8F0", text:"#eaf4ff" },
  storm:   { bg:"#05060c", grad:"radial-gradient(ellipse 80% 60% at 50% 5%, #14152a 0%, #05060c 65%)", accent:"#F5D020", text:"#fffbe0" },
  mist:    { bg:"#090f18", grad:"radial-gradient(ellipse 80% 80% at 50% 40%, #152030 0%, #090f18 70%)", accent:"#82C4E8", text:"#e0f0ff" },
  cloudy:  { bg:"#080e1c", grad:"radial-gradient(ellipse 80% 60% at 25% 15%, #112236 0%, #080e1c 65%)", accent:"#6BB8DC", text:"#dceeff" },
};

function getTheme(condition) {
  if (!condition) return THEMES.default;
  if (condition.includes("Clear")) return THEMES.clear;
  if (condition.includes("Rain") || condition.includes("Drizzle")) return THEMES.rain;
  if (condition.includes("Snow")) return THEMES.snow;
  if (condition.includes("Thunder")) return THEMES.storm;
  if (["Mist","Fog","Haze","Smoke","Dust"].some(k=>condition.includes(k))) return THEMES.mist;
  return THEMES.cloudy;
}

// ─── AQI helpers ──────────────────────────────────────────────────────────────
const AQI_LABELS = ["","Good","Fair","Moderate","Poor","Very Poor"];
const AQI_COLORS = ["","#4CAF50","#8BC34A","#FFC107","#FF5722","#B71C1C"];
const UV_LABEL = v => v<=2?"Low":v<=5?"Moderate":v<=7?"High":v<=10?"Very High":"Extreme";
const UV_COLOR = v => v<=2?"#4CAF50":v<=5?"#FFC107":v<=7?"#FF9800":v<=10?"#FF5722":"#9C27B0";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmt12 = dt => { const d=new Date(dt*1000),h=d.getHours(); return `${h===0?12:h>12?h-12:h}${h>=12?"pm":"am"}`; };
const fmtDay = dt => DAYS[new Date(dt*1000).getDay()];

function getDailyForecast(forecast) {
  if (!forecast) return [];
  const map = {};
  forecast.list.forEach(item => {
    const d = new Date(item.dt*1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) map[key] = { items:[], dt: item.dt };
    map[key].items.push(item);
  });
  return Object.values(map).slice(0,7).map(day => {
    const temps = day.items.map(i=>i.main.temp);
    const mid = day.items[Math.floor(day.items.length/2)];
    return { dt:day.dt, min:Math.round(Math.min(...temps)), max:Math.round(Math.max(...temps)),
      condition:mid.weather[0].main, desc:mid.weather[0].description, items:day.items,
      pop: Math.round(Math.max(...day.items.map(i=>i.pop||0))*100) };
  });
}

function getHourly(daily, idx) {
  if (!daily[idx]) return [];
  return daily[idx].items.map(i=>({ time:fmt12(i.dt), temp:Math.round(i.main.temp), pop:Math.round((i.pop||0)*100) }));
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, accent }) => active && payload?.length ? (
  <div style={{ background:"rgba(4,8,20,0.95)", border:`1px solid ${accent}55`, borderRadius:14, padding:"12px 18px", backdropFilter:"blur(16px)", boxShadow:`0 8px 32px ${accent}22` }}>
    <div style={{ fontSize:11, opacity:0.45, marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:800, color:accent }}>{payload[0]?.value}°</div>
    {payload[1] && <div style={{ fontSize:12, opacity:0.55, marginTop:2 }}>💧 {payload[1]?.value}% rain</div>}
  </div>
) : null;

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const Skeleton = ({ w="100%", h=20, r=8, delay=0 }) => (
  <div style={{ width:w, height:h, borderRadius:r, background:"rgba(255,255,255,0.06)", overflow:"hidden", position:"relative" }}>
    <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", animation:`shimmer 1.8s ease infinite`, animationDelay:`${delay}s` }}/>
  </div>
);

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function AnimBar({ pct, accent, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(()=>setW(Math.max(0,Math.min(100,pct))), 100+delay); return ()=>clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:3, width:`${w}%`, background:`linear-gradient(90deg,${accent}66,${accent})`, transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:`0 0 8px ${accent}66` }}/>
    </div>
  );
}

// ─── Search Autocomplete ───────────────────────────────────────────────────────
function SearchBar({ onSearch, theme }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounce = useRef();
  const wrapRef = useRef();

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async q => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=6&appid=${API_KEY}`);
      const data = await res.json();
      setSuggestions(data.map(c => ({ name:c.name, country:c.country, state:c.state, lat:c.lat, lon:c.lon })));
      setOpen(data.length > 0);
    } catch { setSuggestions([]); }
    setLoading(false);
  }, []);

  const onChange = e => {
    setInput(e.target.value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(e.target.value), 280);
  };

  const pick = s => {
    setInput(s.name);
    setOpen(false);
    setSuggestions([]);
    onSearch(s.lat, s.lon, s.name);
  };

  const submit = () => {
    if (suggestions.length > 0) pick(suggestions[0]);
    else if (input.trim()) onSearch(null, null, input.trim());
    setOpen(false);
  };

  // Country flag emoji
  const flag = country => country ? String.fromCodePoint(...[...country.toUpperCase()].map(c=>127397+c.charCodeAt())) : "";

  return (
    <div ref={wrapRef} style={{ position:"relative", zIndex:1000 }}>
      <div style={{
        display:"flex", gap:10, alignItems:"center",
        background: focused ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${focused ? theme.accent+"66" : "rgba(255,255,255,0.08)"}`,
        borderRadius: open && suggestions.length > 0 ? "18px 18px 0 0" : 18,
        padding:"14px 18px",
        transition:"all 0.3s ease",
        boxShadow: focused ? `0 0 0 3px ${theme.accent}18` : "none",
        backdropFilter:"blur(20px)",
      }}>
        <span style={{ fontSize:15, opacity: loading ? 1 : 0.35, transition:"opacity 0.2s", animation: loading ? "spin 0.8s linear infinite" : "none" }}>
          {loading ? "⟳" : "🔍"}
        </span>
        <input
          value={input}
          onChange={onChange}
          onFocus={() => { setFocused(true); if (suggestions.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key==="Enter") submit(); if (e.key==="Escape") setOpen(false); }}
          placeholder="Search for any city in the world…"
          style={{ flex:1, background:"transparent", border:"none", color:theme.text, fontSize:15, fontFamily:"inherit", outline:"none" }}
        />
        <button onClick={submit} style={{
          background: theme.accent, color:"#050a14", padding:"9px 22px", borderRadius:12,
          fontSize:13, fontWeight:700, flexShrink:0, border:"none", cursor:"pointer",
          transition:"all 0.2s", boxShadow:`0 4px 16px ${theme.accent}44`,
        }}>
          Search
        </button>
      </div>

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0,
          background:"rgba(8,14,28,0.97)", backdropFilter:"blur(24px)",
          border:`1px solid ${theme.accent}33`, borderTop:"none",
          borderRadius:"0 0 18px 18px", overflow:"hidden",
          boxShadow:`0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${theme.accent}11`,
          animation:"dropIn 0.2s ease both",
        }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={() => pick(s)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"13px 20px",
              cursor:"pointer", transition:"background 0.15s",
              borderBottom: i < suggestions.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              animation:`slideIn 0.2s ease both`, animationDelay:`${i*0.04}s`,
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ fontSize:22, lineHeight:1 }}>{flag(s.country)}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600, color:theme.text }}>{s.name}</div>
                <div style={{ fontSize:12, opacity:0.4, marginTop:1 }}>
                  {[s.state, s.country].filter(Boolean).join(", ")}
                </div>
              </div>
              <span style={{ fontSize:11, opacity:0.25, color:theme.text }}>→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function WeatherApp() {
  const [weather, setWeather]   = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aqi, setAqi]           = useState(null);
  const [uv, setUv]             = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [unit, setUnit]         = useState("metric");
  const [activeDay, setActiveDay] = useState(0);
  const [locating, setLocating] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const storedCoord = useRef(null);

  const theme = getTheme(weather?.weather?.[0]?.main);
  const u = unit === "metric" ? "°C" : "°F";
  const temp = useCounter(Math.round(weather?.main?.temp || 0), 1400);

  useEffect(() => { setMounted(true); }, []);

  async function load(lat, lon, city, overrideUnit) {
    setLoading(true); setError(null); setActiveDay(0);
    const units = overrideUnit || unit;
    try {
      const q = lat!=null ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(city)}`;
      const [w, f] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${q}&units=${units}&appid=${API_KEY}`).then(r=>{if(!r.ok)throw new Error("City not found");return r.json();}),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${q}&units=${units}&appid=${API_KEY}`).then(r=>r.json()),
      ]);
      setWeather(w); setForecast(f);
      if (lat!=null) storedCoord.current={lat,lon};
      else storedCoord.current=null;

      // AQI
      const coord = lat!=null ? {lat,lon} : {lat:w.coord.lat,lon:w.coord.lon};
      const [aqiRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}`).then(r=>r.json()),
      ]);
      setAqi(aqiRes?.list?.[0]);

      // UV from One Call (free tier)
      try {
        const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}`).then(r=>r.json());
        setUv(uvRes?.value ?? null);
      } catch { setUv(null); }

    } catch(e) { setError(e.message); }
    setLoading(false);
  }

  function geo() {
    if (!navigator.geolocation) { load(null,null,"Karachi"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => { setLocating(false); load(p.coords.latitude, p.coords.longitude); },
      () => { setLocating(false); load(null,null,"Karachi"); }
    );
  }

  useEffect(() => { geo(); }, []);

  function toggleUnit() {
    const next = unit==="metric"?"imperial":"metric";
    setUnit(next);
    if (storedCoord.current) load(storedCoord.current.lat, storedCoord.current.lon, null, next);
    else if (weather) load(null, null, weather.name, next);
  }

  const daily = getDailyForecast(forecast);
  const hourly = getHourly(daily, activeDay);
  const allMax = daily.length ? Math.max(...daily.map(d=>d.max)) : 0;
  const allMin = daily.length ? Math.min(...daily.map(d=>d.min)) : 0;
  const totalRange = allMax - allMin || 1;

  const aqiLevel = aqi?.main?.aqi || 0;
  const comp = aqi?.components || {};

  return (
    <div style={{ width:"100vw", minHeight:"100vh", background:theme.bg, transition:"background 1.5s ease", fontFamily:"'Syne','Outfit',sans-serif", color:theme.text, overflowX:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;min-height:100vh;overflow-x:hidden;}
        #root{width:100%;min-height:100vh;max-width:100%!important;padding:0!important;margin:0!important;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px;}
        .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:24px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s ease,border-color 0.3s ease;}
        .card:hover{transform:translateY(-4px) scale(1.01);box-shadow:0 8px 40px rgba(0,0,0,0.4), 0 0 20px var(--accent);border-color:rgba(255,255,255,0.18);}
        .pill{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.09);border-radius:14px;}
        .dcard{cursor:pointer;border-radius:20px;padding:16px 10px;text-align:center;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .dcard:hover{transform:translateY(-6px) scale(1.03);}
        .floatY{animation:floatY 6s ease-in-out infinite;}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
        @keyframes cardIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes heroIn{from{opacity:0;transform:scale(0.96) translateY(20px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input::placeholder{color:rgba(255,255,255,0.28);}
        input:focus{outline:none;}
        button{font-family:inherit;cursor:pointer;border:none;transition:all 0.2s ease;}
        button:hover{filter:brightness(1.12);transform:translateY(-1px);}
        button:active{transform:translateY(0);}
        @media(max-width:980px){.main-grid{grid-template-columns:1fr!important;}.bottom-grid{grid-template-columns:1fr!important;}}
        @media(max-width:640px){.forecast-grid{grid-template-columns:repeat(4,1fr)!important;}}
      `}</style>
      <style>{`:root { --accent: ${theme.accent}44; }`}</style>

      {/* Particle layer */}
      <ParticleCanvas condition={weather?.weather?.[0]?.main} />

      {/* Ambient BG layers */}
      <div style={{ position:"fixed", inset:0, background:theme.grad, opacity:0.92, pointerEvents:"none", zIndex:0, transition:"background 1.5s ease" }}/>
      <div style={{ position:"fixed", top:"-12%", right:"-6%", width:600, height:600, borderRadius:"50%", background:theme.accent, opacity:0.06, filter:"blur(120px)", pointerEvents:"none", zIndex:0, transition:"background 1.5s" }}/>
      <div style={{ position:"fixed", bottom:"-10%", left:"-6%", width:480, height:480, borderRadius:"50%", background:theme.accent, opacity:0.035, filter:"blur(100px)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", top:"40%", left:"30%", width:300, height:300, borderRadius:"50%", background:theme.accent, opacity:0.025, filter:"blur(80px)", pointerEvents:"none", zIndex:0 }}/>

      {/* Content */}
      <div style={{ position:"relative", zIndex:10, width:"100%", padding:"36px 40px", minHeight:"100vh", isolation:"isolate" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, animation:"cardIn 0.6s ease both" }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.5px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:20 }}>🌤</span>
              <span style={{ color: theme.accent, fontSize: 22, fontWeight: 800 }}>Atmos</span>
            </div>
            <div style={{ fontSize:11, opacity:0.28, marginTop:3, fontFamily:"'Outfit',sans-serif" }}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={toggleUnit} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:theme.text, padding:"10px 20px", borderRadius:14, fontSize:13, fontWeight:600 }}>
              {unit==="metric"?"°C → °F":"°F → °C"}
            </button>
            <button onClick={geo} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:theme.text, padding:"10px 16px", borderRadius:14, fontSize:17 }} title="Use location">
              {locating ? <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span> : "◎"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom:28, animation:"cardIn 0.6s ease both", animationDelay:"0.08s", position:"relative", zIndex:500 }}>
          <SearchBar onSearch={(lat,lon,city) => load(lat,lon,city)} theme={theme} />
        </div>

        {error && (
          <div style={{ background:"rgba(255,50,50,0.1)", border:"1px solid rgba(255,50,50,0.25)", borderRadius:16, padding:"14px 20px", marginBottom:20, fontSize:14, animation:"cardIn 0.4s ease" }}>
            ⚠ {error}
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div style={{ animation:"cardIn 0.4s ease" }}>
            <div className="main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, marginBottom:20 }}>
              <div className="card" style={{ padding:"44px 48px", minHeight:320 }}>
                <Skeleton h={16} w={120} delay={0}/>
                <div style={{ marginTop:20 }}><Skeleton h={88} w={200} r={12} delay={0.1}/></div>
                <div style={{ marginTop:16 }}><Skeleton h={14} w={160} delay={0.15}/></div>
                <div style={{ display:"flex", gap:10, marginTop:28 }}>
                  {[0,1,2,3].map(i=><Skeleton key={i} h={70} w={100} r={14} delay={0.2+i*0.05}/>)}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <div className="card" style={{ padding:24 }}><Skeleton h={100} delay={0.2}/></div>
                <div className="card" style={{ padding:24 }}><Skeleton h={140} delay={0.3}/></div>
              </div>
            </div>
            <div className="card" style={{ padding:"28px 32px", marginBottom:20 }}><Skeleton h={100} delay={0.4}/></div>
            <div className="bottom-grid" style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:20 }}>
              <div className="card" style={{ padding:28 }}><Skeleton h={200} delay={0.5}/></div>
              <div className="card" style={{ padding:28 }}><Skeleton h={200} delay={0.55}/></div>
            </div>
          </div>
        )}

        {weather && !loading && (
          <div>
            {/* MAIN GRID */}
            <div className="main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:20, marginBottom:20, alignItems:"start" }}>

              {/* Hero */}
              <div className="card" style={{ padding:"44px 50px", position:"relative", overflow:"hidden", animation:"heroIn 0.7s cubic-bezier(0.34,1.1,0.64,1) both" }}>
                <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 70% 60% at 90% 10%, ${theme.accent}18, transparent 60%)`, pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:-40, right:-40, width:220, height:220, borderRadius:"50%", background:theme.accent, opacity:0.04, filter:"blur(50px)", pointerEvents:"none" }}/>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, animation:"cardIn 0.5s ease both", animationDelay:"0.15s" }}>
                      <span style={{ fontSize:13, opacity:0.4 }}>📍</span>
                      <span style={{ fontSize:24, fontWeight:700 }}>{weather.name}</span>
                      <span style={{ fontSize:14, opacity:0.35, fontWeight:400 }}>{weather.sys?.country}</span>
                    </div>

                    <div style={{ display:"flex", alignItems:"flex-start", lineHeight:1, margin:"8px 0 4px", animation:"cardIn 0.5s ease both", animationDelay:"0.2s" }}>
                      <span style={{ fontSize:108, fontWeight:800, letterSpacing:"-6px", background:`linear-gradient(160deg, ${theme.text} 60%, ${theme.accent})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        {temp}
                      </span>
                      <span style={{ fontSize:40, opacity:0.5, marginTop:20, WebkitTextFillColor:theme.text }}>{u}</span>
                    </div>

                    <div style={{ fontSize:16, opacity:0.45, textTransform:"capitalize", marginBottom:28, fontFamily:"'Outfit',sans-serif", animation:"cardIn 0.5s ease both", animationDelay:"0.25s" }}>
                      {weather.weather?.[0]?.description}
                      <span style={{ marginLeft:12, opacity:0.6, fontSize:13 }}>↑{Math.round(weather.main?.temp_max)}{u} ↓{Math.round(weather.main?.temp_min)}{u}</span>
                    </div>

                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {[
                        {icon:"💧",label:"Humidity",val:`${weather.main?.humidity}%`},
                        {icon:"💨",label:"Wind",val:`${Math.round(weather.wind?.speed)} ${unit==="metric"?"m/s":"mph"}`},
                        {icon:"👁",label:"Visibility",val:`${((weather.visibility||0)/1000).toFixed(1)} km`},
                        {icon:"🌡",label:"Feels like",val:`${Math.round(weather.main?.feels_like)}${u}`},
                      ].map((s,i)=>(
                        <div key={i} className="pill" style={{ padding:"11px 16px", minWidth:96, animation:"cardIn 0.5s ease both", animationDelay:`${0.3+i*0.07}s` }}>
                          <div style={{ fontSize:16, marginBottom:4 }}>{s.icon}</div>
                          <div style={{ fontSize:9, opacity:0.35, textTransform:"uppercase", letterSpacing:1.5, marginBottom:3, fontFamily:"'Outfit',sans-serif" }}>{s.label}</div>
                          <div style={{ fontSize:14, fontWeight:700 }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="floatY" style={{ flexShrink:0, animation:"floatY 6s ease-in-out infinite, heroIn 0.8s ease both", animationDelay:"0s,0.1s" }}>
                    <WeatherIcon condition={weather.weather?.[0]?.main} size={140}/>
                  </div>
                </div>
              </div>

              {/* Side column */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Sun */}
                <div className="card" style={{ padding:"22px 24px", animation:"cardIn 0.6s ease both", animationDelay:"0.15s" }}>
                  <div style={{ fontSize:9, fontWeight:700, opacity:0.3, letterSpacing:2.5, textTransform:"uppercase", marginBottom:16 }}>Sun Schedule</div>
                  <div style={{ display:"flex", justifyContent:"space-around" }}>
                    {[{icon:"🌅",lbl:"Sunrise",val:fmt12(weather.sys?.sunrise)},{icon:"🌇",lbl:"Sunset",val:fmt12(weather.sys?.sunset)}].map((s,i)=>(
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:28, marginBottom:6 }}>{s.icon}</div>
                        <div style={{ fontSize:9, opacity:0.32, marginBottom:4, letterSpacing:1 }}>{s.lbl}</div>
                        <div style={{ fontSize:18, fontWeight:700 }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Atmosphere */}
                <div className="card" style={{ padding:"22px 24px", animation:"cardIn 0.6s ease both", animationDelay:"0.22s" }}>
                  <div style={{ fontSize:9, fontWeight:700, opacity:0.3, letterSpacing:2.5, textTransform:"uppercase", marginBottom:18 }}>Atmosphere</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    {[
                      {label:"Pressure",val:`${weather.main?.pressure} hPa`,pct:Math.min(100,((weather.main?.pressure-950)/100)*100)},
                      {label:"Cloud Cover",val:`${weather.clouds?.all}%`,pct:weather.clouds?.all},
                      {label:"Humidity",val:`${weather.main?.humidity}%`,pct:weather.main?.humidity},
                    ].map((s,i)=>(
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <span style={{ fontSize:12, opacity:0.45, fontFamily:"'Outfit',sans-serif" }}>{s.label}</span>
                          <span style={{ fontSize:12, fontWeight:700 }}>{s.val}</span>
                        </div>
                        <AnimBar pct={s.pct} accent={theme.accent} delay={i*120}/>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AQI + UV */}
                {(aqi || uv !== null) && (
                  <div className="card" style={{ padding:"22px 24px", animation:"cardIn 0.6s ease both", animationDelay:"0.3s" }}>
                    <div style={{ fontSize:9, fontWeight:700, opacity:0.3, letterSpacing:2.5, textTransform:"uppercase", marginBottom:18 }}>Air & UV</div>

                    {aqi && (
                      <div style={{ marginBottom:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <span style={{ fontSize:12, opacity:0.45 }}>Air Quality Index</span>
                          <span style={{ fontSize:12, fontWeight:700, color:AQI_COLORS[aqiLevel], background:`${AQI_COLORS[aqiLevel]}22`, padding:"3px 10px", borderRadius:20, border:`1px solid ${AQI_COLORS[aqiLevel]}44` }}>
                            {AQI_LABELS[aqiLevel]}
                          </span>
                        </div>
                        <AnimBar pct={(aqiLevel/5)*100} accent={AQI_COLORS[aqiLevel]}/>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:12 }}>
                          {[
                            {lbl:"PM2.5",val:comp.pm2_5?.toFixed(1)},
                            {lbl:"PM10",val:comp.pm10?.toFixed(1)},
                            {lbl:"NO₂",val:comp.no2?.toFixed(1)},
                            {lbl:"O₃",val:comp.o3?.toFixed(1)},
                          ].map((c,i)=>(
                            <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"6px 10px" }}>
                              <div style={{ fontSize:9, opacity:0.35, letterSpacing:1 }}>{c.lbl}</div>
                              <div style={{ fontSize:13, fontWeight:600 }}>{c.val} <span style={{ fontSize:9, opacity:0.4 }}>μg/m³</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uv !== null && (
                      <div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <span style={{ fontSize:12, opacity:0.45 }}>UV Index</span>
                          <span style={{ fontSize:12, fontWeight:700, color:UV_COLOR(uv), background:`${UV_COLOR(uv)}22`, padding:"3px 10px", borderRadius:20, border:`1px solid ${UV_COLOR(uv)}44` }}>
                            {uv} — {UV_LABEL(uv)}
                          </span>
                        </div>
                        <AnimBar pct={Math.min(100,(uv/11)*100)} accent={UV_COLOR(uv)} delay={200}/>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 7-Day Forecast */}
            {daily.length > 0 && (
              <div className="card" style={{ padding:"28px 32px", marginBottom:20, animation:"cardIn 0.6s ease both", animationDelay:"0.35s" }}>
                <div style={{ fontSize:9, fontWeight:700, opacity:0.28, letterSpacing:2.5, textTransform:"uppercase", marginBottom:20 }}>7-Day Forecast</div>
                <div className="forecast-grid" style={{ display:"grid", gridTemplateColumns:`repeat(${daily.length},1fr)`, gap:10 }}>
                  {daily.map((day,i)=>(
                    <div key={i} className="dcard" onClick={()=>setActiveDay(i)} style={{
                      background: activeDay===i ? `${theme.accent}1E` : "rgba(255,255,255,0.03)",
                      border:`1px solid ${activeDay===i ? theme.accent+"55" : "rgba(255,255,255,0.05)"}`,
                      boxShadow: activeDay===i ? `0 0 32px ${theme.accent}22, inset 0 1px 0 ${theme.accent}33` : "none",
                      animation:`cardIn 0.5s ease both`, animationDelay:`${0.35+i*0.05}s`,
                    }}>
                      <div style={{ fontSize:10, opacity:0.38, fontWeight:600, marginBottom:10, letterSpacing:0.5 }}>{i===0?"Today":fmtDay(day.dt)}</div>
                      <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><WeatherIcon condition={day.condition} size={40}/></div>
                      <div style={{ fontSize:16, fontWeight:800, marginBottom:2 }}>{day.max}°</div>
                      <div style={{ fontSize:11, opacity:0.3, marginBottom:6 }}>{day.min}°</div>
                      {day.pop > 0 && <div style={{ fontSize:10, color:"#64B5F6", opacity:0.8 }}>💧 {day.pop}%</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom row */}
            <div className="bottom-grid" style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:20 }}>

              {hourly.length > 0 && (
                <div className="card" style={{ padding:"28px 32px", animation:"cardIn 0.6s ease both", animationDelay:"0.45s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <div style={{ fontSize:9, fontWeight:700, opacity:0.28, letterSpacing:2.5, textTransform:"uppercase" }}>Hourly Trend</div>
                    <div style={{ fontSize:11, opacity:0.28, fontFamily:"'Outfit',sans-serif" }}>{activeDay===0?"Today":fmtDay(daily[activeDay]?.dt)}</div>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={hourly} margin={{ top:10, right:8, left:-30, bottom:0 }}>
                      <defs>
                        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.accent} stopOpacity={0.35}/>
                          <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64B5F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#64B5F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fill:"rgba(255,255,255,0.28)", fontSize:11, fontFamily:"Outfit" }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:"rgba(255,255,255,0.28)", fontSize:11 }} axisLine={false} tickLine={false} domain={["dataMin-2","dataMax+2"]}/>
                      <Tooltip content={<ChartTip accent={theme.accent}/>}/>
                      <Area type="monotone" dataKey="pop" stroke="#64B5F6" strokeWidth={1.5} fill="url(#pg)" strokeDasharray="4 2" dot={false}/>
                      <Area type="monotone" dataKey="temp" stroke={theme.accent} strokeWidth={2.5} fill="url(#tg)"
                        dot={{ fill:theme.accent, r:4, strokeWidth:0 }}
                        activeDot={{ r:7, fill:theme.accent, stroke:"white", strokeWidth:2, filter:`drop-shadow(0 0 6px ${theme.accent})` }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {daily.length > 0 && (
                <div className="card" style={{ padding:"28px 32px", animation:"cardIn 0.6s ease both", animationDelay:"0.5s" }}>
                  <div style={{ fontSize:9, fontWeight:700, opacity:0.28, letterSpacing:2.5, textTransform:"uppercase", marginBottom:20 }}>Weekly Range</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {daily.map((day,i)=>{
                      const lp = ((day.min-allMin)/totalRange)*52;
                      const wp = Math.max(((day.max-day.min)/totalRange)*52,7);
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, animation:`cardIn 0.4s ease both`, animationDelay:`${0.5+i*0.04}s` }}>
                          <span style={{ width:30, fontSize:11, opacity:0.32, flexShrink:0 }}>{i===0?"Now":fmtDay(day.dt)}</span>
                          <span style={{ width:24, fontSize:11, opacity:0.28, textAlign:"right", flexShrink:0 }}>{day.min}°</span>
                          <div style={{ flex:1, height:7, background:"rgba(255,255,255,0.06)", borderRadius:4, position:"relative" }}>
                            <div style={{ position:"absolute", left:`${lp}%`, width:`${wp}%`, height:"100%", borderRadius:4,
                              background:`linear-gradient(90deg,${theme.accent}66,${theme.accent})`,
                              boxShadow: activeDay===i ? `0 0 12px ${theme.accent}88` : "none",
                              transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}/>
                          </div>
                          <span style={{ width:26, fontSize:11, fontWeight:700, flexShrink:0 }}>{day.max}°</span>
                          <WeatherIcon condition={day.condition} size={22}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign:"center", marginTop:28, opacity:0.13, fontSize:11, fontFamily:"'Outfit',sans-serif" }}>
              Atmos · Powered by OpenWeatherMap
            </div>
          </div>
        )}
      </div>
    </div>
  );
}