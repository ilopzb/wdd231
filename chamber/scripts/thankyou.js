// Read GET form values from the URL and safely display them as plain text.
const params = new URLSearchParams(window.location.search);
const details = document.querySelector("#submission-details");
const section = document.querySelector("#submission-section");
const missing = document.querySelector("#missing-application");

const requiredFields = [
  ["First Name", "first-name"],
  ["Last Name", "last-name"],
  ["Email Address", "email"],
  ["Mobile Phone", "phone"],
  ["Business / Organization", "organization"]
];

if (!params.has("first-name")) {
  section.hidden = true;
  missing.hidden = false;
} else {
  for (const [label, name] of requiredFields) {
    const row = document.createElement("div");
    row.className = "submission-row";

    const term = document.createElement("dt");
    term.textContent = label;

    const value = document.createElement("dd");
    value.textContent = params.get(name) || "Not provided";

    row.append(term, value);
    details.appendChild(row);
  }

  const row = document.createElement("div");
  row.className = "submission-row";

  const term = document.createElement("dt");
  term.textContent = "Form Loaded";

  const value = document.createElement("dd");
  const raw = params.get("timestamp");
  const date = raw ? new Date(raw) : null;
  const validDate = date && !Number.isNaN(date.getTime());

  value.textContent = validDate
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Bogota"
      }).format(date) + " (Bogotá time)"
    : "Not provided";

  row.append(term, value);
  details.appendChild(row);
}
