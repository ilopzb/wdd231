
const url = "data/members.json";

const cards = document.querySelector("#members");

async function getMemberData() {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    console.table(data.members);

    displayMembers(data.members);
  } catch (error) {
    console.error("Error loading members:", error);
    cards.textContent = "Unable to load business members.";
  }
}

function displayMembers(members) {
  cards.innerHTML = "";

  members.forEach((member) => {
    const card = document.createElement("section");

    const name = document.createElement("h2");
    name.textContent = member.name;

    const address = document.createElement("p");
    address.textContent = member.address;

    const phone = document.createElement("p");
    phone.textContent = member.phone;

    const website = document.createElement("a");
    website.href = member.website;
    website.textContent = "Visit Website";
    website.target = "_blank";
    website.rel = "noopener noreferrer";

    const membership = document.createElement("p");

    if (member.membership === 3) {
      membership.textContent = "Gold Member";
    } else if (member.membership === 2) {
      membership.textContent = "Silver Member";
    } else {
      membership.textContent = "Member";
    }

    const image = document.createElement("img");
    image.src = `images/${member.image}`;
    image.alt = `${member.name} business image`;
    image.loading = "lazy";
    image.width = 300;
    image.height = 180;

    card.appendChild(name);
    card.appendChild(image);
    card.appendChild(address);
    card.appendChild(phone);
    card.appendChild(membership);
    card.appendChild(website);

    cards.appendChild(card);
  });
}

getMemberData();


const gridButton = document.querySelector("#grid");
const listButton = document.querySelector("#list");

gridButton.addEventListener("click", () => {
  cards.classList.add("grid");
  cards.classList.remove("list");

  gridButton.setAttribute("aria-pressed", "true");
  listButton.setAttribute("aria-pressed", "false");
});

listButton.addEventListener("click", () => {
  cards.classList.add("list");
  cards.classList.remove("grid");

  listButton.setAttribute("aria-pressed", "true");
  gridButton.setAttribute("aria-pressed", "false");
});
