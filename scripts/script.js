// ===== GAME VARIABLES =====
let cards = [];
let flippedCards = [];
let matchedCards = [];
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let score = 0;
let frontImagePath = "cardFront.jpg";

// ===== SCREEN ELEMENTS =====
const frontPage = document.getElementById("front-page");
const howPage = document.getElementById("how-page");
const gamePage = document.getElementById("game-page");

const startBtn = document.getElementById("start-btn");
const howBtn = document.getElementById("how-btn");
const backBtn = document.getElementById("back-btn");
const resetBtn = document.getElementById("reset-btn");

const revealCountEl = document.getElementById("reveal-count");
const timerEl = document.getElementById("timer");
const scoreChangeEl = document.getElementById("score-change");

// ===== BUTTON EVENTS =====
startBtn.addEventListener("click", startGameScreen);
howBtn.addEventListener("click", showHowPage);
backBtn?.addEventListener("click", goBackToFront);
resetBtn?.addEventListener("click", resetGame);

// ===== SCREEN FUNCTIONS =====
function startGameScreen() {
  frontPage.classList.remove("active");
  howPage.classList.remove("active");
  gamePage.classList.add("active");
  renderCardsWithPreview();
}

function showHowPage() {
  frontPage.classList.remove("active");

  howPage.classList.add("active");
}

function goBackToFront() {
  howPage.classList.remove("active");
  frontPage.classList.add("active");
}

// ===== API FUNCTIONS =====
async function getCards() {
  const response = await fetch("/api/cards");
  const data = await response.json();
  return data;
}

async function getGameConfig() {
  try {
    const res = await fetch("/api/config/card_front_image");
    const data = await res.json();
    return data.value || "cardFront.jpg";
  } catch {
    return "cardFront.jpg";
  }
}

// ===== UTILITIES =====
function createPairs(cardData) {
  return [...cardData, ...cardData];
}
function shuffleCards(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ===== TIMER =====
function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

// ===== SCORE DISPLAY =====
function updateScoreDisplay(isMatch) {
  if (isMatch) {
    score += 10;
    scoreChangeEl.textContent = "+10";
    scoreChangeEl.style.color = "green";
  } else {
    score -= 2;
    scoreChangeEl.textContent = "-2";
    scoreChangeEl.style.color = "red";
  }
  revealCountEl.textContent = score;
  scoreChangeEl.classList.add("show");
  setTimeout(() => scoreChangeEl.classList.remove("show"), 800);
}

// ===== CARD CLICK LOGIC =====
function handleCardClick(event) {
  const card = event.currentTarget;
  if (flippedCards.includes(card) || matchedCards.includes(card)) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (!timerStarted) startTimer();

  if (flippedCards.length === 2) {
    const [card1, card2] = flippedCards;
    if (card1.dataset.cardId === card2.dataset.cardId) {
      setTimeout(() => {
        card1.style.visibility = "hidden";
        card2.style.visibility = "hidden";
        matchedCards.push(card1, card2);
        flippedCards = [];
        updateScoreDisplay(true);
        if (matchedCards.length === cards.length) {
          setTimeout(
            () =>
              alert(
                `🎉 You won in ${score} points and ${formatTime(seconds)}!`,
              ),
            500,
          );
        }
      }, 500);
    } else {
      setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        flippedCards = [];
        updateScoreDisplay(false);
      }, 1000);
    }
  }
}

// ===== CREATE CARD ELEMENT =====
function createCardElement(card) {
  const li = document.createElement("li");
  li.className = "card";
  li.dataset.cardId = card.id;

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const front = document.createElement("div");
  front.className = "card-front";
  front.innerHTML = `<img src="/images/${frontImagePath}" alt="Card front">`;

  const back = document.createElement("div");
  back.className = "card-back";
  back.innerHTML = `<img src="/images/${card.image}" alt="${card.name}">`;

  inner.append(front, back);
  li.appendChild(inner);
  li.addEventListener("click", handleCardClick);

  return li;
}

// ===== RENDER CARDS =====
async function renderCards() {
  const data = await getCards();
  frontImagePath = await getGameConfig();

  cards = shuffleCards(createPairs(data));

  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";

  cards.forEach((card, index) => {
    const li = createCardElement(card);
    li.style.transitionDelay = `${index * 0.1}s`;
    setTimeout(() => li.classList.add("show"), 50);
    grid.appendChild(li);
  });
}

// ===== RENDER WITH PREVIEW =====
async function renderCardsWithPreview() {
  await renderCards();

  const allCards = document.querySelectorAll(".card");
  allCards.forEach((c) => c.classList.add("flipped"));

  setTimeout(() => {
    allCards.forEach((c) => c.classList.remove("flipped"));
  }, 2000);
}

// ===== RESET GAME =====
function resetGame() {
  clearInterval(timerInterval);
  flippedCards = [];
  matchedCards = [];
  score = 0;
  seconds = 0;
  timerStarted = false;

  revealCountEl.textContent = score;
  timerEl.textContent = "0:00";

  renderCardsWithPreview();
}

// ===== INITIALIZE GAME =====
initGame();
async function initGame() {
  frontImagePath = await getGameConfig();
  await renderCardsWithPreview();
}
