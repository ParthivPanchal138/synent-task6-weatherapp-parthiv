
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
function showOnly(panel) {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  weatherCard.classList.add('hidden');

  panel.classList.remove('hidden');
}
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
window.addEventListener('DOMContentLoaded', () => {
  cityInput.value = 'Vadodara';
  searchWeather('Vadodara');
});
