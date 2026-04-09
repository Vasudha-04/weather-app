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

    displayWeather(currentData);
    displayForecast(forecastData);

  } catch (error) {
    document.getElementById("result").innerHTML = "City not found!";
    document.querySelector(".forecast-container").innerHTML = "";
  }
}

function displayWeather(data) {
  const result = document.getElementById("result");

  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const description = data.weather[0].description;
  const cityName = data.name;
  const windSpeed = data.wind.speed;
  const rain = data.rain ? data.rain["1h"] : 0;
  const icon = data.weather[0].icon;

  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  result.innerHTML = `
    <h3>${cityName}</h3>
    <img src="${iconUrl}">
    <p>Temperature: ${temp}°C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
    <p>Pressure: ${pressure} hPa</p>
    <p>Rain (1h): ${rain} mm</p>
    <p>Condition: ${description}</p>
  `;
}

function displayForecast(data) {
  const container = document.querySelector(".forecast-container");

  // clear old data
  container.innerHTML = "";

  for (let i = 0; i < data.list.length; i += 8) {
    const item = data.list[i];

    const date = new Date(item.dt * 1000).toDateString();
    const temp = item.main.temp;
    const description = item.weather[0].description;
    const icon = item.weather[0].icon;

    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

    container.innerHTML += `
      <div class="forecast-card">
        <p><b>${date}</b></p>
        <img src="${iconUrl}">
        <p>${temp}°C</p>
        <p>${description}</p>
      </div>
    `;
  }
}