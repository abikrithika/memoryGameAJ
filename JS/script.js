// ---------------- SELECT ELEMENTS ----------------
const cards = document.querySelectorAll(".flip-card");
const modal = document.getElementById("gameModal");
const endMessageEl = document.getElementById("endMessage");
const finalRevealsEl = document.getElementById("finalReveals");
const finalAttemptsEl = document.getElementById("finalAttempts");
const gameTimeEl = document.getElementById("gameTime");
const restartBtn = document.getElementById("restartBtn");

// ---------------- GAME VARIABLES ----------------
let openCards = [];
let matchedCards = 0;
let totalCards = cards.length;
let reveals = 0;
let attempts = 0;

// Timer variables
let timer = null;
let seconds = 0;
let timerStarted = false;

// ---------------- CARD CLICK LOGIC ----------------
cards.forEach((card) => {
  card.addEventListener("click", () => {
    // Start timer on first reveal
    if (!timerStarted) {
      timerStarted = true;
      timer = setInterval(() => {
        seconds++;
        gameTimeEl.textContent = seconds;
      }, 1000);
    }

    // Prevent clicking already flipped or currently open cards
    if (card.classList.contains("flipped") || openCards.includes(card)) return;

    // Flip the card
    card.classList.add("flipped");
    openCards.push(card);
    reveals++;

    // Check if 2 cards are flipped
    if (openCards.length === 2) {
      attempts++;

      const img1 = openCards[0].querySelector(".flip-card-back img").src;
      const img2 = openCards[1].querySelector(".flip-card-back img").src;

      if (img1 === img2) {
        // MATCH → Keep cards flipped
        matchedCards += 2;
        openCards = [];
        checkEndOfGame();
      } else {
        // NO MATCH → Flip back automatically after 1 second
        setTimeout(() => {
          openCards.forEach((c) => c.classList.remove("flipped"));
          openCards = [];
        }, 1000); // 1000ms = 1 second
      }
    }
  });
});

// ---------------- SHUFFLE CARDS ON LOAD ----------------
cards.forEach((card) => {
  const randomOrder = Math.floor(Math.random() * cards.length);
  card.style.order = randomOrder;
});

// ---------------- END OF GAME LOGIC ----------------
function checkEndOfGame() {
  if (matchedCards === totalCards) {
    showEndGameModal();
  }
}

function showEndGameModal() {
  // Stop timer
  if (timer) clearInterval(timer);

  // Display stats
  finalRevealsEl.textContent = reveals;
  finalAttemptsEl.textContent = attempts;
  gameTimeEl.textContent = seconds;

  // Space-themed message
  endMessageEl.textContent = getSpaceEndMessage();

  // Show modal
  modal.style.display = "flex";
}

function getSpaceEndMessage() {
  if (attempts <= totalCards / 2) {
    return "🌟 Perfect Mission! Stellar Memory!";
  } else if (attempts <= totalCards) {
    return "🚀 Mission Success! Orbit Achieved!";
  } else {
    return "🪐 Mission Complete! You Made It Home!";
  }
}

// ---------------- RESTART GAME ----------------
restartBtn.addEventListener("click", () => {
  location.reload(); // Reload page to reset game
});
