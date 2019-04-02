<template>
  <div class="table">
    <header>
      <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a class="navbar-brand" href="/gotta-add-a-path-to-something-here">LPH Cribbage</a>
        <button class="btn btn-primary" @click="startGame" v-if="gameStarted == false">Start Game</button>
        <button class="btn btn-primary" @click="startGame" v-if="gameStarted == true">Restart Game</button>
      </nav>
    </header>

    <main role="main" class="container">
      <div class="row">

        <div class="hands col col-md-6">
          <div v-if="cards.computerHand && cards.computerHand.length">
            <h1 class="hand-title">Computer Hand</h1>
            <ul class="row hand-name list-inline">
              <li v-for="(card, index) in cards.computerHand" :key="index" class="card-list-item">
                <img class="card-img" :src="card.image" alt="cardPic"
                     :class="{ 'non-first-hand-card': index !== 0 }">
              </li>
            </ul>
          </div> <!-- .computerHand -->

          <div v-if="cards.playerHand && cards.playerHand.length">

            <h1 class="hand-title">Player Hand
              <div v-if="selectedCards.length == 2" class="send-to-crib-btn-box">
                <button @click="sendSelectedCardsToCrib" class="btn btn-default">Send to Crib</button>
              </div>
            </h1>

            <ul class="row hand-name list-inline">
              <li v-for="(card, index) in cards.playerHand" :key="index" class="card-list-item">
                <img class="card-img" :src="card.image" alt="cardPic"
                     @click="toggleCardSelection(card)"
                     :class="{ activeCard: selectedCards.includes(card),
                               'non-first-hand-card': index !== 0 }">
              </li>
            </ul>

          </div> <!-- .playerHand -->
        </div> <!-- .hands -->
      </div> <!-- .row -->
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
      deckID: '',
      gameStarted: false,
      selectedCards: [],
      crib: [],
      leftoverDeck: [],
      gameState: ''
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
      this.getNewDeck()
    },
    getNewDeck() {
      this.gameState = 'Choosing cards to send to crib'
      axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        this.deckID = response.data['deck_id']
        this.dealCards()
      })
      .catch()
    },
    dealCards() {
      const NUM_CARDS_TO_DRAW = 12
      axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/draw/?count=${NUM_CARDS_TO_DRAW}`)
      .then(response => {
        const cards = response.data.cards
        for (var i = 0; i < cards.length; i++) {
          const card = cards[i]
          const hand = i % 2 == 0 ? this.cards.playerHand : this.cards.computerHand
          hand.push(card)
        }
      })
      .catch()
    },
    toggleCardSelection(card) {
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
    },
    updateHands() {
      this.cards.playerHand = this.cards.playerHand.filter(card => !this.crib.includes(card))
      this.cards.computerHand = this.cards.computerHand.filter(card => !this.crib.includes(card))
      this.gameState = 'playing'
    },
    sendAISelectionToCrib() {
      //random right now
      for (let i = 0; i < 2; i++) {
        let randIndex = Math.floor(Math.random() * this.cards.computerHand.length)
        const card = this.cards.computerHand[randIndex]
        this.crib.push(card)
        this.cards.computerHand.splice(randIndex, 1)
      }
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
  /* float: left; */
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
  font-size: 1.5rem;
}

.selected-cards {
  padding-top: 7px;
}

.card-list-item {
  padding: 0;
  margin: 0;
}

.activeCard {
  margin-top: -15px;
}

.card-img,
.card-back-img {
  width: 132px;
}

.non-first-hand-card {
  margin-left: -100px;
}

.crib-bottom {
  margin-top: -299px;
  margin-right: -9px;
}

.hand-name {
  border-top: 2px solid #d3d3d3;
  padding-top: 20px;
}

.list-inline {
  display: flex;
  justify-content: center;
}

.send-to-crib-btn-box {
  text-align: left;
  float: right;
  margin-left: 15px;
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
