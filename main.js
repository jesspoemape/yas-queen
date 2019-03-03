const fetch = require('node-fetch');

function doFetch(url) {
  return fetch(url)
   .then((response) => response.json())
   .then((dataAsJson) => dataAsJson);
}

 function getDeck() {
   const url = 'https://deckofcardsapi.com/api/deck/new/shuffle';
   return doFetch(url);
 }

 function drawCards(deckId, numberOfCards) {
   const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numberOfCards}`;
   return doFetch(url);
 }

 function sortResults(drawnCards) {
   const numericCardValues = {
     'ACE': 1,
     '2': 2,
     '3': 3,
     '4': 4, 
     '5': 5,
     '6': 6, 
     '7': 7,
     '8': 8,
     '9': 9,
     '10': 10,
     'JACK': 11,
     'QUEEN': 12,
     'KING': 13,
   }
   return drawnCards.sort((a, b) => {
    return numericCardValues[a] - numericCardValues[b];
   });
 }


async function deckOfCards() {
//  get a deck of deck of cards 
//  draw two cards per second
//  store card type drawn by suit
//  stop when queen in all suits are drawn 
//  return sorted arrays of cards drawn by suit
  const drawnCards = {
    HEARTS: [],
    SPADES: [],
    DIAMONDS: [],
    CLUBS: [],
  };
  const queenWatch = {
    HEARTS: false,
    SPADES: false,
    DIAMONDS: false,
    CLUBS: false,
  };
  const deck = await getDeck();

  (async function loop() {
    if (!queenWatch.CLUBS || !queenWatch.HEARTS || !queenWatch.DIAMONDS || !queenWatch.SPADES) {
      await drawCards(deck.deck_id, 2).then((cardsResult) => {
        setTimeout(loop, 1000);
        cardsResult.cards.forEach(card => {
          if (card.value === 'QUEEN') {
            queenWatch[card.suit] = true;
          }
          drawnCards[card.suit].push(card.value);
        });
      });
    } else {
      Object.entries(drawnCards).forEach(([suit, cardsDrawn]) => {
        drawnCards[suit] = sortResults(cardsDrawn);
      });
      console.log(drawnCards);
    }
  })()
}

deckOfCards();