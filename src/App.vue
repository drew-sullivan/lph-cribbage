<template>
  <div id="app">
    <Home msg="Welcome to Your Vue.js App"/>
    <vue-snotify></vue-snotify>
  </div>
</template>

<script>
import Home from './components/Home.vue'

export default {
  name: 'app',
  components: {
    Home
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #d3d3d3;
  margin-top: 60px;
}

body {
  background-color: #0c8d3b;
}
</style>
