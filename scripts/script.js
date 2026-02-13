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
  const response = await fetch("/api/cards"); 
  const data = await response.json();
  return data; 
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

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;

  seconds++;
  document.getElementById("timer").textContent = formatTimeInMinSec(seconds);

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

function handleCardClick(event) {
  startTimer();
  const card = event.currentTarget;

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

      setTimeout(() => {
        card1.style.visibility = "hidden";
        card2.style.visibility = "hidden";

        matchedCards.push(card1, card2);
        flippedCards = [];

        if (matchedPairs === totalPairs) {
          gameOver = true;
          clearInterval(timerInterval);

          // showModal(
          //   "🚀 Mission Complete!",
          //   `You matched all pairs in ${seconds} seconds with ${revealCount} reveals!`,
          // );
          checkWinConditionAndStopTimer();
        }
      }, 500);
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
  grid.innerHTML = "";
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

async function resetGame() {
  flippedCards = [];
  matchedCards = [];
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

  const requestedPairs = levelConfig[currentLevel] || cardDataFromAPI.length;
  const availablePairs = Math.min(requestedPairs, cardDataFromAPI.length);

  totalPairs = availablePairs;

  const selectedCards = cardDataFromAPI.slice(0, availablePairs);
  cards = shuffleCards(createPairs(selectedCards));

  renderCards();
}

async function initGame() {
  frontImagePath = await getGameConfig();
  const cardDataFromAPI = await getCards();
  const requestedPairs = levelConfig[currentLevel] || cardDataFromAPI.length;
  const availablePairs = Math.min(requestedPairs, cardDataFromAPI.length);

  totalPairs = availablePairs;
  matchedPairs = 0;

  const selectedCards = cardDataFromAPI.slice(0, availablePairs);
  cards = shuffleCards(createPairs(selectedCards));

  updateGridByLevel();
  renderCards();
}

document.getElementById("level").addEventListener("change", (e) => {
  currentLevel = e.target.value;
  resetGame();
});

document
  .getElementById("save-score-form")
  .addEventListener("submit", handleSaveScore);
document
  .getElementById("play-again-btn")
  .addEventListener("click", handlePlayAgain);
document.getElementById("reset-btn").addEventListener("click", resetGame);

initGame();


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

async function loadScores() {
  try {
    const response = await fetch("/scores");
    if (!response.ok) throw new Error("Failed to load scores");
    const scores = await response.json();
    return scores;
  } catch (error) {
    console.error("Error loading scores:", error);
    return [];
  }
}

async function saveScore(playerName, time, reveals) {
  try {
    const response = await fetch("/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playerName,
        time: time,
        reveals: reveals,
      }),
    });

    if (!response.ok) throw new Error("Failed to save score");
    const topScores = await response.json();
    return topScores;
  } catch (error) {
    console.error("Error saving score:", error);
    return [];
  }
}

async function displayScoreboard(elementId = "results-scoreboard-list") {
  const scores = await loadScores();
  const scoreboardList = document.getElementById(elementId);

  if (!scoreboardList) return;

  // Clear existing content
  scoreboardList.innerHTML = "";

  if (scores.length === 0) {
    const emptyMessage = createElement("div", "empty-scoreboard");
    emptyMessage.textContent = "No scores yet. Be the first!";
    scoreboardList.appendChild(emptyMessage);
    return;
  }

  scores.forEach((score, index) => {
    const scoreItem = createElement("div", "score-item");

    const scoreName = createElement("div", "score-name");
    scoreName.textContent = `${index + 1}. ${score.name}`;

    const scoreTime = createElement("div", "score-time");
    scoreTime.textContent = `Time: ${formatTimeInMinSec(score.time)}`;

    const scoreReveals = createElement("div", "score-reveals");
    scoreReveals.textContent = `Reveals: ${score.reveals}`;

    scoreItem.append(scoreName, scoreTime, scoreReveals);
    scoreboardList.appendChild(scoreItem);
  });
}

async function showResultsPage() {
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById("results-page").classList.remove("hidden");

  document.getElementById("final-time").textContent =
    formatTimeInMinSec(seconds);
  document.getElementById("final-reveals").textContent = revealCount;

  await displayScoreboard();

  // Focus on name input
  document.getElementById("player-name-input").focus();
}

function handleSaveScore(event) {
  event.preventDefault();

  const nameInput = document.getElementById("player-name-input");
  const playerName = nameInput.value.trim();

  if (playerName) {
    saveScore(playerName, seconds, revealCount).then(() => {
      displayScoreboard();

      // Disable form after saving
      nameInput.disabled = true;
      event.target.querySelector("button").disabled = true;
      event.target.querySelector("button").textContent = "Saved!";
    });
  }
}

function handlePlayAgain() {
  document.getElementById("results-page").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");

  // Reset form
  const form = document.getElementById("save-score-form");
  form.reset();
  const nameInput = document.getElementById("player-name-input");
  nameInput.disabled = false;
  const saveButton = form.querySelector("button");
  saveButton.disabled = false;
  saveButton.textContent = "Save Score";

  resetGame();
}

function checkWinConditionAndStopTimer() {
  if (matchedPairs === totalPairs) {
    clearInterval(timerInterval);

    setTimeout(async () => {
      await showResultsPage();
    }, 500);
  }
}