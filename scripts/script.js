const card = document.querySelector(".card");

card.addEventListener("click", function () {
  card.classList.toggle("flipped");
});

const cardData = [
  { id: 1, name: "Cat", emoji: "🐱" },

  { id: 2, name: "Dog", emoji: "🐶" },

  { id: 3, name: "Fox", emoji: "🦊" },

  { id: 4, name: "Lion", emoji: "🦁" },

  { id: 5, name: "Panda", emoji: "🐼" },

  { id: 6, name: "Koala", emoji: "🐨" },
];

// Get first card

const firstCard = cardData[0];

console.log(firstCard.name); // "Cat"

console.log(firstCard.emoji); // "🐱"

// Loop through all cards

cardData.forEach((card) => {
  console.log(`${card.emoji} ${card.name}`);
});

function renderCards(cards) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = ""; // Clear existing cards

  cards.forEach((card, index) => {
    // Create card element
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.dataset.cardId = card.id;

    // Set inner HTML
    cardElement.innerHTML = `
            
                
                    ♦ ♠ ♣ ♥
                
                
                    ${card.emoji}
                    ${card.name}
                
            
        `;

    // Add click handler
    cardElement.addEventListener("click", handleCardClick);

    // Add to grid
    grid.appendChild(cardElement);
  });
}

function createPairs(cards) {

    return [...cards, ...cards];

}