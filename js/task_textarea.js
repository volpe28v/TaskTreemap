var taskTextarea = Vue.component('task-textarea',{
  template: '<textarea v-model="text" placeholder="add multiple lines"></textarea>',

  props: [],

  data: function(){
    return {
      text: ""
    }
  },

  watch: {
    text: function(){
      this.updateText();
    },
  },

  mounted: function(){
    this.text = [
      "タスク1 30 Todo",
      "タスク2 40 Todo",
      "タスク3 50 Todo",
      "タスク4 60 Todo",
      "タスク5 70 Doing Aさん",
      "タスク6 80 Done",
      "タスク7 55 Todo",
      "タスク8 45 Doing",
      "タスク9 35 Done",
      "タスク10 90 Done Bさん",
    ].join("\n");

  },

  methods: {
    updateText: function(){
      var self = this;

      var tasks = {
        "name": "root_dir",
        "children": null
      }

      var rowReg = /(\S+)[ ¥t]+([\d\.]+)([ ¥t]+(\S+))?([ ¥t]+(\S+))?/;
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
