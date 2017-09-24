var taskTreemap = Vue.component('task-treemap',{
  template: '<div>\
    <div class="task-info">\
      <button v-on:click="hideDone=!hideDone">Done</button>\
      残り規模 \
      <span class="user-info" v-for="user in users" draggable="true" @dragstart="dragstart(user, $event)" @dragend="dragend">\
        <span v-bind:class="user.class" v-on:click="selectUser(user)">{{user.name}} {{user.todo_sizes}}/{{user.sizes}}</span>\
      </span>\
    </div>\
    <div id="treemap"></div>\
  </div>',

  props: ['tasks'],

  data: function(){
    return {
      ColorMax: 9,
      users: [],
      draggingItem: null,
      hideDone: false,
      selectedUser: null,
    }
  },

  watch: {
    tasks: function(){
      this.setTasks();
    },
    hideDone: function(){
      this.update();
    }
  },

  mounted: function(){
    this.addResizeHandler();
  },

  methods: {
    setTasks: function(){
      var self = this;

      self.update();
    },

    getColorNo: function(id){
      var self = this;
      if (id == 0) return 0;

      return id % (self.ColorMax) + 1;
    },

    getStatusColor: function(status){
      var todo_color = "#6aa43e";
      if (status == null){ return todo_color; }
      if (status.match(/Done/i)){ return "#666666"; }
      if (status.match(/Doing/i)){ return "#149bdf"; }
      return todo_color; //Todo or other
    },

    getSizes: function(tasks){
      if (tasks.length == 0){ return 0; }

      return tasks.length == 1 ? tasks[0].size : tasks.map(function(task){ return task.size; })
       .reduce(function(prev, size){ return prev + size; });
    },
 
    getNextStatus: function(status){
      if (status == null){ return "Doing"; }
      if (status.match(/Done/i)){ return "Todo"; }
      if (status.match(/Doing/i)){ return "Done"; }
      return "Doing";
    },

    update: function(){
      var self = this;

      self.users = [];
      if (self.tasks == null ||
          self.tasks.children == null){ return; }

      var children = self.tasks.children;

      // assignee ごとに children を生成
      var assignee_hash = { "": { id: 0, children: [] }};
      var assignee_id = 0;
      children.forEach(function(child){
        var assignee = child.assignee != null ? child.assignee : "";

        if (assignee_hash[assignee] == null){
          assignee_hash[assignee] = { id: ++assignee_id, children: [child]};
        }else{
          assignee_hash[assignee].children.push(child);
        }
      });
       
      var tasks_node = {
        "name": "root_dir",
        "children": Object.keys(assignee_hash).map(function(key){
          return {
            "name": key,
            "children": assignee_hash[key].children
              .filter(function(child){
                if (self.hideDone && child.status.match(/Done/i)){
                  return false;
                }else if (self.selectedUser != null && self.selectedUser.name != child.assignee) {
                  return false;
                }
                return true;
              })
          }
        })
        .filter(function(child){
          return child.children.length != 0;
        })
      }

      // アサインユーザ情報生成
      self.users = tasks_node.children.map(function(child){
        return {
          name: child.name,
          class: "assignee-list-elem task-assignee assignee-" + self.getColorNo(assignee_hash[child.name].id),
          sizes: self.getSizes(child.children),
          todo_sizes: self.getSizes(child.children.filter(function(child){ return child.status == null || !child.status.match(/Done/i); })),
        };
      });

      // treemap 生成
      var height = document.getElementById("treemap").clientHeight;
      var width = document.getElementById("treemap").clientWidth;

      var treemap = d3.layout.treemap()
        .size([width, height])
        .value(function(d) { return d.size; });

      // 初期化
      d3.select("#treemap").selectAll("div").remove();
      if (children.length == 0){ return; }

      // treemap 要素生成
      var task_tree = d3.select("#treemap")
        .selectAll("div")
        .data(treemap.nodes(tasks_node));

      // div 追加処理
      task_tree.enter()
        .append("div")
        .on("click",function(d){
          self.$emit('select-task',
            {
              no: d.i 
            });
        })
        .on("dblclick",function(d){
          d.status = self.getNextStatus(d.status);

          var tasks = {
            "children": null
          }

          tasks.children = children;
          self.$emit('update-tasks',
            {
              tasks: tasks
            });

        })
        .on("dragover",function(d){
          d3.event.preventDefault();
        })
        .on("drop",function(d){
          children.forEach(function(child){
            child.cursor = false;
          });
          d.assignee = self.draggingItem.name;
          d.cursor = true;

          var tasks = {
            "children": null
          }

          tasks.children = children;
          self.$emit('update-tasks',
            {
              tasks: tasks
            });
        });
 
      // div 削除処理
      task_tree.exit()
        .remove();

      // 更新処理
      d3.select("#treemap").selectAll("div")
        .attr("class", "task-elem")
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return d.dx-6 + "px"; })
        .style("height", function(d) { return d.dy-6 + "px"; })
        .style("background", function(d, i){
          if (d.size){
            return self.getStatusColor(d.status);
          }else{
            return "#333";
          }
        })
        .style("border", function(d){
          return d.cursor ? "solid 3px #f8e352" : "solid 3px #333";
        })
        .style("color" , function(d){
          return d.cursor ? "firebrick" : "black";
        })
        .style("left", function(d) { return d.x + "px"; })
        .html(function(d) {
          if (d.children){
            return "";
          }else{
            return [
              d.assignee ? '<div class="assignee-div"><span class="task-assignee assignee-' + self.getColorNo(assignee_hash[d.assignee].id) + '">' + d.assignee + '</span></div>' : "",
              '<div class="task-name">' + d.name + '</div>',
              '<div class="task-size">' + d.size + '</div>',
            ].join("");
          }
        });
    },
    dragstart: function (user,e) {
      this.draggingItem = user;
      e.target.style.opacity = 0.5;
    },
    dragend: function (e) {
      e.target.style.opacity = 1;
    },

    addResizeHandler: function(){
      var self = this;
      var resizeTimer;
      var interval = Math.floor(1000 / 60 * 10);

      window.addEventListener('resize', function (event) {
        if (resizeTimer !== false) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
          self.update();
        }, interval);
      });
    },
    
    selectUser: function(user){
      var self = this;
      if (self.selectedUser != null && self.selectedUser.name == user.name){
        self.selectedUser = null;
      }else{
        self.selectedUser = user;
      }
      self.update();
    },

  }
});

module.exports = taskTreemap;
