import "./style.css";
import { Card, cardsArray } from "./cards";
import { shuffleArray } from "./utils";

const grid: HTMLDivElement = document.querySelector("#grid")!;
const startButton: HTMLButtonElement = document.querySelector("#start")!;
const restartScreen: HTMLDivElement =
  document.querySelector(".restart-screen")!;

startButton.addEventListener("click", startGame);

document.querySelector("#restart")?.addEventListener("click", startGame);

// Game states
let hasFlippedCard = false;
let lockBoard = false;

// Cards
let cards: Card[];
let firstCard: HTMLDivElement | null;
let secondCard: HTMLDivElement | null;

// Increments with every correct quess, game end when equals 6
let correctGuesses = 0;

// Set start time when game start and compare with Date.now when game ends
let startTime: number;

function startGame() {
  startButton.style.display = "none";

  // Clear in case of previous game
  restartScreen.classList.remove("show");
  grid.innerHTML = "";

  grid.classList.add("show");

  cards = shuffleArray(cardsArray);
  cards.forEach((card) => {
    grid.appendChild(createCard(card));
  });

  startTime = Date.now();
}

function endGame() {
  grid.classList.remove("show");

  // Duration of the game round
  const time = String(Math.floor((Date.now() - startTime) / 1000));

  let bestTime: string;

  if (!localStorage.getItem("best-time")) {
    localStorage.setItem("best-time", time);
    bestTime = time;
  } else if (localStorage.getItem("best-time")! < time) {
    bestTime = localStorage.getItem("best-time")!;
  } else {
    localStorage.setItem("best-time", time);
    bestTime = time;
  }

  document.querySelector(".time")!.textContent = `Time: ${time} seconds`;
  document.querySelector(
    ".best-time"
  )!.textContent = `Best Time: ${bestTime} seconds`;

  restartScreen.classList.add("show");

  correctGuesses = 0;

  document.querySelector("#restart")!.addEventListener("click", startGame);
}

function createCard(cardInfo: Card) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.value = cardInfo.value;

  const cardFront = document.createElement("div");
  cardFront.classList.add("card-front");

  card.appendChild(cardFront);

  const cardBack = document.createElement("div");
  cardBack.classList.add("card-back");
  cardBack.style.backgroundColor = cardInfo.value;

  card.addEventListener("click", flipCard);

  card.appendChild(cardBack);

  return card;
}

function flipCard(this: HTMLDivElement) {
  // "this" comes from the eventlisteners attached to the cards
  if (lockBoard) return;

  if (this === firstCard) return;

  this.classList.add("flip");

  // If it is the first card
  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;

    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard?.dataset.value === secondCard?.dataset.value;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  // Remove the event listeners on the correct guessed ones
  firstCard?.removeEventListener("click", flipCard);
  secondCard?.removeEventListener("click", flipCard);

  firstCard?.classList.add("correct");
  secondCard?.classList.add("correct");

  resetBoard();

  correctGuesses++;

  if (correctGuesses === 6) {
    endGame();
  }
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard?.classList.remove("flip");
    secondCard?.classList.remove("flip");

    resetBoard();
  }, 800);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}
