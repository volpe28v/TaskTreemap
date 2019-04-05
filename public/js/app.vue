<template>
  <div @click.alt="changeView" @click.shift="changeView">
    <div class="wrapper" v-if="viewMode == 1">
      <task-treemap class="treemap-area"
                    :id="id"
                    :tasks="tasks"
                    :trigger="updateTrigger"
                    v-on:update-tasks="updateTextTasks"
                    v-on:select-task="selectTask">
      </task-treemap>
      <div class="rightpane">
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
    </div>
    <div class="wrapper" v-if="viewMode == 2">
      <burn-down class="burn-down-large"
                 :id="id"
                 :tasks="tasks"
                 :progress="progress"
                 :socket="socket"
                 :trigger="updateTrigger"
                 v-on:update-tasks="updateTextTasks"
                 >
      </burn-down>

        <div class="rightpane">
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
            <task-treemap class="treemap-area"
                          :id="id"
                          :tasks="tasks"
                          :trigger="updateTrigger"
                          v-on:update-tasks="updateTextTasks"
                          v-on:select-task="selectTask">
            </task-treemap>
        </div>
    </div>
    <div class="wrapper" v-if="viewMode == 3">
      <task-textarea class="text-area-left"
                     :id="id"
                     :tasks="textTasks"
                     :line="taskLine"
                     :socket="socket"
                     :trigger="updateTrigger"
                     :font_size="14"
                     v-on:update-tasks="updateTasks"
                     v-on:update-progress="updateProgress"
                     >
      </task-textarea>

        <div class="rightpane">
          <task-treemap class="treemap-area-right"
                        :id="id"
                        :tasks="tasks"
                        :trigger="updateTrigger"
                        v-on:update-tasks="updateTextTasks"
                        v-on:select-task="selectTask">
          </task-treemap>
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
    </div>
  </div>
</template>

<script>
var taskTreemap  = require("./task_treemap.vue").default;
var taskTextarea = require("./task_textarea.vue").default;
var burnDown     = require("./burn_down.vue").default;

var socket = require('socket.io-client')('/', {});

socket.on('connect', function() {
  console.log("connected socket.io");
});

module.exports = {
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
}
</script>
