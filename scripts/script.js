let cards = [];
let flippedCards = [];
let revealCount = 0;
let matchedCards = [];
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let frontImagePath = "cardFront.jpg";
let totalPairs = 0;

const gridElement = document.querySelector(".cards-list");
const revealCountElement = document.getElementById("reveal-count");
const timerElement = document.getElementById("timer");

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
  revealCountElement.textContent = revealCount;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;

  timerInterval = setInterval(() => {
    seconds++;
    timerElement.textContent = formatTimeInMinSec(seconds);
  }, 1000);

  seconds++;
  timerElement.textContent = formatTimeInMinSec(seconds);
}

function formatTimeInMinSec(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function handleCardClick(event) {
  startTimer();
  const card = event.currentTarget;

  if (
    flippedCards.length === 2 ||
    flippedCards.includes(card) ||
    matchedCards.includes(card)
  )
    return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    incrementRevealCount();
    const [card1, card2] = flippedCards;

    if (card1.dataset.cardId === card2.dataset.cardId) {
      setTimeout(() => {
        card1.style.visibility = "hidden";
        card2.style.visibility = "hidden";

        matchedCards.push(card1, card2);
        flippedCards = [];

        if (matchedCards.length === cards.length) {
          clearInterval(timerInterval);
          alert(
            `🎉 Congratulations! You won in ${formatTimeInMinSec(seconds)} and ${revealCount} moves!`,
          );
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
  const grid = gridElement;
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

  clearInterval(timerInterval);

  revealCountElement.textContent = "0";
  timerElement.textContent = "0:00";

  const grid = gridElement;
  grid.innerHTML = "";

  const cardDataFromAPI = await getCards();
  totalPairs = cardDataFromAPI.length;

  cards = shuffleCards(createPairs(cardDataFromAPI));

  renderCards();
}

async function initGame() {
  frontImagePath = await getGameConfig();

  const cardDataFromAPI = await getCards();

  const pairedCards = createPairs(cardDataFromAPI);
  cards = shuffleCards(pairedCards);

  renderCards();
}

initGame();
document.getElementById("reset-btn").addEventListener("click", resetGame);
