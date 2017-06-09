var taskTextarea = Vue.component('task-textarea',{
  template: '<div>\
    <div class="sepa-mode">\
      <input type="radio" id="space" value="space" v-model="sepaMode">\
      <label for="space">Space</label>\
      <input type="radio" id="tab" value="tab" v-model="sepaMode">\
      <label for="tab">Tab</label>\
    </div>\
    <textarea v-model="text" placeholder="Title 30 Todo/Doing/Done Assignee"></textarea>\
  </div>',

  props: [],

  data: function(){
    return {
      sepaMode: "",
      text: ""
    }
  },

  watch: {
    sepaMode: function(){
      this.updateText();
    },
    text: function(){
      this.updateText();
    },
  },

  mounted: function(){
    if (window.localStorage.text){
      this.text = window.localStorage.text;
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

    if (window.localStorage.sepaMode){
      this.sepaMode = window.localStorage.sepaMode;
    }else{
      this.sepaMode = "space";
    }
  },

  methods: {
    getReg: function(){
      var self = this;

      if (self.sepaMode == "space"){
        return /(\S+)[ ]+([\d\.]+)([ ]+(\S+))?([ ]+(\S+))?/;
      }else{
        return /(.+)[\t]+([\d\.]+)([\t]+(\w+))?([\t]+(.+))?/;
      }
    },

    updateText: function(){
      var self = this;
      window.localStorage.text = self.text;
      window.localStorage.sepaMode = self.sepaMode;

      var rowReg = self.getReg();

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

      self.$emit('update-tasks',
        {
          tasks: tasks
        });
    },
  }
});

module.exports = taskTextarea;
