var taskTextarea = Vue.component('task-textarea',{
  template: '<div>\
    <div class="task-info">{{ count }} tasks.</div>\
    <textarea v-model="text" placeholder="Title 30 Todo/Doing/Done Assignee"></textarea>\
  </div>',

  props: [],

  data: function(){
    return {
      count: 0,
      text: ""
    }
  },

  watch: {
    text: function(){
      this.updateText();
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

    updateText: function(){
      var self = this;
      if (localStorage){
        localStorage.text = self.text;
      }

      // タブ区切りを自動認識
      var sepaMode = "space";
      if (self.text.match(/\t/)){
        sepaMode = "tab";
      }

      var rowReg = self.getReg(sepaMode);

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
      self.count = children.length;

      self.$emit('update-tasks',
        {
          tasks: tasks
        });
    },
  }
});

module.exports = taskTextarea;
