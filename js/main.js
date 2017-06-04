// vue vm
var taskTreemap = require("./task_treemap");
var taskTextarea= require("./task_textarea");

new Vue({
  el: '#app',
  data: {
    tasks: null,
  },

  mounted: function(){
    var self = this;
    self.tasks = null;
  },

  methods: {
    updateTasks: function(params){
      this.tasks = params.tasks;
    }
  }
});
