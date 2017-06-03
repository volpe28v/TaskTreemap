var taskTextarea = Vue.component('task-textarea',{
  template: '<div>\
  <textarea cols="100" rows="10" v-model="text" placeholder="add multiple lines"></textarea>\
</div>',

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

  methods: {
    updateText: function(){
      var self = this;

      var tasks = {
        "name": "root_dir",
        "children": null
      }

      var rows = self.text.split("\n").filter(function(row){
        return row.split(" ").length >= 3 ? true : false;
      });

      var children = rows.map(function(row){
        var elems = row.split(" ");
        return {
          "name": elems[0],
          "size": Number(elems[1]),
          "status": elems[2]
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
