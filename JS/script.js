const cards = document.querySelectorAll(".flip-card");

let openCards = [];

cards.forEach((card) => {
  card.addEventListener("click", () => {
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

    if (openCards.length === 2) {
      const img1 = openCards[0].querySelector(".flip-card-back img").src;
      const img2 = openCards[1].querySelector(".flip-card-back img").src;

      if (img1 === img2) {
        openCards = [];
      }
    }
  });
});

// Shuffle cards
cards.forEach((card) => {
  const randomOrder = Math.floor(Math.random() * cards.length);
  card.style.order = randomOrder;
});
