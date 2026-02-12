let cards = [];
let flippedCards = [];
let revealCount = 0;
let matchedCards = [];
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let frontImagePath = "cardFront.jpg";
let totalPairs = 0;
let currentLevel = "easy";
let matchedPairs = 0;
let gameOver = false;

const levelConfig = {
  easy: 6,
  medium: 8,
  hard: 12,
};

const maxTimeByLevel = {
  easy: 100,
  medium: 90,
  hard: 60,
};

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
function incrementRevealCount() {
  revealCount++;
  document.getElementById("reveal-count").textContent = revealCount;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;

  // Trigger first increment immediately (Week2 feature)
  seconds++;
  document.getElementById("timer").textContent = formatTimeInMinSec(seconds);

  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById("timer").textContent = formatTimeInMinSec(seconds);

    // Week3 feature: check max time per level
    if (seconds >= maxTimeByLevel[currentLevel]) {
      clearInterval(timerInterval);
      showModal(
        "⏰ Mission Failed",
        "Time ran out! The galaxy needs you again.",
      );
      resetGame();
    }
  }, 1000);
}

function formatTimeInMinSec(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updateGridByLevel() {
  const grid = document.querySelector(".cards-list");

  if (currentLevel === "hard") {
    grid.style.gridTemplateColumns = "repeat(6, 75px)";
  } else {
    grid.style.gridTemplateColumns = "repeat(4, 75px)";
  }
}

// ----------------------------
// TASK 1: HANDLE CARD CLICK & MATCH (Disappear)
// ----------------------------
function handleCardClick(event) {
  startTimer();
  const card = event.currentTarget;

  // Ignore clicks if game over, 2 cards are flipped, card already flipped, or already matched
  if (
    gameOver ||
    flippedCards.length === 2 ||
    flippedCards.includes(card) ||
    matchedCards.includes(card)
  ) {
    return;
  }

  card.classList.add("flipped");
  flippedCards.push(card);
  incrementRevealCount();

  if (flippedCards.length === 2) {
    const [card1, card2] = flippedCards;

    if (card1.dataset.cardId === card2.dataset.cardId) {
      matchedPairs++;

      // Make matched cards disappear (Week2 feature)
      setTimeout(() => {
        card1.style.visibility = "hidden";
        card2.style.visibility = "hidden";

        matchedCards.push(card1, card2);
        flippedCards = [];

        // Check if all pairs matched
        if (matchedPairs === totalPairs) {
          gameOver = true;
          clearInterval(timerInterval);

          // Week3 modal for game completion
          showModal(
            "🚀 Mission Complete!",
            `You matched all pairs in ${seconds} seconds with ${revealCount} reveals!`,
          );
        }
      }, 500);
    } else {
      // Not a match → flip back after delay
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
// GAME RESET
// ----------------------------
async function resetGame() {
  // Clear game state
  flippedCards = [];
  matchedCards = []; // Week2: track matched cards
  revealCount = 0;
  seconds = 0;
  timerStarted = false;
  matchedPairs = 0;
  gameOver = false;

  clearInterval(timerInterval);

  // Reset UI
  document.getElementById("reveal-count").textContent = "0";
  document.getElementById("timer").textContent = "0:00";

  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";

  // Update grid layout based on current level (Week3 feature)
  updateGridByLevel();

  // Fetch cards from API
  const cardDataFromAPI = await getCards();

  // Determine total pairs based on level (Week3) or fallback to all cards (Week2)
  const requestedPairs = levelConfig[currentLevel] || cardDataFromAPI.length;
  const availablePairs = Math.min(requestedPairs, cardDataFromAPI.length);

  totalPairs = availablePairs;

  // Select cards and shuffle
  const selectedCards = cardDataFromAPI.slice(0, availablePairs);
  cards = shuffleCards(createPairs(selectedCards));

  // Render cards
  renderCards();
}

// ----------------------------
// INITIALIZE GAME
// ----------------------------
async function initGame() {
  // Fetch front image from config API (Week3)
  frontImagePath = await getGameConfig();

  // Fetch cards from API
  const cardDataFromAPI = await getCards();

  // Determine total pairs based on current level (Week3)
  const requestedPairs = levelConfig[currentLevel] || cardDataFromAPI.length;
  const availablePairs = Math.min(requestedPairs, cardDataFromAPI.length);

  totalPairs = availablePairs;
  matchedPairs = 0;

  // Select cards and create pairs
  const selectedCards = cardDataFromAPI.slice(0, availablePairs);
  cards = shuffleCards(createPairs(selectedCards));

  // Update grid layout based on level (Week3)
  updateGridByLevel();

  // Render cards (Week2 + Week3)
  renderCards();
}

// Initialize game
initGame();

// Event listeners
document.getElementById("reset-btn").addEventListener("click", resetGame);

document.getElementById("level").addEventListener("change", (e) => {
  currentLevel = e.target.value;
  resetGame();
});

function showModal(title, message) {
  const modal = document.getElementById("game-modal");
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-message").textContent = message;
  modal.classList.remove("hidden");
}

function hideModal() {
  document.getElementById("game-modal").classList.add("hidden");
}

document.getElementById("modal-btn").addEventListener("click", () => {
  hideModal();
  resetGame();
});
