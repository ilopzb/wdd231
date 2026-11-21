// Weather fix: use the API key already defined in home.js without duplicating it.
// Keep this script after home.js in index.html.
(async function showLiveWeather() {
  const currentBox = document.querySelector("#current-weather");
  const forecastBox = document.querySelector("#forecast-list");

  if (typeof apiKey !== "string" || !apiKey || apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
    currentBox.textContent = "Weather API key is not configured.";
    forecastBox.replaceChildren();
    return;
  }

  const search = new URLSearchParams({
    lat: "4.7110",
    lon: "-74.0721",
    appid: apiKey,
    units: "metric",
    lang: "en"
  });

  try {
    currentBox.textContent = "Loading live weather...";
    forecastBox.replaceChildren();

    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch("https://api.openweathermap.org/data/2.5/weather?" + search),
      fetch("https://api.openweathermap.org/data/2.5/forecast?" + search)
    ]);

    if (!weatherResponse.ok || !forecastResponse.ok) {
      const status = !weatherResponse.ok ? weatherResponse.status : forecastResponse.status;
      throw new Error("OpenWeatherMap returned HTTP " + status);
    }

    const weather = await weatherResponse.json();
    const forecast = await forecastResponse.json();

    const temp = document.createElement("p");
    temp.className = "current-temp";
    temp.textContent = Math.round(weather.main.temp) + "°C";

    const description = document.createElement("p");
    const condition = weather.weather[0].description;
    description.textContent = condition[0].toUpperCase() + condition.slice(1);
    currentBox.replaceChildren(temp, description);

    const bogotaDateKey = (date) => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        year: "numeric", month: "2-digit", day: "2-digit"
      }).formatToParts(date);
      const piece = (type) => parts.find(part => part.type === type).value;
      return piece("year") + "-" + piece("month") + "-" + piece("day");
    };
    const bogotaHour = (date) => Number(new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota", hour: "numeric", hourCycle: "h23"
    }).format(date));
    const today = bogotaDateKey(new Date());
    const daily = new Map();

    for (const entry of forecast.list) {
      const date = new Date(entry.dt * 1000);
      const day = bogotaDateKey(date);
      if (day <= today) continue;
      const distance = Math.abs(bogotaHour(date) - 12);
      if (!daily.has(day) || distance < daily.get(day).distance) {
        daily.set(day, { date, temperature: entry.main.temp, distance });
      }
    }

    const labels = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota", weekday: "long", month: "short", day: "numeric"
    });
    for (const [, day] of [...daily].sort(([a], [b]) => a.localeCompare(b)).slice(0, 3)) {
      const item = document.createElement("li");
      item.textContent = labels.format(day.date) + ": " + Math.round(day.temperature) + "°C";
      forecastBox.appendChild(item);
    }

    if (!forecastBox.children.length) {
      forecastBox.textContent = "No forecast data available.";
    }
  } catch (error) {
    console.error("Bogotá weather:", error.message);
    currentBox.textContent = error.message.includes("401")
      ? "OpenWeatherMap rejected the API key (401). Check or activate the key."
      : "Weather unavailable: " + error.message;
    forecastBox.replaceChildren();
  }
})();
