const fetch = require('node-fetch');

  // dictionary for card values (assuming ace is below 2)
  const numericCardValuesAceFirst = {
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
  };

  // dictionary for card values (assuming Ace is after King)
  const numericCardValuesAceLast = {
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
    'ACE': 14,
  };

/**
 * Use fetch API to make a network request
 * 
 * @param {string} url 
 */
const doFetch = (url) => {
  return fetch(url)
    .then((response) => response.json())
    .then((dataAsJson) => dataAsJson);
}

/**
 * Gets a new shuffled deck of cards
 */
const getDeck = () => {
  const url = 'https://deckofcardsapi.com/api/deck/new/shuffle';
  return doFetch(url);
}

/**
 * Draws any number of cards from a certain deck
 * 
 * @param {string} deckId 
 * @param {number} numberOfCards 
 */
const drawCards = (deckId, numberOfCards) => {
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numberOfCards}`;
  return doFetch(url);
}

/**
 * Sorts the drawn cards array by numeric card value with a choose your own adventure option
 * 
 * @param {Array} drawnCards 
 * @param {boolean?} aceFirst | Ace is after king or before 2? You decide.
 */
const sortResults = (drawnCards, aceFirst = true) => (
  drawnCards.sort((a, b) => (
    aceFirst ? numericCardValuesAceFirst[a] - numericCardValuesAceFirst[b] : numericCardValuesAceLast[a] - numericCardValuesAceLast[b]
  ))
)

/**
 * Checks if a card value is valid. 
 * I want to check for string and numbers because .includes does a strict equality check
 * 
 * @param {string | number} cardValue 
 */
const validateCardValue = (cardValue) => {
  const validCardValues = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'];
  return validCardValues.includes(String(cardValue).toUpperCase());
}

/**
 * Draws cards from a shuffled deck and watches for a certain card value to be drawn from all suits before returning sorted list of cards drawn
 * 
 * @param {string | number} cardValueToWatchFor | 'ACE', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'JACK', 'QUEEN', 'KING'
 * @param {number} numberOfCardsToDraw | how many cards to draw at a time
 * @param {number} intervalBetweenEachIteration | number of milliseconds between each network request
 * @param {boolean?} aceFirst | how to sort the cards at the end
 */
async function deckOfCards(cardValueToWatchFor, numberOfCardsToDraw, intervalBetweenEachIteration, aceFirst = true) {
  if (!validateCardValue(cardValueToWatchFor)) {
    console.log('Not a valid card value to watch for');
    return;
  }
  // keeps track of all the cards that have been drawn
  const drawnCards = {
    HEARTS: [],
    SPADES: [],
    DIAMONDS: [],
    CLUBS: [],
  };

  // keeps track of if the card value to watch for has been drawn for each suit
  const cardWatch = {
    HEARTS: false,
    SPADES: false,
    DIAMONDS: false,
    CLUBS: false,
  };

  // get new deck of cards
  const deck = await getDeck();

  (async function loop() {
    // check if all the card value to watch for have been drawn
    if (!cardWatch.CLUBS || !cardWatch.HEARTS || !cardWatch.DIAMONDS || !cardWatch.SPADES) {
      // draw cards
      await drawCards(deck.deck_id, numberOfCardsToDraw).then((cardsResult) => {
        // start a set timeout so the loop can called again after specified interval
        setTimeout(loop, intervalBetweenEachIteration);
        // loop through the cards
        cardsResult.cards.forEach((card) => {
          // mark the card value to watch for as found when found
          if (card.value === String(cardValueToWatchFor).toUpperCase()) {
            cardWatch[card.suit] = true;
          }
          // add card to list of drawn cards by suit
          drawnCards[card.suit].push(card.value);
        });
      });
    } else {
      // when all the cards to watch for have been drawn, sort the drawn cards
      Object.entries(drawnCards).forEach(([suit, cardsDrawn]) => {
        drawnCards[suit] = sortResults(cardsDrawn, aceFirst);
      });

      // sorted cards!!
      console.log(drawnCards);
    }
  })();
}


// deckOfCards('QUEEN', 2, 1000, false);
// deckOfCards('2', 2, 1000);
// deckOfCards('HELLO', 2, 1000);
// deckOfCards('jack', 2, 1000);
