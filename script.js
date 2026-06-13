/* ============================================
   SkyCheck — Weather Lookup App
   Uses Open-Meteo (no API key required)
   - Geocoding API: turns a city name into coordinates
   - Forecast API: turns coordinates into weather data
============================================ */

// Grab all the elements we need to update
const searchForm   = document.getElementById('searchForm');
const cityInput    = document.getElementById('cityInput');
const cityChips    = document.querySelectorAll('.city-chip');

const loadingState = document.getElementById('loadingState');
const errorState   = document.getElementById('errorState');
const emptyState   = document.getElementById('emptyState');
const weatherCard  = document.getElementById('weatherCard');

const errorTitle   = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');

const cityName     = document.getElementById('cityName');
const cityRegion   = document.getElementById('cityRegion');
const weatherIcon  = document.getElementById('weatherIcon');
const weatherTemp  = document.getElementById('weatherTemp');
const weatherCondition = document.getElementById('weatherCondition');
const feelsLike    = document.getElementById('feelsLike');
const humidity     = document.getElementById('humidity');
const windSpeed    = document.getElementById('windSpeed');
const updatedTime  = document.getElementById('updatedTime');

// Open-Meteo weather codes mapped to a simple description + emoji
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const weatherCodeMap = {
  0:  { label: 'Clear sky',            icon: '☀' },
  1:  { label: 'Mostly clear',         icon: '🌤' },
  2:  { label: 'Partly cloudy',        icon: '⛅' },
  3:  { label: 'Overcast',             icon: '☁' },
  45: { label: 'Foggy',                icon: '🌫' },
  48: { label: 'Freezing fog',         icon: '🌫' },
  51: { label: 'Light drizzle',        icon: '🌦' },
  53: { label: 'Drizzle',              icon: '🌦' },
  55: { label: 'Heavy drizzle',        icon: '🌧' },
  61: { label: 'Light rain',           icon: '🌧' },
  63: { label: 'Rain',                 icon: '🌧' },
  65: { label: 'Heavy rain',           icon: '🌧' },
  71: { label: 'Light snow',           icon: '🌨' },
  73: { label: 'Snow',                 icon: '🌨' },
  75: { label: 'Heavy snow',           icon: '❄' },
  80: { label: 'Rain showers',         icon: '🌦' },
  81: { label: 'Heavy rain showers',   icon: '🌧' },
  82: { label: 'Violent rain showers', icon: '⛈' },
  95: { label: 'Thunderstorm',         icon: '⛈' },
  96: { label: 'Thunderstorm + hail',  icon: '⛈' },
  99: { label: 'Severe thunderstorm',  icon: '⛈' },
};

/**
 * Shows only one of: loading / error / empty / weather card
 * by hiding the other three.
 */
function showOnly(panel) {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  weatherCard.classList.add('hidden');

  panel.classList.remove('hidden');
}

/**
 * Step 1 — turn a city name into latitude/longitude
 * using Open-Meteo's free geocoding endpoint.
 */
async function getCityCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('GEOCODE_FAILED');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('CITY_NOT_FOUND');
  }

  const place = data.results[0];

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    region: [place.admin1, place.country].filter(Boolean).join(', '),
  };
}

/**
 * Step 2 — fetch current weather for a given lat/lon
 * using Open-Meteo's free forecast endpoint.
 */
async function getWeatherForCoordinates(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('WEATHER_FAILED');
  }

  const data = await response.json();

  if (!data.current) {
    throw new Error('WEATHER_FAILED');
  }

  return data.current;
}

/**
 * Fills the weather card with data and shows it.
 */
function renderWeather(place, current) {
  const code = current.weather_code;
  const conditionInfo = weatherCodeMap[code] || { label: 'Unknown', icon: '🌡' };

  cityName.textContent   = place.name;
  cityRegion.textContent = place.region || 'Location found';

  weatherIcon.textContent = conditionInfo.icon;
  weatherTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
  weatherCondition.textContent = conditionInfo.label;

  feelsLike.textContent  = `${Math.round(current.apparent_temperature)}°C`;
  humidity.textContent   = `${current.relative_humidity_2m}%`;
  windSpeed.textContent  = `${Math.round(current.wind_speed_10m)} km/h`;

  const now = new Date();
  updatedTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  showOnly(weatherCard);
}

/**
 * Shows a friendly error message based on what went wrong.
 */
function renderError(error) {
  if (error.message === 'CITY_NOT_FOUND') {
    errorTitle.textContent = 'City not found';
    errorMessage.textContent = "We couldn't find that place. Double-check the spelling and try again.";
  } else {
    errorTitle.textContent = 'Something went wrong';
    errorMessage.textContent = 'We had trouble reaching the weather service. Please try again in a moment.';
  }

  showOnly(errorState);
}

/**
 * Main function — runs the full search flow:
 * loading state -> geocode -> weather -> render
 */
async function searchWeather(city) {
  const trimmedCity = city.trim();

  if (!trimmedCity) {
    return;
  }

  showOnly(loadingState);

  try {
    const place = await getCityCoordinates(trimmedCity);
    const current = await getWeatherForCoordinates(place.latitude, place.longitude);
    renderWeather(place, current);
  } catch (error) {
    console.error('Weather lookup failed:', error);
    renderError(error);
  }
}

// Handle the search form submit
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

// Handle quick city chip clicks
cityChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const city = chip.dataset.city;
    cityInput.value = city;
    searchWeather(city);
  });
});

// Load a default city on first visit so the page isn't empty
window.addEventListener('DOMContentLoaded', () => {
  cityInput.value = 'Vadodara';
  searchWeather('Vadodara');
});
