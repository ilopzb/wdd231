
 // Bogotá Community Chamber - Home Page
// Weather Dashboard and Member Spotlights

const apiKey = "2acaf0ece719573833a9446e3b17594c";
const bogotaLat = 4.7110;
const bogotaLon = -74.0721;

const spotlights = document.querySelector("#spotlights");

// ===============================
// WEATHER DASHBOARD
// ===============================

async function loadWeather() {
  const temperature = document.querySelector("#weather-temperature");
  const condition = document.querySelector("#weather-condition");
  const icon = document.querySelector("#weather-icon");
  const feels = document.querySelector("#weather-feels");
  const humidity = document.querySelector("#weather-humidity");
  const wind = document.querySelector("#weather-wind");
  const forecastCards = document.querySelector("#forecast-cards");
  const status = document.querySelector("#weather-status");
  const updated = document.querySelector("#weather-updated");
  const refreshButton = document.querySelector("#refresh-weather");


  refreshButton.disabled = true;
  status.textContent = "Updating weather...";

  const query = new URLSearchParams({
    lat: bogotaLat,
    lon: bogotaLon,
    appid: apiKey,
    units: "metric",
    lang: "en"
  });

  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      const errorCode = !currentResponse.ok
        ? currentResponse.status
        : forecastResponse.status;

      throw new Error(`OpenWeatherMap error: ${errorCode}`);
    }

    const current = await currentResponse.json();
    const forecast = await forecastResponse.json();

    // Current temperature
    temperature.textContent = `${Math.round(current.main.temp)}°C`;

    // Current weather condition
    const description = current.weather[0].description;

    condition.textContent =
      description.charAt(0).toUpperCase() + description.slice(1);

    // Dynamic weather icon
    icon.src =
      `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

    icon.alt = description;
    icon.hidden = false;

    // Weather details
    feels.textContent = `${Math.round(current.main.feels_like)}°C`;
    humidity.textContent = `${current.main.humidity}%`;
    wind.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;

    // ===============================
    // THREE-DAY FORECAST
    // ===============================

    function getBogotaDate(date) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(date);

      const get = (type) =>
        parts.find(part => part.type === type).value;

      return `${get("year")}-${get("month")}-${get("day")}`;
    }

    function getBogotaHour(date) {
      return Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Bogota",
          hour: "numeric",
          hourCycle: "h23"
        }).format(date)
      );
    }

    const today = getBogotaDate(new Date());
    const dailyForecasts = new Map();

    // Find the forecast closest to noon for each day
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = getBogotaDate(date);

      if (day <= today) return;

      const distance = Math.abs(getBogotaHour(date) - 12);

      if (
        !dailyForecasts.has(day) ||
        distance < dailyForecasts.get(day).distance
      ) {
        dailyForecasts.set(day, {
          date,
          temperature: item.main.temp,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          distance
        });
      }
    });

    const nextThreeDays = [...dailyForecasts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 3)
      .map(([, value]) => value);

    forecastCards.replaceChildren();

    const dayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    nextThreeDays.forEach(day => {
      const card = document.createElement("div");
      card.className = "forecast-card";

      const dayName = document.createElement("h4");
      dayName.textContent = dayFormatter.format(day.date);

      const weatherIcon = document.createElement("img");
      weatherIcon.src =
        `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
      weatherIcon.alt = day.description;
      weatherIcon.width = 70;
      weatherIcon.height = 70;

      const temp = document.createElement("strong");
      temp.textContent = `${Math.round(day.temperature)}°C`;

      const label = document.createElement("small");
      label.textContent = "Around noon";

      card.append(dayName, weatherIcon, temp, label);
      forecastCards.appendChild(card);
    });

    if (nextThreeDays.length === 0) {
      forecastCards.textContent = "Forecast unavailable.";
    }

    // Last updated time
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    updated.textContent =
      `Updated ${timeFormatter.format(new Date())} (Bogotá time)`;

    status.textContent = "";

  } catch (error) {
    console.error("Weather error:", error);

    status.textContent =
      `Unable to update weather: ${error.message}`;

  } finally {
    refreshButton.disabled = false;
  }
}

// Refresh weather when button is clicked
document.querySelector("#refresh-weather")
  .addEventListener("click", loadWeather);


// ===============================
// RANDOM MEMBER SPOTLIGHTS
// ===============================

async function loadSpotlights() {
  try {
    const response = await fetch("data/members.json");

    if (!response.ok) {
      throw new Error("Could not load members data.");
    }

    const data = await response.json();

    // Only Silver (2) and Gold (3) members
    const eligible = data.members.filter(
      member => member.membership === 2 || member.membership === 3
    );

    // Randomize members using Fisher-Yates shuffle
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [eligible[i], eligible[j]] =
        [eligible[j], eligible[i]];
    }

    spotlights.replaceChildren();

    // Display three random members
    eligible.slice(0, 3).forEach(member => {
      const card = document.createElement("article");
      card.className = "spotlight-card";

      const heading = document.createElement("h3");
      heading.textContent = member.name;

      const image = document.createElement("img");
      image.src = `images/${member.image}`;
      image.alt = `${member.name} logo`;
      image.loading = "lazy";
      image.width = 260;
      image.height = 140;

      const address = document.createElement("p");
      address.textContent = `Address: ${member.address}`;

      const phone = document.createElement("p");
      const phoneLink = document.createElement("a");

      phoneLink.href =
        `tel:${member.phone.replace(/[^\d+]/g, "")}`;

      phoneLink.textContent = member.phone;
      phone.append("Phone: ", phoneLink);

      const website = document.createElement("p");
      const websiteLink = document.createElement("a");

      websiteLink.href = member.website;
      websiteLink.target = "_blank";
      websiteLink.rel = "noopener noreferrer";
      websiteLink.textContent = "Visit website";

      website.append("Website: ", websiteLink);

      const membership = document.createElement("p");
      const membershipLabel = document.createElement("span");

      const isGold = member.membership === 3;

      membershipLabel.className =
        `membership-level ${isGold ? "gold" : "silver"}`;

      membershipLabel.textContent =
        isGold ? "Gold Member" : "Silver Member";

      membership.appendChild(membershipLabel);

      card.append(
        heading,
        image,
        address,
        phone,
        website,
        membership
      );

      spotlights.appendChild(card);
    });

    if (!eligible.length) {
      spotlights.textContent =
        "No eligible member spotlights found.";
    }

  } catch (error) {
    console.error("Spotlights error:", error);

    spotlights.textContent =
      "Member spotlights could not be loaded.";
  }
}


// ===============================
// INITIALIZE HOME PAGE
// ===============================

loadWeather();
loadSpotlights();
