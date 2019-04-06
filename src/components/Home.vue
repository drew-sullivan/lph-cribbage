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
      playerIsCurrentPlayer: true
    }
  },
  name: 'Home',
  props: {
    msg: String
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
    },
    aiPlaysCard() {
      // random right now
      const randIndex = Math.floor(Math.random() * this.cards.computerHand.length)
      const card = this.cards.computerHand[randIndex]
      // console.log('aiPlays')
      if (this.playerCanLegallyPlayFrom(this.cards.computerHand, card)) {
        this.cardsInPlay.push(card)
        this.cards.computerHand.splice(randIndex, 1)
        this.updateHands()
        this.evaluateCardsInPlay()
      }
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
      const total = this.getPointTotalForCardsInPlay()
      if (total == 15) {
        // award points to most recent player
      } else if (total == 31) {
        // award points to most recent player
      } else {
        // keep playing
      }
    },
    getPointTotalForCardsInPlay() {
      return this.cardsInPlay.reduce((accumulator, currCard) => accumulator + this.getValueOf(currCard), 0)
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
      return this.getValueOf(card) + this.getPointTotalForCardsInPlay() <= 31
    },
    getValueOf(card) {
      if (card.value == "KING" || card.value == "JACK" || card.value == "QUEEN") {
        return 10
      } else if (card.value == "ACE") {
        return 1
      } else {
        return parseInt(card.value, 10)
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
