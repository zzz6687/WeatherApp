const submitBtn = document.querySelector("button");
const weatherInfoToday = document.querySelector(".weatherInfoToday");
const bodyElement = document.querySelector("body");
const weekForecast = document.querySelector(".weekForecast");
const metricBtn = document.getElementById("metric-system");

let lastWeatherData = null;

window.onload = async function () {
  const defaultLocation = "London";
  const weatherDataToday = await fetchWeatherDataToday(defaultLocation);
  const weatherDataWeek = await fetchWeatherDataWeek(defaultLocation);
  if (weatherDataToday && weatherDataWeek) {
    const weatherToday = await getWeatherDataToday(weatherDataToday);
    const weatherWeek = await getWeatherDataWeek(weatherDataWeek);
    lastWeatherData = weatherToday;
    renderWeather(weatherToday);
    renderWeatherWeek(weatherWeek);
    iconSwitch(weatherToday);
  }
};

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = document.getElementById("location").value;
  const weatherDataToday = await fetchWeatherDataToday(location);
  const weatherToday = await getWeatherDataToday(weatherDataToday);
  const weatherDataWeek = await fetchWeatherDataWeek(location);
  const weatherWeek = await getWeatherDataWeek(weatherDataWeek);

  lastWeatherData = weatherToday;
  renderWeather(weatherToday);
  renderWeatherWeek(weatherWeek);

  iconSwitch(weatherToday);
});

metricBtn.addEventListener("click", () => {
  if (metricBtn.textContent === "°F") {
    metricBtn.textContent = "°C";
  } else {
    metricBtn.textContent = "°F";
  }

  if (lastWeatherData) {
    renderWeather(lastWeatherData);
  }

  const location = document.getElementById("location").value || "London";
  fetchWeatherDataWeek(location)
    .then(getWeatherDataWeek)
    .then((weatherWeek) => {
      renderWeatherWeek(weatherWeek);
    });
});

function getCurrentHour() {
  return new Date().getHours();
}

function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

function updateTemperatureDisplay(element, tempFahrenheit) {
  if (metricBtn.textContent === "°F") {
    element.textContent = `${fahrenheitToCelsius(tempFahrenheit).toFixed(1)}°C`;
  } else {
    element.textContent = `${tempFahrenheit}°F`;
  }
}

