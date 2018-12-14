<template>
  <div class="table">
    <header>
      <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a class="navbar-brand" href="/gotta-add-a-path-to-something-here">LPH Cribbage</a>
        <button class="start-btn btn btn-primary" @click="startGame" v-if="gameStarted == false">Start Game</button>
        <button class="start-btn btn btn-primary" @click="startGame" v-if="gameStarted == true">Restart Game</button>
      </nav>
    </header>

    <main role="main" class="container">
      <div class="row">
        <div class="col col-md-2">Crib-and-Deck</div>

        <div class="hands col col-md-10">
          <div v-if="cards.computerHand && cards.computerHand.length">
            <h1>Computer Hand</h1>
            <ul class="row justify-content-md-center">
                <li v-for="(card, index) in cards.computerHand" :key="index" class="card-list-item">
                  <img class="card-img" :src="card.image" alt="cardPic">
                </li>
            </ul>
          </div>

          <div v-if="cards.computerHand && cards.computerHand.length">
            <h1>Player Hand</h1>

            <div v-if="selectedCards.length">
              <ul class="row">
                Selected:
                <li v-for="(card, index) in selectedCards" :key="index">
                  <span>{{ card.code }}</span>
                </li>
                <button @click="sendSelectedCardsToCrib" class="btn btn-primary">Send to Crib</button>
              </ul>
            </div>

            <ul class="row justify-content-md-center">
              <li v-for="(card, index) in cards.playerHand" :key="index" class="card-list-item">
                <img class="card-img" :src="card.image" alt="cardPic" @click="toggleCardSelection(card)">
              </li>
            </ul>
          </div>
        </div>
      </div> <!-- .hands -->

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
      crib: []
    }
  },
  name: 'Home',
  props: {
    msg: String
  },
  methods: {
    startGame: function () {
      this.gameStarted = true
      this.cards.computerHand = []
      this.cards.playerHand = []
      this.getNewDeck()
    },
    getNewDeck() {
      axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        this.deckID = response.data['deck_id']
        this.dealCards()
      })
      .catch(error => console.log(error))
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
      .catch(error => console.log(error))
    },
    toggleCardSelection(card) {
      const index = this.selectedCards.indexOf(card)
      if (index > -1) {
        this.selectedCards.splice(index, 1)
      } else if (this.selectedCards.length < 2) {
        this.selectedCards.push(card)
      }
    },
    sendSelectedCardsToCrib() {
      this.selectedCards.forEach(card => this.crib.push(card))
      //grab cards computer's hand and add to crib
      this.selectedCards = []
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

start-btn {
  display: flex;
  margin: 0 auto;
  align-items: center;
}

.card-list-item {
  padding: 0;
  margin: 0;
}

.card-img {
  width: 120px;
  margin-left: -100px;
}

/* Sticky footer styles
-------------------------------------------------- */
html {
  position: relative;
  min-height: 100%;
}
body {
  /* Margin bottom by footer height */
  margin-bottom: 60px;
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* Set the fixed height of the footer here */
  height: 60px;
  line-height: 60px; /* Vertically center the text there */
  background-color: #f5f5f5;
}


/* Custom page CSS
-------------------------------------------------- */
/* Not required for template or sticky footer method. */

body > .container {
  padding: 60px 15px 0;
}

.footer > .container {
  padding-right: 15px;
  padding-left: 15px;
}

code {
  font-size: 80%;
}
</style>
