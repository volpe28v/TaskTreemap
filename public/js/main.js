// vue vm
var taskTreemap  = require("./task_treemap");
var taskTextarea = require("./task_textarea");
var burnDown     = require("./burn_down.vue").default;

var socket = require('socket.io-client')('/', {});

socket.on('connect', function() {
  console.log("connected socket.io");
});

var router = new VueRouter({
  mode: 'history',
  routes: []
});

new Vue({
  router: router,
  el: '#app',
  components: {
    'burn-down': burnDown 
  },
  data: function(){
    return {
      tasks: null,
      textTasks: null,
      taskLine: 0,
      progress: null,
      id: this.$route.query.id,
      socket: socket,
      viewMode: 1,
      updateTrigger: false,
    }
  },

  mounted: function(){
    var self = this;
    self.viewMode = (Number)(localStorage.viewMode ? localStorage.viewMode : 1);
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

    setTaskLine: function(params){
      var cursor_task = params.children.filter(function(task){ return task.cursor == true; })[0];
      if (cursor_task){
        this.taskLine = cursor_task.i;
        return;
      }

      if (params.line){
        this.taskLine = params.line;
        return;
      }
    },

    updateProgress: function(params){
      this.progress = params.progress;
    },

    changeView: function(){
      this.viewMode = this.viewMode < 3 ? (this.viewMode + 1) : 1;

      localStorage.viewMode = this.viewMode;

      var self = this;
      setTimeout(function(){
        self.updateTrigger = !self.updateTrigger;
      },1);
    }
  }
});
