let cards = [];
let flippedCards = [];
let matchedCards = [];
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let score = 0;
let frontImagePath = "cardFront.jpg";
let totalPairs = 0;
let revealCount = 0;

// ===== API FUNCTIONS =====
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
    document.getElementById("timer").textContent = formatTime(seconds);
  }, 1000);
}

// ===== SCORE DISPLAY =====
function updateScoreDisplay(isMatch) {
  const scoreEl = document.getElementById("reveal-count");
  const changeEl = document.getElementById("score-change");

  if (isMatch) {
    score += 10;
    changeEl.textContent = "+10";
    changeEl.style.color = "green";
  } else {
    score -= 2;
    changeEl.textContent = "-2";
    changeEl.style.color = "red";
  }

  scoreEl.textContent = score;
  changeEl.classList.add("show");
  setTimeout(() => changeEl.classList.remove("show"), 800);
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
        if (matchedCards.length === cards.length)
          setTimeout(
            () =>
              alert(
                `🎉 You won in ${score} points and ${formatTime(seconds)}!`,
              ),
            500,
          );
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

// ===== RENDER CARDS =====
async function renderCards() {
  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";

  // Shuffle and create pairs
  cards = shuffleCards(cards);

  cards.forEach((card, index) => {
    const li = createCardElement(card);

    // SNAKE ANIMATION: delay each card's entrance
    li.style.transitionDelay = `${index * 0.1}s`;
    setTimeout(() => li.classList.add("show"), 50);

    grid.appendChild(li);
  });

  // Preview all cards for 2s
  const allCards = document.querySelectorAll(".card");
  allCards.forEach((c) => c.classList.add("flipped"));
  setTimeout(
    () => allCards.forEach((c) => c.classList.remove("flipped")),
    2000,
  );
}

// ===== RESET GAME =====
function resetGame() {
  clearInterval(timerInterval);
  flippedCards = [];
  matchedCards = [];
  score = 0;
  seconds = 0;
  timerStarted = false;
  revealCount = 0;

  document.getElementById("timer").textContent = "0:00";
  document.getElementById("reveal-count").textContent = score;

  renderCards();
}

// ===== INIT GAME =====
async function initGame() {
  // Fetch front image from config API
  frontImagePath = await getGameConfig();

  // Fetch cards from API
  const cardDataFromAPI = await getCards();

  // Create pairs and shuffle
  cards = shuffleCards(createPairs(cardDataFromAPI));

  // Render cards
  renderCards();
}

initGame();

document.getElementById("reset-btn").addEventListener("click", resetGame);
