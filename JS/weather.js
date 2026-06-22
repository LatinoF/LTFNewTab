const weatherIcon = document.querySelector(".weather-icon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feels-like");
const pressure = document.querySelector(".pressure");
const uvIndexElement = document.querySelector(".uv-index");
const wind = document.querySelector(".wind");
const humidity = document.querySelector(".humidity");

const CACHE_KEY = 'ltf_weather_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Read cached weather data from localStorage.
 * Returns the cache entry (with data and iconPath) if cache exists and is fresh (< 10 min old), otherwise null.
 */
function getCachedWeather() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();

    if (now - parsed.timestamp < CACHE_DURATION) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Save weather data to localStorage with current timestamp.
 */
function saveWeatherCache(data, iconPath) {
  try {
    const cacheEntry = {
      data: data,
      iconPath: iconPath,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (e) {
    // localStorage may be full or unavailable — silently ignore
  }
}

/**
 * Update all weather UI elements from a single API response object.
 */
function updateWeatherUI(data, iconPath) {
  const current = data.current;
  const daily = data.daily;

  // Parse sunrise/sunset (ISO 8601 format)
  const sunrise = new Date(daily.sunrise[0]).getTime() / 1000;
  const sunset = new Date(daily.sunset[0]).getTime() / 1000;

  const weatherCode = current.weather_code;
  const icon = iconPath || getWeatherIconPath(weatherCode, sunrise, sunset);
  weatherIcon.setAttribute("src", icon);
  weatherIcon.onload = function() { this.classList.add('loaded'); };
  temperature.innerHTML = `${Math.round(current.temperature_2m)}&deg;C`;
  feelsLike.innerHTML = `${Math.round(current.apparent_temperature)}&deg;C`;
  pressure.innerHTML = `${Math.round(current.surface_pressure)} hPa`;
  wind.innerHTML = `${current.wind_speed_10m} km/h`;
  humidity.innerHTML = `${current.relative_humidity_2m}%`;
  uvIndexElement.innerHTML = Math.round(current.uv_index);
}

// function to fetch weather data and update the UI
function fetchWeatherData() {
  const settings = getSettings();
  const lat = settings.weatherLat || DEFAULT_SETTINGS.weatherLat;
  const lon = settings.weatherLon || DEFAULT_SETTINGS.weatherLon;

  // Stale-while-revalidate: show cached data immediately if fresh
  const cached = getCachedWeather();
  if (cached) {
    updateWeatherUI(cached.data, cached.iconPath);
  }

  // Always fetch fresh data from API in the background
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,uv_index` +
    `&daily=sunrise,sunset&timezone=auto&forecast_days=1`)
    .then(response => response.json())
    .then(data => {
      const current = data.current;
      const daily = data.daily;
      const sunrise = new Date(daily.sunrise[0]).getTime() / 1000;
      const sunset = new Date(daily.sunset[0]).getTime() / 1000;
      const iconPath = getWeatherIconPath(current.weather_code, sunrise, sunset);
      updateWeatherUI(data, iconPath);
      saveWeatherCache(data, iconPath);
    })
    .catch(error => console.log(error));
}

// initial fetch of weather data (serves cache first, then background refresh)
fetchWeatherData();

// call fetchWeatherData() every 10 minutes
setInterval(fetchWeatherData, 10*60000);

// set weather condition icons
function getWeatherIconPath(weatherCode, sunrise, sunset) {
  const currentTime = new Date().getTime() / 1000;
  const isDaytime = currentTime >= sunrise && currentTime <= sunset;
  const baseUrl = "https://cdn.jsdelivr.net/npm/@meteocons/svg@3.0.0-next.10/fill/";

  if (weatherCode === 0) {
    // Clear sky
    return isDaytime ? baseUrl + "clear-day.svg" : baseUrl + "clear-night.svg";
  } else if (weatherCode === 1 || weatherCode === 2) {
    // Mainly clear, partly cloudy
    return isDaytime ? baseUrl + "partly-cloudy-day.svg" : baseUrl + "partly-cloudy-night.svg";
  } else if (weatherCode === 3) {
    // Overcast
    return isDaytime ? baseUrl + "overcast-day.svg" : baseUrl + "overcast-night.svg";
  } else if (weatherCode === 45 || weatherCode === 48) {
    // Fog and depositing rime fog
    return baseUrl + "fog.svg";
  } else if (weatherCode >= 51 && weatherCode <= 57) {
    // Drizzle: Light, moderate, and dense intensity
    // Freezing Drizzle: Light and dense intensity
    return isDaytime ? baseUrl + "partly-cloudy-day-drizzle.svg" : baseUrl + "partly-cloudy-night-drizzle.svg";
  } else if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    // Rain: Slight, moderate and heavy intensity
    // Freezing Rain: Light and heavy intensity
    // Rain showers: Slight, moderate and violent intensity
    return baseUrl + "rain.svg";
  } else if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    // Snow fall: Slight, moderate, and heavy intensity
    // Snow grains
    // Snow showers slight and heavy
    return baseUrl + "snow.svg";
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    // Thunderstorm: Slight or moderate
    // Thunderstorm with slight and heavy hail
    return baseUrl + "thunderstorms.svg";
  } else {
    return baseUrl + "not-available.svg";
  }
}


//Tooltip Show/Hide on Hover
const weatherWidget = document.querySelector('.weather-widget');
const weatherInfo = document.querySelector('.weather-info');

if (weatherWidget && weatherInfo) {
  weatherWidget.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    weatherInfo.style.top = mouseY + 8 + 'px';
    weatherInfo.style.left = mouseX + 8 + 'px';
    weatherInfo.style.visibility = 'visible';
    weatherInfo.style.opacity = 1;
  });

  weatherWidget.addEventListener('mouseleave', () => {
    weatherInfo.style.visibility = 'hidden';
    weatherInfo.style.opacity = 0;
  });
}
