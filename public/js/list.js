var list = require("./list.vue").default;

new Vue({
  el: '#app',
  template: '<List id="app"/>',
  components: { 'List': list },
});
