<template>
  <div class="table">
    <header>
      <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a class="navbar-brand" href="/gotta-add-a-path-to-something-here">LPH Cribbage</a>
        <button class="btn btn-primary" @click="startGame" v-if="gameStarted == false">Start Game</button>
        <button class="btn btn-primary" @click="startGame" v-if="gameStarted == true">Restart Game</button>
      </nav>
    </header>

    <main role="main" class="container-fluid">

        <h1 v-if="cards.computerHand && cards.computerHand.length" class="hand-title">Computer</h1>
        <div v-if="cards.computerHand && cards.computerHand.length">
          <ul class="hand-name list-inline">
            <li v-for="(card, index) in cards.computerHand" :key="index" class="card-list-item">
              <img class="card-img" :src="card.image" alt="cardPic"
                    :class="{ 'non-first-hand-card': index !== 0 }">
            </li>
          </ul>
        </div>
        <div v-else>
          <div class="hand-name">
            <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img placeholder">
          </div>
        </div> <!-- .computerHand -->

        <div class="row"> <!-- deck and cards in play -->
          <div class="col-md-6">
            <div v-if="crib && crib.length && topOfDeck !== ''" class="deck-location">
              <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img">
              <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img deck">
              <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img deck">
              <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img deck">
              <img :src="topOfDeck.image" alt="card-back" class="card-back-img deck">
              <span v-if="cardsInPlay && cardsInPlay.length">
                <span v-for="(card, index) in cardsInPlay" :key="index">
                  <img class="card-img" :src="card.image" alt="cardPic"
                        :class="{ 'card-in-play': index !== 0 }">
                </span>
              </span>
            </div>
            <div v-else class="deck-location">
              <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img placeholder">
            </div>
          </div>
        </div> <!-- deck and cards in play -->

        <div class="fixed-bottom">
          <h1 v-if="cards.playerHand && cards.playerHand.length" class="hand-title">Player
            <div v-if="selectedCards.length == 2" class="send-to-crib-btn-box">
              <button @click="sendSelectedCardsToCrib" class="btn btn-default">Send to Crib</button>
            </div>
          </h1>
          <div v-if="cards.playerHand && cards.playerHand.length">
            <ul class="hand-name list-inline">
              <li v-for="(card, index) in cards.playerHand" :key="index" class="card-list-item">
                <img class="card-img" :src="card.image" alt="cardPic"
                    @click="performActionWith(card)"
                    :class="{ activeCard: selectedCards.includes(card) || cardsInPlay.includes(card),
                              'non-first-hand-card': index !== 0 }">
              </li>
            </ul>
          </div>
          <div v-else>
            <div class="hand-name">
              <img src="../assets/Card_back_01.svg" alt="card-back" class="card-back-img placeholder">
            </div>
          </div>
          <div class="score text-left">
            <div class="col-sm" :class="{ 'is-playerIsDealer': playerIsDealer }">
              Player: {{ scores.player }}
            </div>
            <div class="col-sm" :class="{ 'is-playerIsDealer': !playerIsDealer }">
              Computer: {{ scores.computer }}
            </div>
          </div> <!-- .score -->
        </div> <!-- .fixed-bottom -->

    </main> <!-- .container -->
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      cards: {
        playerHand: [],
        computerHand: []
      },
      scores: {
        player: 0,
        computer: 0
      },
      deckID: '',
      gameStarted: false,
      selectedCards: [],
      crib: [],
      topOfDeck: '',
      leftoverDeck: [],
      gameState: '',
      cardsInPlay: [],
      playerIsDealer: true,
      playerIsCurrentPlayer: true,
      playEvaluation: {
        total: 0,
        runLength: 0,
        numKindInARow: 0
      }
    }
  },
  name: 'Home',
  props: {
    msg: String
  },
  computed: {
    numCardsInPlay: function () {
      return this.cardsInPlay.length
    }
  },
  methods: {
    startGame: function () {
      this.gameState = 'Not begun'
      this.gameStarted = true
      this.cards.computerHand = []
      this.cards.playerHand = []
      this.crib = []
      this.getNewDeck()
    },
    getNewDeck() {
      this.gameState = 'Dealing'
      axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        this.deckID = response.data['deck_id']
        this.dealCards()
      })
    },
    dealCards() {
      const NUM_CARDS_TO_DRAW = 13
      axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/draw/?count=${NUM_CARDS_TO_DRAW}`)
      .then(response => {
        const cards = response.data.cards
        for (var i = 0; i < cards.length; i++) {
          const card = cards[i]
          if (i == NUM_CARDS_TO_DRAW - 1) {
            this.topOfDeck = card
            break
          }
          const hand = i % 2 == 0 ? this.cards.playerHand : this.cards.computerHand
          hand.push(card)
        }
      })
      this.gameState = 'Choosing cards to send to crib'
    },
    toggleSelection(card) {
      if (this.gameState != 'Choosing cards to send to crib') { return }
      const index = this.selectedCards.indexOf(card)
      if (index > -1) {
        this.selectedCards.splice(index, 1)
      } else if (this.selectedCards.length < 2) {
        this.selectedCards.push(card)
      }
    },
    sendSelectedCardsToCrib() {
      this.selectedCards.forEach(card => this.crib.push(card))
      this.sendAISelectionToCrib()
      this.updateHands()
      this.selectedCards = []
      this.gameState = 'Playing'
      this.cardsInPlay = []
      this.evaluateTwoForHisHeels() // top of deck is a jack
    },
    evaluateTwoForHisHeels() {
      if (this.topOfDeck.value == "JACK") {
        if (this.playerIsDealer) {
          this.scores.player += 2
        } else {
          this.scores.computer += 2
        }
      }
    },
    updateHands() {
      if (this.gameState == 'Choosing cards to send to crib') {
        this.cards.playerHand = this.cards.playerHand.filter(card => !this.selectedCards.includes(card))
        this.cards.computerHand = this.cards.computerHand.filter(card => !this.selectedCards.includes(card))
      } else if (this.gameState == 'Playing') {
        this.cards.playerHand = this.cards.playerHand.filter(card => !this.cardsInPlay.includes(card))
        this.cards.computerHand = this.cards.computerHand.filter(card => !this.cardsInPlay.includes(card))

      }
    },
    sendAISelectionToCrib() {
      // random right now
      for (let i = 0; i < 2; i++) {
        let randIndex = Math.floor(Math.random() * this.cards.computerHand.length)
        const card = this.cards.computerHand[randIndex]
        this.crib.push(card)
        this.cards.computerHand.splice(randIndex, 1)
      }
    },
    play(card) {
      if (this.playerCanLegallyPlayFrom(this.cards.playerHand, card)) {
        this.cardsInPlay.push(card)
        this.updateHands()
        this.evaluateCardsInPlay()
      }
      this.playerIsCurrentPlayer = false
      // alert -- player says 'Go'
    },
    aiPlaysCard() {
      // random right now
      const randIndex = Math.floor(Math.random() * this.cards.computerHand.length)
      const card = this.cards.computerHand[randIndex]
      if (this.playerCanLegallyPlayFrom(this.cards.computerHand, card)) {
        this.cardsInPlay.push(card)
        this.cards.computerHand.splice(randIndex, 1)
        this.updateHands()
        this.evaluateCardsInPlay()
      }
      this.playerIsCurrentPlayer = true
      // alert -- computer says 'Go'
    },
    performActionWith(card) {
      if (this.gameState == 'Playing') {
        this.play(card)
        this.aiPlaysCard()
      } else if (this.gameState == 'Choosing cards to send to crib') {
        this.toggleSelection(card)
      }
    },
    evaluateCardsInPlay() {
      this.playEvaluation.total = this.getPointTotalForCardsInPlay()
      this.playEvaluation.runLength = this.getRunLength()
      this.playEvaluation.numKindInARow = this.getNumOfAKindInARow()
      const total = this.playEvaluation.total
      const runLength = this.playEvaluation.runLength
      const numKindInARow = this.playEvaluation.numKindInARow
      if (total == 15 || total == 31 || numKindInARow == 2) {
        this.playerIsCurrentPlayer ? this.scores.player += 2 : this.scores.computer += 2
      } else if (numKindInARow == 3) {
        this.playerIsCurrentPlayer ? this.scores.player += 6 : this.scores.computer += 6
      } else if (numKindInARow == 4) {
        this.playerIsCurrentPlayer ? this.scores.player += 12 : this.scores.computer += 12
      } else if (runLength > 2) {
        this.playerIsCurrentPlayer ? this.scores.player += runLength : this.scores.computer += runLength
      }
    },
    getNumOfAKindInARow() {
      let numOfAKindInARow = 1
      if (this.numCardsInPlay >= 2) {
        let latestCard = this.cardsInPlay[this.numCardsInPlay - 1]
        for (let i = this.numCardsInPlay - 2; i >= 0; i--) {
          if (this.cardsInPlay[i].value == latestCard.value) {
            numOfAKindInARow += 1
          } else {
            break
          }
        }
      }
      return numOfAKindInARow
    },
    getRunLength() {
      if (this.cardsInPlay.length < 3) { return -1 }

      let index = 0
      let cardData = this.getCardData(index, this.cardsInPlay)

      while (cardData.numNums >= 3) {
        const diff = cardData.high - cardData.low
        const gap = cardData.numNums - 1
        if (diff != gap) {
          index++
          if (this.cardsInPlay.length - index < 3) {
            return -1
          }
          cardData = this.getCardData(index, this.cardsInPlay)
        } else {
          break
        }
      }
      return cardData.numNums
    },
    // helper for getRunLength()
    getCardData(index, cardsInPlay) {
      let high = this.getRunValueOf(cardsInPlay[index])
      let low = this.getRunValueOf(cardsInPlay[index])

      for (let i = index; i < cardsInPlay.count; i++) {
        const currCardValue = this.getRunValueOf(cardsInPlay[i])
        if (currCardValue > high) {
          high = currCardValue
        }
        if (currCardValue < low) {
          low = currCardValue
        }
      }
      return { high: high, low: low, numNums: cardsInPlay.length - index }
    },
    getPointTotalForCardsInPlay() {
      return this.cardsInPlay.reduce((accumulator, currCard) => accumulator + this.getNumericValueOf(currCard), 0)
    },
    handContainsPlayableCard(hand) {
      for (let card of hand) {
        if (this.isPlayable(card)) {
          return true
        }
      }
      return false
    },
    isPlayable(card) {
      return this.getNumericValueOf(card) + this.getPointTotalForCardsInPlay() <= 31
    },
    getNumericValueOf(card) {
      if (card.value == "KING" || card.value == "JACK" || card.value == "QUEEN") {
        return 10
      } else if (card.value == "ACE") {
        return 1
      } else {
        return parseInt(card.value, 10)
      }
    },
    getRunValueOf(card) {
      switch (card.value) {
        case "KING":
          return 13
        case "QUEEN":
          return 12
        case "JACK":
          return 11
        case "ACE":
          return 1
        default:
          return this.getNumericValueOf(card)
      }
    },
    playerCanLegallyPlayFrom(hand, card) {
      return this.handContainsPlayableCard(hand) && this.isPlayable(card)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin-top: 10px;
  margin-bottom: 10px;
  display: inline-block;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.hand-title {
  text-align: left;
  font-size: 18px;
}

.selected-cards {
  padding-top: 7px;
}

.card-list-item {
  padding: 0;
  margin: 0;
}

.card-in-play {
  margin-left: -81px;
}

.activeCard {
  margin-top: -15px;
}

.card-img,
.card-back-img {
  width: 100px;
}

.non-first-hand-card {
  margin-left: -48px;
}

.is-playerIsDealer {
  background-color: red;
}

.hand-name {
  padding-top: 8px;
}

.deck {
  margin-left: -98px;
}

.deck-location {
  text-align: left;
}

.score {
  min-height: 60px;
  background-color: #d3d3d3;
  color: black;
}

.placeholder {
  opacity: 0;
}

.list-inline {
  display: flex;
  justify-content: center;
}

.send-to-crib-btn-box {
  text-align: left;
  float: right;
  margin-left: 15px;
  margin-top: -8px;
}

body > .container {
  padding: 60px 5px 0;
}

.footer > .container {
  padding-right: 15px;
  padding-left: 15px;
}

code {
  font-size: 80%;
}
</style>
