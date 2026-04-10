const apiKey = "41a26112990da6374ecdfdea25d529b4";

async function getWeather() {
  const city = document.getElementById("city").value;
  if (!city) {
    alert("Enter a city name");
    return;
  }

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const currentResponse = await fetch(currentUrl);
    const forecastResponse = await fetch(forecastUrl);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error("City not found");
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // --- MOVE THESE DOWN HERE ---
    // This ensures they ONLY show if the search is successful
    document.querySelector("h1").style.fontSize = "1.5rem";
    document.querySelector("h1").style.margin = "10px 0";
    document.getElementById("forecast-heading").innerText = "Upcoming Weather";
    document.getElementById("forecast-heading").style.display = "block";
    
    document.getElementById("result").style.display = "block";
    document.querySelector(".forecast-container").style.display = "flex";
    // ----------------------------

    displayWeather(currentData);
    displayForecast(forecastData);

} catch (error) {
    const resultDiv = document.getElementById("result");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "City not found!";
    
    // This part is perfect—it hides everything if there's an error
    document.querySelector(".forecast-container").style.display = "none";
    document.getElementById("forecast-heading").style.display = "none";
}
}

function displayWeather(data) {
  const result = document.getElementById("result");
  const description = data.weather[0].description; // Keep one declaration
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const cityName = data.name;
  const windSpeed = data.wind.speed;
  const pressure = data.main.pressure;

  // Logic for the emoji
  let emoji = "🌤";
  const descLower = description.toLowerCase();
  if (descLower.includes("rain")) emoji = "🌧";
  else if (descLower.includes("cloud")) emoji = "☁";
  else if (descLower.includes("clear")) emoji = "☀";
  else if (descLower.includes("thunder")) emoji = "⛈";
  else if (descLower.includes("mist")) emoji = "🌫";

  result.innerHTML = `
  <h2 style="margin: 0;">${cityName}</h2>
  <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
    <div class="emoji" style="font-size: 60px;">${emoji}</div>
    <p style="font-size: 2rem; font-weight: bold; margin: 0;">${temp}°C</p>
  </div>
  <p style="margin: 5px 0; text-transform: capitalize;">${description}</p>
  <div style="display: flex; justify-content: space-around; font-size: 0.9rem;">
    <span>💧 ${humidity}%</span>
    <span>💨 ${windSpeed}m/s</span>
  </div>
`;
}

function displayForecast(data) {
  const container = document.querySelector(".forecast-container");
  container.innerHTML = "";

  for (let i = 0; i < data.list.length; i += 8) {
    const item = data.list[i];
    const date = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const temp = item.main.temp;
    const description = item.weather[0].description;
    
    // Quick emoji logic for forecast cards
    let emoji = "🌤";
    if (description.includes("rain")) emoji = "🌧";
    else if (description.includes("cloud")) emoji = "☁";
    else if (description.includes("clear")) emoji = "☀";

    container.innerHTML += `
      <div class="forecast-card">
        <p><strong>${date}</strong></p>
        <div class="emoji-small">${emoji}</div>
        <p>${temp}°C</p>
        <p style="font-size: 12px;">${description}</p>
      </div>
    `;
  }
}