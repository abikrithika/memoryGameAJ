let cards = [];
let flippedCards = [];
let revealCount = 0;
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
  const response = await fetch("/api/cards");
  return response.json();
}

async function getGameConfig() {
  try {
    const response = await fetch("/api/config/card_front_image");
    const data = await response.json();
    return data.value || "cardFront.jpg";
  } catch (error) {
    console.error("Config fetch error:", error);
    return "cardFront.jpg";
  }
}

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

  if (
    gameOver ||
    card.classList.contains("flipped") ||
    flippedCards.length === 2
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
      flippedCards = [];

      if (matchedPairs === totalPairs) {
        gameOver = true;
        clearInterval(timerInterval);
        showModal(
          "🚀 Mission Complete!",
          `You matched all pairs in ${seconds} seconds with ${revealCount} reveals!`,
        );
      }
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
    createCardFace("card-front", `/images/${frontImagePath}`, "Card front"),
    createCardFace("card-back", `/images/${card.image}`, card.name),
  );

  cardElement.appendChild(cardInner);
  return cardElement;
}

function renderCards() {
  const grid = document.querySelector(".cards-list");
  cards.forEach((card) => {
    grid.appendChild(createCardElement(card));
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

function updateGridByLevel() {
  const grid = document.querySelector(".cards-list");

  if (currentLevel === "hard") {
    grid.style.gridTemplateColumns = "repeat(6, 75px)";
  } else {
    grid.style.gridTemplateColumns = "repeat(4, 75px)";
  }
}

async function resetGame() {
  flippedCards = [];
  revealCount = 0;
  seconds = 0;
  timerStarted = false;
  matchedPairs = 0;
  gameOver = false;

  clearInterval(timerInterval);

  document.getElementById("reveal-count").textContent = "0";
  document.getElementById("timer").textContent = "0:00";

  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";
  updateGridByLevel();

  const cardDataFromAPI = await getCards();

  const requestedPairs = levelConfig[currentLevel];
  const availablePairs = Math.min(requestedPairs, cardDataFromAPI.length);

  totalPairs = availablePairs;

  const selectedCards = cardDataFromAPI.slice(0, availablePairs);
  cards = shuffleCards(createPairs(selectedCards));

  renderCards();
}

async function initGame() {
  frontImagePath = await getGameConfig();

  const cardDataFromAPI = await getCards();

  const requestedPairs = levelConfig[currentLevel];
  const availablePairs = Math.min(requestedPairs, cardDataFromAPI.length);

  totalPairs = availablePairs;
  matchedPairs = 0;

  const selectedCards = cardDataFromAPI.slice(0, availablePairs);
  cards = shuffleCards(createPairs(selectedCards));

  updateGridByLevel();
  renderCards();
}

initGame();

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
