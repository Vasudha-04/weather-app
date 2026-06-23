const apiKey = "41a26112990da6374ecdfdea25d529b4";

// DOM Elements
const cityInput = document.getElementById("city");
const searchBtn = document.querySelector(".search-container button");
const resultSection = document.getElementById("result");
const forecastSection = document.getElementById("forecast-section");
const forecastContainer = document.querySelector(".forecast-container");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorMessageEl = document.getElementById("error-message");

// Event Listeners
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});

// Utility Functions
function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  resultSection.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

function showError(message) {
  hideLoading();
  errorEl.classList.remove("hidden");
  errorMessageEl.innerText = message;
  resultSection.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

function getWeatherIcon(conditionCode) {
  // Map OpenWeatherMap condition codes to Phosphor Icons
  // Reference: https://openweathermap.org/weather-conditions
  if (conditionCode >= 200 && conditionCode < 300) return "ph-cloud-lightning";
  if (conditionCode >= 300 && conditionCode < 400) return "ph-cloud-drizzle";
  if (conditionCode >= 500 && conditionCode < 600) return "ph-cloud-rain";
  if (conditionCode >= 600 && conditionCode < 700) return "ph-snowflake";
  if (conditionCode >= 700 && conditionCode < 800) return "ph-cloud-fog";
  if (conditionCode === 800) return "ph-sun";
  if (conditionCode === 801 || conditionCode === 802) return "ph-cloud-sun";
  if (conditionCode === 803 || conditionCode === 804) return "ph-cloud";
  return "ph-cloud"; // Default
}

// API Calls
async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  await fetchWeatherData(currentUrl, forecastUrl);
}

async function getWeatherByLocation() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        await fetchWeatherData(currentUrl, forecastUrl);
      },
      (error) => {
        showError("Unable to retrieve your location.");
      }
    );
  } else {
    showError("Geolocation is not supported by your browser.");
  }
}

async function fetchWeatherData(currentUrl, forecastUrl) {
  showLoading();
  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      if (currentResponse.status === 404) {
        throw new Error("City not found.");
      } else {
        throw new Error("An error occurred while fetching data.");
      }
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    displayWeather(currentData);
    displayForecast(forecastData);

    hideLoading();
    resultSection.classList.remove("hidden");
    forecastSection.classList.remove("hidden");
  } catch (error) {
    showError(error.message);
  }
}

// UI Rendering
function displayWeather(data) {
  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const conditionCode = data.weather[0].id;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const pressure = data.main.pressure;
  const cityName = data.name;
  const country = data.sys.country;
  const iconClass = getWeatherIcon(conditionCode);

  resultSection.innerHTML = `
    <h2 class="city-name">${cityName}, ${country}</h2>
    <p class="weather-desc">${description}</p>
    
    <div class="main-weather">
      <i class="ph ${iconClass} weather-icon-large" style="color: ${getIconColor(conditionCode)}"></i>
      <p class="temp-large">${temp}°</p>
    </div>
    
    <div class="details-grid">
      <div class="detail-item">
        <i class="ph ph-drop"></i>
        <span class="detail-label">Humidity</span>
        <span class="detail-value">${humidity}%</span>
      </div>
      <div class="detail-item">
        <i class="ph ph-wind"></i>
        <span class="detail-label">Wind</span>
        <span class="detail-value">${windSpeed} m/s</span>
      </div>
      <div class="detail-item">
        <i class="ph ph-gauge"></i>
        <span class="detail-label">Pressure</span>
        <span class="detail-value">${pressure} hPa</span>
      </div>
      <div class="detail-item">
        <i class="ph ph-thermometer"></i>
        <span class="detail-label">Feels Like</span>
        <span class="detail-value">${Math.round(data.main.feels_like)}°</span>
      </div>
    </div>
  `;
}

function displayForecast(data) {
  forecastContainer.innerHTML = "";

  // Get one reading per day (every 8th item, roughly midday)
  const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

  dailyData.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const temp = Math.round(item.main.temp);
    const description = item.weather[0].description;
    const conditionCode = item.weather[0].id;
    const iconClass = getWeatherIcon(conditionCode);

    forecastContainer.innerHTML += `
      <div class="forecast-card">
        <p class="forecast-date">${date}</p>
        <i class="ph ${iconClass} forecast-icon" style="color: ${getIconColor(conditionCode)}"></i>
        <p class="forecast-temp">${temp}°</p>
        <p class="forecast-desc">${description}</p>
      </div>
    `;
  });
}

function getIconColor(conditionCode) {
  if (conditionCode >= 200 && conditionCode < 300) return "#fbbf24"; // Lightning (Yellow)
  if (conditionCode >= 300 && conditionCode < 600) return "#60a5fa"; // Rain (Blue)
  if (conditionCode >= 600 && conditionCode < 700) return "#e2e8f0"; // Snow (White)
  if (conditionCode >= 700 && conditionCode < 800) return "#94a3b8"; // Fog (Gray)
  if (conditionCode === 800) return "#fbbf24"; // Sun (Yellow)
  return "#e2e8f0"; // Clouds (White/Gray)
}

// Automatically request location weather on startup (Optional, but good UX)
document.addEventListener("DOMContentLoaded", () => {
    // Optionally trigger location on load, or wait for user to click button
    // getWeatherByLocation(); 
});