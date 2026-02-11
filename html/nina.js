const cardData = [
  { id: 1, name: "Sun", image: "sun.jfif" },
  { id: 2, name: "Moon", image: "moon.jfif" },
  { id: 3, name: "Star", image: "star.webp" },
  { id: 4, name: "Comet", image: "comet.jfif" },
  { id: 5, name: "Rocket", image: "rocket.jfif" },
  { id: 6, name: "Planets", image: "planets.jpg" },
];

let cards = [];
let flippedCards = [];
let revealCount = 0;
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let frontImagePath = "cardFront.jpg";

function createPairs(cardData) {
  return [...cardData, ...cardData];
}

function incrementRevealCount() {
  revealCount++;
  document.getElementById("reveal-count").textContent = revealCount;
}
// MODIFIED: Keep matched cards open, otherwise flip back after 1s
function handleCardClick(event) {
  startTimer();
  const card = event.currentTarget;

  //MODIFIED: Prevent flipping more than 2 cards or re-flipping the same card
  if (flippedCards.length === 2 || card.classList.contains("flipped")) {
    return;
  }

  flippedCards.push(card);
  card.classList.add("flipped");

  incrementRevealCount();

  if (flippedCards.length === 2) {
    const [card1, card2] = flippedCards;
    const id1 = card1.dataset.cardId;
    const id2 = card2.dataset.cardId;

    //  MODIFIED: Keep matched cards open, otherwise flip back after 1s
    if (id1 === id2) {
      flippedCards = [];
    } else {
      setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        flippedCards = [];
      }, 1000);
    }
  }
}

function createElement(tag, className, attributes = {}) {
  const element = document.createElement(tag);
  element.className = className;
  Object.entries(attributes).forEach(([key, value]) => {
    element[key] = value;
  });
  return element;
}

function createCardFace(className, imageSrc, imageAlt) {
  const face = createElement("div", className);
  face.appendChild(
    createElement("img", "card-image", { src: imageSrc, alt: imageAlt }),
  );
  return face;
}

function createCardElement(card) {
  const cardElement = createElement("li", "card");
  cardElement.dataset.cardId = card.id;
  cardElement.addEventListener("click", handleCardClick);

  const cardInner = createElement("div", "card-inner");
  cardInner.append(
    createCardFace("card-front", `./images/${frontImagePath}`, "Card front"),
    createCardFace("card-back", `./images/${card.image}`, card.name),
  );

  cardElement.appendChild(cardInner);
  return cardElement;
}

function renderCards() {
  const grid = document.querySelector(".cards-list");
  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    grid.appendChild(cardElement);
  });
}

function shuffleCards(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function formatTimeInMinSec(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;

  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById("timer").textContent = formatTimeInMinSec(seconds);
  }, 1000);

  // Trigger first increment immediately to avoid 1-second delay
  seconds++;
  document.getElementById("timer").textContent = formatTimeInMinSec(seconds);
}

function resetGame() {
  flippedCards = [];
  revealCount = 0;
  seconds = 0;
  timerStarted = false;

  clearInterval(timerInterval);

  document.getElementById("reveal-count").textContent = "0";
  document.getElementById("timer").textContent = "0:00";

  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";

  cards = shuffleCards(createPairs(cardData));

  renderCards();
}

function initGame() {
  const pairedCards = createPairs(cardData);

  cards = shuffleCards(pairedCards);

  renderCards();
}

initGame();

document.getElementById("reset-btn").addEventListener("click", resetGame);
