<template>
  <div @click.alt="changeView" @click.shift="changeView">
    <div class="wrapper">
      <a :href="'/?id=' + map_id" class="map-id">{{map_id}}</a>
      <task-treemap class="treemap-area"
                    :id="map_id"
                    :tasks="tasks"
                    :trigger="updateTrigger"
                    :simple="true"
                    v-on:update-tasks="updateTextTasks"
                    v-on:select-task="selectTask">
      </task-treemap>
      <div class="rightpane" v-show="viewMode == 1">
        <burn-down class="burn-down"
                   :id="id"
                   :tasks="tasks"
                   :progress="progress"
                   :socket="socket"
                   :trigger="updateTrigger"
                   v-on:update-tasks="updateTextTasks"
                   >
        </burn-down>
      </div>
      <div class="rightpane" v-show="viewMode == 2">
        <task-textarea class="text-area"
                       :id="id"
                       :tasks="textTasks"
                       :line="taskLine"
                       :socket="socket"
                       :trigger="updateTrigger"
                       :font_size="12"
                       v-on:update-tasks="updateTasks"
                       v-on:update-progress="updateProgress"
                       >
        </task-textarea>
      </div>
    </div>
  </div>
</template>

<style>
.wrapper {
  margin: 5px 10px;
  width: 400px;
  height: 600px;
  flex-direction: column;
}

.map-id {
  color: white;
  margin-top: 5px;
  margin-left: 5px;
}

</style>

<script>
var taskTreemap  = require("./task_treemap.vue").default;
var taskTextarea = require("./task_textarea.vue").default;
var burnDown     = require("./burn_down.vue").default;

var socket = require('socket.io-client')('/', {});

socket.on('connect', function() {
  console.log("connected socket.io");
});

module.exports = {
  props: ['map_id'],

  components: {
    'task-treemap': taskTreemap, 
    'task-textarea': taskTextarea, 
    'burn-down': burnDown 
  },
  data: function(){
    return {
      tasks: null,
      textTasks: null,
      taskLine: 0,
      progress: null,
      id: this.map_id,
      socket: socket,
      viewMode: 1,
      updateTrigger: false,
    }
  },

  mounted: function(){
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
      this.viewMode = this.viewMode < 2 ? (this.viewMode + 1) : 1;

      var self = this;
      setTimeout(function(){
        self.updateTrigger = !self.updateTrigger;
      },1);
    }

  }
}
</script>
