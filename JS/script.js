// Select all flip cards
const cards = document.querySelectorAll(".flip-card");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    // Toggle the 'flipped' class
    card.classList.toggle("flipped");
  });
});


// Shuffle cards on page load
cards.forEach((card) => {
  const randomOrder = Math.floor(Math.random() * cards.length);
  card.style.order = randomOrder;
});
