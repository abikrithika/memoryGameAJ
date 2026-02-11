// ===== CARD DATA =====
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
let matchedCards = [];
let seconds = 0;
let timerStarted = false;
let timerInterval = null;
let score = 0;

// ===== UTILITIES =====
function shuffleCards(array) {
  const shuffled = [...array, ...array]; // create pairs
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

// ===== RENDER CARDS =====
function renderCards() {
  const grid = document.querySelector(".cards-list");
  grid.innerHTML = "";

  cards.forEach((card, index) => {
    const li = document.createElement("li");
    li.classList.add("card");
    li.dataset.cardId = card.id;

    li.innerHTML = `
      <div class="card-inner">
        <div class="card-front"><img src="/images/cardFront.jpg" class="card-image"></div>
        <div class="card-back"><img src="/images/${card.image}" class="card-image"></div>
      </div>
    `;

    li.addEventListener("click", handleCardClick);

    // SNAKE ANIMATION: delay each card's entrance
    li.style.transitionDelay = `${index * 0.1}s`;
    setTimeout(() => li.classList.add("show"), 50);

    grid.appendChild(li);
  });

  // Preview all cards for 3s
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
  document.getElementById("timer").textContent = "0:00";
  document.getElementById("reveal-count").textContent = score;

  cards = shuffleCards(cardData);
  renderCards();
}

// ===== INIT GAME =====
cards = shuffleCards(cardData);
renderCards();

document.getElementById("reset-btn").addEventListener("click", resetGame);
