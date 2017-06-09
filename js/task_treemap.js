var taskTreemap = Vue.component('task-treemap',{
  template: '<div id="treemap">\
</div>',

  props: ['tasks'],

  data: function(){
    return {
      ColorMax: 9
    }
  },

  watch: {
    tasks: function(){
      this.setTasks();
    }
  },

  methods: {
    setTasks: function(){
      var self = this;

      self.update();
    },

    getColorNo: function(id){
      var self = this;

      return id % (self.ColorMax-1) + 1;
    },

    update: function(){
      var self = this;

      // 一旦クリアする
      var myNode = document.getElementById("treemap");
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }

      if (self.tasks == null ||
          self.tasks.children == null ||
          self.tasks.children.length == 0){ return; }

      var children = self.tasks.children;

      // assignee ごとに children を生成
      var assignee_hash = { "": { id: 0, children: [] }};
      var assignee_id = 0;
      children.forEach(function(child){
        var assignee = child.assignee != null ? child.assignee : "";

        if (assignee_hash[assignee] == null){
          assignee_hash[assignee] = { id: assignee_id++, children: [child]};
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
          };
        })
      }

      var height = document.getElementById("treemap").clientHeight;
      var width = document.getElementById("treemap").clientWidth;

      var treemap = d3.layout.treemap()
        .size([width, height])
        .value(function(d) { return d.size; });

      d3.select("#treemap")
        .datum(tasks_node)
        .selectAll("div")
        .data(treemap.nodes)
        .enter()
        .append("div")
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return d.dx-2 + "px"; })
        .style("height", function(d) { return d.dy-2 + "px"; })
        .style("background", function(d, i){
          if (d.status == "Done"){ return "rgb(199, 199, 199)"; }
          if (d.status == "Doing"){ return "rgb(174, 199, 232)"; }
          return "rgb(152, 223, 138)"; //Todo or other
        })
        .style("position", "absolute")
        .style("overflow", "hidden")
        .style("border", "solid 1px #333")
        .style("padding", "0px")
        .on("click",function(d){
          console.log(d);
        })
        .html(function(d) {
          if (d.children){
            return "";
          }else{
            return [
              d.assignee ? '<div><span class="task-assignee assignee-' + self.getColorNo(assignee_hash[d.assignee].id) + '">' + d.assignee + '</span></div>' : "",
              '<div class="task-name">' + d.name + '</div>',
              '<div class="task-size">' + d.size + '</div>',
            ].join("");
          }
        });
    }
  }
});

module.exports = taskTreemap;
