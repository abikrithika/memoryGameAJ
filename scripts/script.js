// Define data
const cardData = [
  { id: 1, name: "Cat", emoji: "🐱" },
  { id: 2, name: "Dog", emoji: "🐶" },
  { id: 3, name: "Fox", emoji: "🦊" },
  { id: 4, name: "Lion", emoji: "🦁" },
  { id: 5, name: "Panda", emoji: "🐼" },
  { id: 6, name: "Koala", emoji: "🐨" },
];

// Initialize state
let cards = [];
let flippedCards = [];
let revealCount = 0;
let matchedPairs = 0;
const TOTAL_PAIRS = cardData.length;
let seconds = 0;
let timerStarted = false;
let timerInterval = null;

// Create a pair for each cardData
function createPairs(cardData) {
  return [...cardData, ...cardData];
}

// Check win with timer stop
function checkWinCondition() {
  if (matchedPairs === TOTAL_PAIRS) {
    // Stop the timer
    clearInterval(timerInterval);

    // Show win message
    setTimeout(() => {
      const message = `🎉 You won!\nTime: ${formatTime(seconds)}\nReveals: ${revealCount}`;
      alert(message);
    }, 500);
  }
}

// Check if two cards match
function checkForMatch() {
  const [card1, card2] = flippedCards;
  const id1 = card1.dataset.cardId;
  const id2 = card2.dataset.cardId;

  if (id1 === id2) {
    // Wait for flip animation to complete

    setTimeout(() => {
      card1.classList.add("matched");
      card2.classList.add("matched");
      flippedCards = [];
      matchedPairs++;

      // Check if game is won
      checkWinCondition();
    }, 600);
  } else {
    // Flip back after 1.5 seconds
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, 1500);
  }
}

function incrementRevealCount() {
  revealCount++;
  document.getElementById("reveal-count").textContent = revealCount;
}

function handleCardClick(event) {
  // Start timing when first click
  startTimer();

  const card = event.currentTarget;

  // Prevent clicking if 2 cards already flipped
  if (flippedCards.length === 2) {
    return;
  }

  // Add to flipped cards array
  flippedCards.push(card);
  card.classList.add("flipped");

  // Click is a reveal
  incrementRevealCount();

  // Check for match when 2 cards are flipped
  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

// Create a card to put in the HTML container
function createCardElement(card) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.dataset.cardId = card.id;

  const cardInner = document.createElement("div");
  cardInner.className = "card-inner";

  const cardFront = document.createElement("div");
  cardFront.className = "card-front";
  const pattern = document.createElement("div");
  pattern.className = "pattern";
  pattern.textContent = "♦ ♠ ♣ ♥";
  cardFront.appendChild(pattern);

  const cardBack = document.createElement("div");
  cardBack.className = "card-back";
  const emoji = document.createElement("div");
  emoji.className = "emoji";
  emoji.textContent = card.emoji;
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = card.name;
  cardBack.appendChild(emoji);
  cardBack.appendChild(name);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardElement.appendChild(cardInner);

  cardElement.addEventListener("click", handleCardClick);

  return cardElement;
}

// Display the cards in the HTML cards-grid container
function renderCards() {
  const grid = document.querySelector(".cards-grid");
  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    grid.appendChild(cardElement);
  });
}

// Shuffle the cards
function shuffle(array) {
  const shuffled = [...array]; // Create copy

  // Start from the end and work backwards
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at positions i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Timer with Start Guard
function startTimer() {
  // Prevent starting multiple times
  if (timerStarted) return;
  timerStarted = true;

  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById("timer").textContent = formatTime(seconds);
  }, 1000);

  // Trigger first increment immediately to avoid 1-second delay
  seconds++;
  document.getElementById("timer").textContent = formatTime(seconds);
}

function resetGame() {
  // Reset state
  flippedCards = [];
  matchedPairs = 0;
  revealCount = 0;
  seconds = 0;
  timerStarted = false;

  // Stop timer
  clearInterval(timerInterval);

  // Reset display
  document.getElementById("reveal-count").textContent = "0";
  document.getElementById("timer").textContent = "0:00";

  // Clear grid
  const grid = document.querySelector(".cards-grid");
  grid.innerHTML = "";

  // Create new shuffled cards
  cards = shuffle(createPairs(cardData));

  // Re-render
  renderCards();
}

// Initialize game
function initGame() {
  // Create pairs
  const pairedCards = createPairs(cardData);

  // Shuffle
  cards = shuffle(pairedCards);

  // Render
  renderCards();
}

// Start game on page load
initGame();

// Add reset button listener
document.getElementById("reset-btn").addEventListener("click", resetGame);
