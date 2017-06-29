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
      
      // カーソル位置を保持する(何故か chilren.lenght が 0 になる場合があるので弾く)
      var cursor_task = params.tasks.children.filter(function(task){ return task.cursor == true; })[0];
      if (cursor_task){
        this.taskLine = cursor_task.i;
      }
    },
    updateTextTasks: function(params){
      this.textTasks = params.tasks;
      this.taskLine = params.tasks.children.filter(function(task){ return task.cursor == true; })[0].i;
    },
    selectTask: function(params){
      this.taskLine = params.no;
    }
  }
});
