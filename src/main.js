import Vue from 'vue'
import App from './App.vue'
import Snotify from 'vue-snotify';
import 'vue-snotify/styles/material.css'

Vue.use(Snotify)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
