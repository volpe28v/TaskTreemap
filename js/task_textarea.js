var taskTextarea = Vue.component('task-textarea',{
  template: '<div>\
    <div class="task-info">残り {{todo_count}}/{{ count }} タスク. {{todo_sizes}}/{{ sizes }} 規模. [{{sepaMode}}]</div>\
    <div id="editor"></div>\
  </div>',

  props: ['tasks','line'],

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

      sepaMode: "space",
      editor: null
    }
  },

  watch: {
    tasks: function(){
      this.updateTasks();
    },
    line: function(){
      this.editor.gotoLine(this.line, 0);
      this.editor.focus();
    },
  },

  mounted: function(){
    var self = this;

    if (localStorage.text){
      self.text = localStorage.text;
    }else{
      // デフォルトテキスト
      self.text = [
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

    // ade editor setting
    self.editor = ace.edit("editor");
    self.editor.setTheme("ace/theme/chaos");
    self.editor.getSession().setUseWrapMode(true);
    self.editor.$blockScrolling = Infinity;
    self.editor.session.setOptions({ tabSize: 2, useSoftTabs: false});
    self.editor.on('change', function(){
      self.text = self.editor.getValue();
      self.updateText();
    })
    self.editor.setValue(self.text, -1)
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
        children: null
      }

      var children = self.text.split("\n")
        .map(function(row, i){
          return {
            i: i+1,
            line: row
          };
        })
        .filter(function(row){
          var matched = row.line.match(rowReg);
          return matched != null;
        })
        .map(function(row){
          var matched = row.line.match(rowReg);
          return {
            i: row.i,
            name: matched[1],
            size: Number(matched[2]),
            status: matched[4] ? matched[4] : "Todo",
            assignee: matched[6]
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
      self.editor.setValue(self.text, -1)
    },
  }
});

module.exports = taskTextarea;
