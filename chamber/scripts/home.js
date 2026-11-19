// Chamber home page: live Bogotá weather and randomly selected member spotlights.
const apiKey = "2acaf0ece719573833a9446e3b17594c"; // Replace with your OpenWeatherMap key.
const bogotaLat = 4.7110;
const bogotaLon = -74.0721;
const currentWeather = document.querySelector("#current-weather");
const forecastList = document.querySelector("#forecast-list");
const spotlights = document.querySelector("#spotlights");

async function loadWeather() {
  if (apiKey === "2acaf0ece719573833a9446e3b17594c") {
    currentWeather.textContent = "Add your OpenWeatherMap API key in scripts/home.js to show live weather.";
    forecastList.innerHTML = "<li>Forecast available after API key setup.</li>";
    return;
  }

  const query = `lat=${bogotaLat}&lon=${bogotaLon}&appid=${apiKey}&units=metric&lang=en`;

  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error("OpenWeatherMap request failed. Check your API key.");
    }

    const current = await currentResponse.json();
    const forecast = await forecastResponse.json();

    currentWeather.replaceChildren();
    const temperature = document.createElement("p");
    temperature.className = "current-temp";
    temperature.textContent = `${Math.round(current.main.temp)}°C`;
    const description = document.createElement("p");
    const conditions = current.weather[0].description;
    description.textContent = conditions.charAt(0).toUpperCase() + conditions.slice(1);
    currentWeather.append(temperature, description);

    // The forecast API supplies 3-hour intervals; choose the reading closest
    // to 12:00 in Bogotá for each of the next three calendar days.
    const dayFormat = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit"
    });
    const hourFormat = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota", hour: "numeric", hourCycle: "h23"
    });
    const labelFormat = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota", weekday: "long", month: "short", day: "numeric"
    });

    const today = dayFormat.format(new Date());
    const days = new Map();

    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const key = dayFormat.format(date);
      if (key <= today) return;
      const distanceFromNoon = Math.abs(Number(hourFormat.format(date)) - 12);
      if (!days.has(key) || distanceFromNoon < days.get(key).distance) {
        days.set(key, { date, temp: item.main.temp, distance: distanceFromNoon });
      }
    });

    forecastList.replaceChildren();
    [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 3)
      .forEach(([, day]) => {
        const li = document.createElement("li");
        li.textContent = `${labelFormat.format(day.date)}: ${Math.round(day.temp)}°C`;
        forecastList.appendChild(li);
      });

    if (!forecastList.children.length) {
      forecastList.textContent = "Forecast not available.";
    }
  } catch (error) {
    console.error("Weather error:", error);
    currentWeather.textContent = "Live weather is temporarily unavailable.";
    forecastList.innerHTML = "<li>Please try again later.</li>";
  }
}

async function loadSpotlights() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) throw new Error("Could not load members data.");
    const data = await response.json();

    const eligible = data.members.filter(member => member.membership === 2 || member.membership === 3);

    // Fisher–Yates shuffle: a new random selection on every page load.
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    spotlights.replaceChildren();

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
      phoneLink.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
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
      membershipLabel.className = `membership-level ${isGold ? "gold" : "silver"}`;
      membershipLabel.textContent = isGold ? "Gold Member" : "Silver Member";
      membership.appendChild(membershipLabel);

      card.append(heading, image, address, phone, website, membership);
      spotlights.appendChild(card);
    });

    if (!eligible.length) spotlights.textContent = "No eligible member spotlights found.";
  } catch (error) {
    console.error("Spotlights error:", error);
    spotlights.textContent = "Member spotlights could not be loaded.";
  }
}

loadWeather();
loadSpotlights();