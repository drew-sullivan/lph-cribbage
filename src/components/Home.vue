<template>
  <div class="table">
    <header>
      <!-- Fixed navbar -->
      <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a class="navbar-brand" href="/gotta-add-a-path-to-something-here">LPH Cribbage</a>
      </nav>
    </header>

    <!-- Begin page content -->
    <main role="main" class="container">
      <h1 class="mt-5">LPH Cribbage</h1>
      <p class="lead">Game's gonna go here</p>
      <button class="start-btn btn btn-primary" v-on:click="startGame">Start Game</button>
      <template>

        <h1>Computer Hand</h1>
        <ul v-if="cards.playerHand && cards.playerHand.length">
          <li v-for="(card, index) in cards.playerHand" :key="index">
            <img :src="card.image" alt="cardPic">
          </li>
        </ul>

        <h1>Player Hand</h1>
        <ul v-if="cards.computerHand && cards.computerHand.length">
          <li v-for="(card, index) in cards.computerHand" :key="index">
            <img :src="card.image" alt="cardPic">
          </li>
        </ul>

      </template>
    </main>
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
      deckID: ''
    }
  },
  name: 'Home',
  props: {
    msg: String
  },
  methods: {
    startGame: function (event) {
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
