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

function createPairs(cardData) {
  return [...cardData, ...cardData];
}

function incrementRevealCount() {
  revealCount++;
  document.getElementById("reveal-count").textContent = revealCount;
}

function handleCardClick(event) {
  startTimer();
  const card = event.currentTarget;

  if (flippedCards.length === 2) {
    return;
  }

  flippedCards.push(card);
  card.classList.add("flipped");

  incrementRevealCount();
  const [card1, card2] = flippedCards;

  if (flippedCards.length === 2) {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, 1000);
  }
}

function createTagClassElement(tagName, className) {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
}

function createImageClassElement(src, alt, className) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.className = className;
  return image;
}

function createCardElement(card) {
  const cardElement = createTagClassElement("li", "card");
  cardElement.dataset.cardId = card.id;

  const cardInner = createTagClassElement("div", "card-inner");

  const cardFront = createTagClassElement("div", "card-front");
  const frontImage = createImageClassElement(
    "../images/cardFront.jpg",
    "Card front",
    "card-image",
  );
  cardFront.appendChild(frontImage);

  const cardBack = createTagClassElement("div", "card-back");
  const image = createImageClassElement(
    `../images/${card.image}`,
    card.name,
    "card-image",
  );

  cardBack.appendChild(image);
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardElement.appendChild(cardInner);

  cardElement.addEventListener("click", handleCardClick);

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
