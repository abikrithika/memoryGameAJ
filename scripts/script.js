let cards = [];
let flippedCards = [];
let matchedCards = []; // Track matched cards
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let frontImagePath = "cardFront.jpg";
let totalPairs = 0;

// ----------------------------
// FETCH CARDS & CONFIG
// ----------------------------
async function getCards() {
  const response = await fetch("/api/cards"); // API endpoint
  const data = await response.json();
  return data; // returns array of cards
}

async function getGameConfig() {
  try {
    const response = await fetch("/api/config/card_front_image");
    const data = await response.json();
    return data.value || "cardFront.jpg"; // fallback
  } catch (error) {
    console.error("Config fetch error:", error);
    return "cardFront.jpg"; // fallback
  }
}

function createPairs(cardData) {
  return [...cardData, ...cardData];
}

// ----------------------------
// TIMER
// ----------------------------
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

  // Trigger first increment immediately
  seconds++;
  document.getElementById("timer").textContent = formatTimeInMinSec(seconds);
}

// ----------------------------
// HANDLE CARD CLICK & MATCH
// ----------------------------
function handleCardClick(event) {
  startTimer();
  const card = event.currentTarget;

  if (
    flippedCards.length === 2 || // Two cards already flipped
    flippedCards.includes(card) || // Already flipped
    matchedCards.includes(card) // Already matched
  )
    return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    const [card1, card2] = flippedCards;

    if (card1.dataset.cardId === card2.dataset.cardId) {
      // Cards match → disappear
      setTimeout(() => {
        card1.style.visibility = "hidden";
        card2.style.visibility = "hidden";

        matchedCards.push(card1, card2); // mark as matched
        flippedCards = [];
      }, 500);
    } else {
      // Not a match → flip back
      setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        flippedCards = [];
      }, 1000);
    }
  }
}

// ----------------------------
// CARD CREATION & RENDERING
// ----------------------------
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
    createCardFace("card-front", `/images/${frontImagePath}`, "Card front"),
    createCardFace("card-back", `/images/${card.image}`, card.name),
  );

  cardElement.appendChild(cardInner);
  return cardElement;
}

function renderCards() {
  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";
  cards.forEach((card) => {
    grid.appendChild(createCardElement(card));
  });
}

// ----------------------------
// SHUFFLE CARDS
// ----------------------------
function shuffleCards(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ----------------------------
// RESET GAME
// ----------------------------
async function resetGame() {
  flippedCards = [];
  matchedCards = [];
  seconds = 0;
  timerStarted = false;

  clearInterval(timerInterval);

  document.getElementById("timer").textContent = "0:00";

  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";

  // Fetch fresh cards from API
  const cardDataFromAPI = await getCards();
  totalPairs = cardDataFromAPI.length;

  // Shuffle and create pairs
  cards = shuffleCards(createPairs(cardDataFromAPI));

  renderCards();
}

// ----------------------------
// INITIALIZE GAME
// ----------------------------
async function initGame() {
  // Fetch front image from config API
  frontImagePath = await getGameConfig();

  // Fetch cards from API
  const cardDataFromAPI = await getCards();

  // Create pairs and shuffle
  const pairedCards = createPairs(cardDataFromAPI);
  cards = shuffleCards(pairedCards);

  // Render cards
  renderCards();
}

initGame();
document.getElementById("reset-btn").addEventListener("click", resetGame);
