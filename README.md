# SkyCheck — Live Weather Lookup

A small weather app where you type a city name and instantly see the current
weather conditions: temperature, feels-like, humidity, and wind speed.

Built for **Task 6: API Integration Project** — Synent Technologies Web
Development Internship.

---

## What it does

- Type any city name and click **Check weather** (or press Enter)
- Click one of the quick city chips for an instant lookup
- Shows a **loading spinner** while data is being fetched
- Shows a clear **error message** if the city isn't found or the network fails
- Displays temperature, weather condition, feels-like temperature, humidity,
  wind speed, and the last updated time

---

## How it works (tech overview)

This app calls two free public APIs from **Open-Meteo** — no API key, no
sign-up, no payment required:

1. **Geocoding API** — converts the city name you type into latitude /
   longitude coordinates
   `https://geocoding-api.open-meteo.com/v1/search`

2. **Forecast API** — takes those coordinates and returns the current
   weather
   `https://api.open-meteo.com/v1/forecast`

Both calls are made using the browser's built-in `fetch()` function — no
extra libraries needed.

---

## File structure

```
weather-now-app/
├── index.html      → Page structure (search box, result card, states)
├── styles.css      → All styling
├── script.js       → Fetch logic, loading/error handling, rendering
└── README.md       → This file
```

---

## How to run it locally

You don't need Node.js, npm, or any build tools. Just open the file in a
browser.

### Option 1 — Just double-click (simplest)

1. Download / clone this folder
2. Double-click `index.html`
3. It opens in your default browser and works immediately

### Option 2 — VS Code Live Server (recommended for development)

1. Open this folder in VS Code
2. Install the **"Live Server"** extension (by Ritwick Dey) if you don't
   have it
3. Right-click `index.html` → **"Open with Live Server"**
4. The page opens at something like `http://127.0.0.1:5500`

### Option 3 — Python's built-in server

If you have Python installed, run this inside the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## Notes

- Since this app calls a live API, you need an **internet connection** for
  it to work.
- Open-Meteo is completely free and does not require any API key or
  registration — that's why this project has no `.env` file or secret keys.
- On first load, the app automatically searches for "Vadodara" so the page
  isn't empty — feel free to change this default city in `script.js`
  (search for `DOMContentLoaded`).

---

## Possible improvements (optional, for advanced version)

- Add a 5-day forecast view
- Add geolocation ("use my current location" button)
- Switch between °C and °F
- Add city search suggestions/autocomplete while typing
