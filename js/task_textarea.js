var taskTextarea = Vue.component('task-textarea',{
  template: '<div>\
    <div class="task-info">残り {{todo_count}}/{{ count }} タスク. {{todo_sizes}}/{{ sizes }} 規模.</div>\
    <textarea v-model="text" placeholder="Title 30 Todo/Doing/Done Assignee"></textarea>\
  </div>',

  props: ['tasks'],

  data: function(){
    return {
      count: 0,
      todo_count: 0,
      doing_count: 0,
      done_count: 0,

      sizes: 0,
      todo_sizes: 0,
      doing_sizes: 0,
      done_sizes: 0,
      text: "",

      sepaMode: "space"
    }
  },

  watch: {
    text: function(){
      this.updateText();
    },
    tasks: function(){
      this.updateTasks();
    },
  },

  mounted: function(){
    if (localStorage.text){
      this.text = localStorage.text;
    }else{
      // デフォルトテキスト
      this.text = [
        "タスク1 30 Todo",
        "タスク2 40 Todo",
        "タスク3 50 Todo Cさん",
        "タスク4 60 Todo",
        "タスク5 70 Doing Aさん",
        "タスク6 80 Done",
        "タスク7 55 Todo Aさん",
        "タスク8 45 Doing",
        "タスク9 35 Done Cさん",
        "タスク10 90 Done Bさん",
      ].join("\n");
    }
  },

  methods: {
    getReg: function(sepaMode){
      var self = this;

      if (sepaMode == "space"){
        return /(\S+)[ ]+([\d\.]+)([ ]+(\S+))?([ ]+(\S+))?/;
      }else{
        return /(.+)[\t]+([\d\.]+)([\t]+(\w+))?([\t]+(.+))?/;
      }
    },

    getSizes: function(tasks){
      if (tasks.length == 0){ return 0; }

      return tasks.length == 1 ? tasks[0].size : tasks.map(function(task){ return task.size; })
       .reduce(function(prev, size){ return prev + size; });
    },
 
    updateText: function(){
      var self = this;
      if (localStorage){
        localStorage.text = self.text;
      }

      // タブ区切りを自動認識
      self.sepaMode = "space";
      if (self.text.match(/\t/)){
        self.sepaMode = "tab";
      }

      var rowReg = self.getReg(self.sepaMode);

      var tasks = {
        "children": null
      }

      var children = self.text.split("\n")
        .filter(function(row){
          var matched = row.match(rowReg);
          return matched != null;
        })
        .map(function(row){
          var matched = row.match(rowReg);
          return {
            "name": matched[1],
            "size": Number(matched[2]),
            "status": matched[4] ? matched[4] : "Todo",
            "assignee": matched[6]
          }
        });

      tasks.children = children;
      var doing = children.filter(function(child){ return child.status != null && child.status.match(/Doing/i); });
      var done = children.filter(function(child){ return child.status != null && child.status.match(/Done/i); });
      var todo = children.filter(function(child){ return child.status == null || !child.status.match(/Done/i); });

      self.count = children.length;
      self.todo_count = todo.length;
      self.doing_count = doing.length;
      self.done_count = done.length;

      self.sizes = self.getSizes(children);
      self.todo_sizes = self.getSizes(todo);
      self.doing_sizes = self.getSizes(doing);
      self.done_sizes = self.getSizes(done);

      self.$emit('update-tasks',
        {
          tasks: tasks
        });
    },

    updateTasks: function(){
      var self = this;

      var delim = self.sepaMode == "space" ? " " : "\t";
      var children = self.tasks.children;
      var tempText = [];
      children.forEach(function(child){
        tempText.push(
          child.name + delim + 
          child.size + delim + 
          child.status + delim + 
          (child.assignee ? child.assignee : ""));
      });

      self.text = tempText.join("\n");
    },
  }
});

module.exports = taskTextarea;
