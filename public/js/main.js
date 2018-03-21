var app = require("./app.vue").default;

var router = new VueRouter({
  mode: 'history',
  routes: []
});

new Vue({
  router: router,
  el: '#app',
  template: '<App id="app"/>',
  components: { 'App': app },
});
