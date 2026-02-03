const cards = document.querySelectorAll(".flip-card");
const modal = document.getElementById("gameModal");
const endMessageEl = document.getElementById("endMessage");
const finalRevealsEl = document.getElementById("finalReveals");
const finalAttemptsEl = document.getElementById("finalAttempts");
const restartBtn = document.getElementById("restartBtn");
let timer = null;
let seconds = 0;
let timerStarted = false;

const gameTimeEl = document.getElementById("gameTime");

let openCards = [];
let matchedCards = 0;
let totalCards = cards.length;
let reveals = 0;
let attempts = 0;

cards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!timerStarted) {
      timerStarted = true;
      timer = setInterval(() => {
        seconds++;
        gameTimeEl.textContent = seconds;
      }, 1000);
    }

    if (card.classList.contains("flipped")) {
      card.classList.remove("flipped");
      openCards = openCards.filter((c) => c !== card);
      return;
    }

    if (openCards.length === 2) {
      openCards.forEach((c) => c.classList.remove("flipped"));
      openCards = [];
    }

    card.classList.add("flipped");
    openCards.push(card);

    reveals++;
    // console.log("Reveals:", reveals);

    if (openCards.length === 2) {
      attempts++;
      // console.log("Attempts:", attempts);

      const img1 = openCards[0].querySelector(".flip-card-back img").src;
      const img2 = openCards[1].querySelector(".flip-card-back img").src;

      if (img1 === img2) {
        matchedCards += 2;
        openCards = [];
      }

      checkEndOfGame();
    }
  });
});

cards.forEach((card) => {
  const randomOrder = Math.floor(Math.random() * cards.length);
  card.style.order = randomOrder;
});

function checkEndOfGame() {
  if (matchedCards === totalCards) {
    showEndGameModal();
  }
}

function showEndGameModal() {
  // Stop timer
  if (timer) clearInterval(timer);

  finalRevealsEl.textContent = reveals;
  finalAttemptsEl.textContent = attempts;
  gameTimeEl.textContent = seconds; // Display total time
  endMessageEl.textContent = getSpaceEndMessage();
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

restartBtn.addEventListener("click", () => {
  location.reload();
});
