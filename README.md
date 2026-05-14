# PULSE — Live Web App Monitor

I built this as a real-time analytics dashboard that simulates what it looks like to watch a web application running in production. The idea was simple: imagine you just shipped something and you want to see, right now, how many people are hitting your server, which pages are slow, and when errors spike. That's the problem this solves.

There's no real backend to connect to — the data is simulated using a mock generator that runs on the Next.js server and streams it over SSE every 100ms. The numbers are fake but they behave realistically: traffic follows a sine wave (peaks during "business hours"), error rates stay low most of the time but occasionally spike, and response times vary by route.

---

## What's on the screen

**Top bar** — Shows whether the stream is live (green pulse) or reconnecting, your current requests-per-second across all routes, server uptime, and the time.

**TRAFFIC chart** — Request rate over time. The Y-axis is req/s, the X-axis is time. Use the 1M / 5M / 15M / 1H buttons at the top right to zoom in or out. Hit PAUSE if you want to freeze it and inspect a moment in time.

**ERROR RATE chart** — What percentage of requests are returning errors right now. The dashed orange line is your warning threshold (5% error rate). The red line is critical (10%). In normal operation you'll see the line sitting low — a spike means something is broken.

**RESPONSE MAP** — A heatmap with 5 rows (one per route) and 12 columns (the last 60 seconds of data, in 5-second buckets). Green cells = fast responses, red = slow. Hover any cell to see the exact millisecond. This is useful for spotting which route degraded and exactly when it happened.

**Page Load Times** (sidebar) — A bar chart showing average response time per route right now. Color-coded: green if under 500ms SLA, amber if borderline, red if over. You can see at a glance that `/api` is always fastest and `/blog` tends to be the slowest because it renders a lot of content.

**Four KPI cards** — Requests/sec, Error Rate, Uptime %, and Requests Today. These animate smoothly as the numbers change.

**Live Events feed** (bottom) — Every alert that the system generates shows up here in real time, newest first. CRITICAL means something is down, HIGH means degraded performance, MEDIUM is a warning, LOW is informational. You can see the route it came from, the response time for that request, and the error rate at the time.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data starts streaming immediately — you should see the charts start populating within a second or two.

Node 18+ required.

---

## How the streaming works

The browser opens a connection to `/api/stream` using the browser's built-in `EventSource` API. This is called Server-Sent Events (SSE). The server keeps the connection open and pushes new data as it generates it.

I chose SSE over WebSockets because the data only ever flows one direction — server to browser. SSE is simpler to set up, the browser handles reconnection natively, and it works through most proxies and firewalls without configuration.

The server sends different event types at different rates:

| What | How often | Why |
|------|-----------|-----|
| Traffic tick | every 100ms | smooth chart lines |
| Error signal | ~every 140ms | ~70% of ticks |
| Route health | every 2s | bar chart doesn't need to update constantly |
| Response heatmap | every 5s | slower data, 12 buckets of 5s each |
| KPI summary | every 1s | headline numbers |
| Alerts | avg every 4s | Poisson-distributed so they feel random |

If the connection drops, the client reconnects automatically using exponential backoff — starts at 1 second, doubles each attempt, maxes out at 30 seconds. There's also jitter added so if you had multiple browser tabs open, they wouldn't all try to reconnect at the same time.

---

## State management

I used Zustand. The store has six independent data slices:

- `tickSeries` — request rate over time (for the Traffic chart)
- `fraudSeries` — error rate over time (for the Error Rate chart)
- `gatewayHealth` — current response time per route (for the bar chart)
- `latencyCells` — the 5×12 grid for the heatmap
- `activityFeed` — the live events list
- `kpi` — the four headline numbers

The key thing is that each chart component subscribes only to its own slice. When a new alert comes in and updates `activityFeed`, the Traffic chart doesn't re-render because it's only watching `tickSeries`. This is Zustand's fine-grained selector pattern and it's the single most important performance decision in the codebase.

---

## Why the charts don't flicker

At 100ms tick rate the server emits about 12 events per second. If each event went straight into React state, the charts would re-render 12 times per second — that's too much and you'd see jank.

To fix this, there's a 250ms batch queue in `hooks/useThrottledUpdate.ts`. Incoming events accumulate in a buffer and get flushed to the store in a single update every 250ms. Charts render 4 times per second instead of 12, which feels smooth without burning CPU. The trade-off is about a quarter-second of lag, which you'd never notice visually.

Other rendering choices:
- `isAnimationActive={false}` on all Recharts components — the built-in spring animation causes visible jitter at fast update rates
- The KPI number cards write directly to the DOM via Framer Motion's `animate()` instead of going through React state, so the counters ticking every second don't force chart re-renders
- The Live Events feed uses TanStack Virtual — up to 1000 events are stored but only the ~6 visible rows are actually rendered in the DOM at any time
- Each chart series is capped at 300 data points via FIFO eviction — no matter how long you leave it running, memory stays bounded

---

## Folder structure

```
app/
  api/stream/route.ts     SSE endpoint — streams mock data to the browser
  page.tsx                main dashboard, composed from panel components

components/
  charts/                 area chart (traffic), area chart (error rate), bar chart, heatmap
  metrics/                KPI cards and the top status bar
  feed/                   the virtualised live events list
  controls/               pause/resume toggle, time range buttons, export
  layout/                 the CSS grid shell and reusable panel header

lib/
  generators/             mock data — uses Gaussian distribution and sine wave for realism
  store/                  Zustand store with fine-grained selectors
  stream/                 SSE connection manager and Zod payload validation
  utils/                  number formatters, chart helpers (FIFO, time filtering)

hooks/
  useThrottledUpdate.ts   250ms batch queue that turns SSE events into store updates
  useAnimatedCounter.ts   DOM-direct number animation using Framer Motion

types/index.ts            all domain types, wire types, and store types
```

---

## Trade-offs I made

**SSE instead of WebSockets** — The data only flows one way (server → browser), so WebSockets would be overkill. SSE is simpler and the browser handles reconnection automatically.

**Recharts instead of D3** — D3 gives you more rendering control but requires much more code for standard charts. Recharts integrates naturally with React and was fast enough for 4 renders/sec.

**250ms batch delay** — You lose a quarter-second of immediacy. Worth it for 10x fewer renders and no chart jitter.

**Custom SVG heatmap** — I wrote the 5×12 heatmap from scratch instead of using a library. There wasn't a library that did exactly this (fixed grid, per-cell hover tooltips, green-amber-red colour ramp). Writing it from scratch was actually less code than adapting an existing one.

**Max 300 chart points** — Older data gets dropped as new data comes in. In a live monitoring context you care about the recent window, and the time-range selector lets you zoom to the window you want.

**Zustand instead of Redux** — Redux adds a lot of boilerplate (actions, reducers, selectors). Zustand does the same job with less ceremony at this scale. If this were a much larger app with many teams touching the store, Redux Toolkit would make more sense.
