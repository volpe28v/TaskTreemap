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
      this.setTaskLine(params.tasks);
    },
    updateTextTasks: function(params){
      this.textTasks = params.tasks;
      this.setTaskLine(params.tasks);
    },
    selectTask: function(params){
      this.taskLine = params.no;
    },
    setTaskLine: function(tasks){
      var cursor_task = tasks.children.filter(function(task){ return task.cursor == true; })[0];
      if (cursor_task){
        this.taskLine = cursor_task.i;
      }
    }
  }
});
