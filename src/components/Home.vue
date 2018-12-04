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
      <button class="start-btn btn btn-primary">Start Game</button>
      <template>
        <ul v-if="cards && cards.length">
          <li v-for="(card, index)  in cards" :key="index">
            <img :src="card.image" alt="cardPic">
          </li>
        </ul>
      </template>
    </main>

    <footer class="footer">
      <div class="container">
        <span class="text-muted">Footer stuff</span>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  created() {
    this.getDeckFromAPI()
  },
  data() {
    return {
      cards: [],
      deckID: '',
      player1Hand: [],
      player2Hand: []
    }
  },
  name: 'Home',
  props: {
    msg: String
  },
  methods: {
    getDeckFromAPI() {
      axios.get('https://deckofcardsapi.com/api/deck/new/')
      .then(response => {
        this.deckID = response.data['deck_id']
        this.printAllCards()
        this.dealCards()
      })
      .catch(error => console.log(error))
    },
    printAllCards() {
      axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/draw/?count=52`)
      .then(response => this.cards = response.data.cards)
      .catch(error => console.log(error))
    },
    dealCards() {
      axios.get(`https://deckofcardsapi.com/api/deck/${this.deckID}/draw/?count=12`)
      .then(response => this.cards = response.data.cards)
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