async function fetchWeatherDataToday(location) {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/today?key=HX56DNYKBDHXA274A73J8YNA8`,
      { mode: "cors" }
    );

    if (!response.ok) {
      alert("Weather data not found for this location");
      throw new Error("Weather data not found for this location");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

async function fetchWeatherDataWeek(location) {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?key=HX56DNYKBDHXA274A73J8YNA8`,
      { mode: "cors" }
    );

    if (!response.ok) {
      alert("Weather data not found for this week in this location");
      throw new Error("Weather data not found for this location");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

function getWeatherDataToday(data) {
  if (!data || !data.days || data.days.length === 0) return null;
  const today = data.days[0];
  const currentHour = getCurrentHour();

  const hourData =
    today.hours.find((h) => {
      const hour = Number(h.datetime.split(":")[0]);
      return hour === currentHour;
    }) || today.hours[0];

  return {
    location: data.address,
    temp: hourData.temp,
    conditions: hourData.conditions,
    sunrise: today.sunrise,
    sunset: today.sunset,
    windspeed: hourData.windspeed,
    iconRaw: hourData.icon,
  };
}

function getWeatherDataWeek(data) {
  if (!data || !data.days || data.days.length === 0) return null;
  const today = data.days[0];

  const weeklyForecast = data.days.map((day) => ({
    date: day.datetime,
    tempMax: day.tempmax,
    tempMin: day.tempmin,
    conditions: day.conditions,
    icon: day.icon,
  }));

  return {
    weeklyForecast,
  };
}

function renderWeather(weather) {
  weatherInfoToday.innerHTML = "";

  if (!weather) {
    weatherInfoToday.innerHTML = "<p>Weather data unavailable</p>";
    return;
  }

  const tempText = document.createElement("p");
  const rightSide = document.createElement("div");
  const leftSide = document.createElement("div");
  rightSide.classList.add("rightSide");

  tempText.classList.add("left-side");
  tempText.id = "temperature-display";
  leftSide.appendChild(tempText);

  updateTemperatureDisplay(tempText, weather.temp);

  const locationText = document.createElement("p");
  locationText.textContent = `${weather.location}`;
  locationText.id = "location-text";
  leftSide.appendChild(locationText);

  const conditionsText = document.createElement("p");
  conditionsText.textContent = `Conditions: ${weather.conditions}`;

  rightSide.appendChild(conditionsText);
  const sunriseText = document.createElement("p");
  sunriseText.textContent = `${weather.sunrise}`;
  if (!weather.sunrise) {
    sunriseText.textContent = `Sunrise: No sunrise`;
  } else {
    sunriseText.textContent = `Sunrise: ${weather.sunrise}`;
  }
  rightSide.appendChild(sunriseText);

  const sunsetText = document.createElement("p");
  sunsetText.textContent = `${weather.sunset}`;
  if (!weather.sunset) {
    sunsetText.textContent = `Sunset: No sunset`;
  } else {
    sunsetText.textContent = `Sunset: ${weather.sunset}`;
  }
  rightSide.appendChild(sunsetText);

  const windspeedText = document.createElement("p");
  windspeedText.textContent = `Windspeed: ${weather.windspeed}`;
  rightSide.appendChild(windspeedText);

  weatherInfoToday.appendChild(leftSide);
  weatherInfoToday.appendChild(rightSide);
}

function renderWeatherWeek(weather) {
  weekForecast.innerHTML = "";

  if (!weather) {
    weekForecast.innerHTML = "<p>Weather data unavailable</p>";
    return;
  }

  const daysToShow = weather.weeklyForecast.slice(2, 8);

  daysToShow.forEach((day) => {
    const dayElement = document.createElement("div");

    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayText = document.createElement("p");
    dayText.textContent = dayName;
    dayElement.appendChild(dayText);

    const icon = document.createElement("img");
    icon.src = getWeatherIcon(day.conditions);
    dayElement.appendChild(icon);

    const tempText = document.createElement("p");
    updateTemperatureDisplay(tempText, day.tempMax);
    dayElement.appendChild(tempText);

    weekForecast.appendChild(dayElement);
  });
}

function getWeatherIcon(conditions) {
  switch (conditions) {
    case "Overcast":
    case "Partially cloudy":
      return { path: "/icons/clouds.png", alt: "Cloudy" };
    case "Clear":
      return { path: "/icons/sun.png", alt: "Clear" };
    case "Snow":
      return { path: "/icons/snowy.png", alt: "Snowy" };
    case "Rain, Partially cloudy":
    case "Rain":
      return { path: "/icons/rainy-day.png", alt: "Rainy" };
    default:
      return { path: "/icons/sun.png", alt: "Clear" };
  }
}

function iconSwitch(weather) {
  switch (weather.conditions) {
    case "Overcast":
      return (bodyElement.style.background =
        "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)");

    case "Partially cloudy":
      return (bodyElement.style.background =
        "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)");

    case "Clear":
      return (bodyElement.style.background =
        "linear-gradient(135deg, #f6d365 0%, #fda085 100%)");

    case "Snow":
      return (bodyElement.style.background =
        "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 50%, #d1d8e8 100%)");

    case "Rain":
    case "Rain, Partially cloudy":
      return (bodyElement.style.background =
        "linear-gradient(135deg, #6a85b6 0%, #bac8e0 50%, #3a4a6b 100%)");

    default:
      return (bodyElement.style.background =
        "linear-gradient(135deg, #f6d365 0%, #fda085 100%)");
  }
}
