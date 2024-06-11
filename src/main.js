import Vue from 'vue';
import App from './App.vue';

import store from './store'; // Import the Vuex store

Vue.config.productionTip = false;

new Vue({
   // Use the router
  store, // Use the Vuex store
  render: h => h(App),
}).$mount('#app');
