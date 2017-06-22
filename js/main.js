// vue vm
var taskTreemap = require("./task_treemap");
var taskTextarea= require("./task_textarea");

new Vue({
  el: '#app',
  data: {
    tasks: null,
    textTasks: null,
    taskLine: 0,
  },

  methods: {
    updateTasks: function(params){
      this.tasks = params.tasks;
    },
    updateTextTasks: function(params){
      this.textTasks = params.tasks;
    },
    selectTask: function(params){
      this.taskLine = params.no;
    }
  }
});
