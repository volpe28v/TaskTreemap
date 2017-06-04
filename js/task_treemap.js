var taskTreemap = Vue.component('task-treemap',{
  template: '<div id="treemap">\
</div>',

  props: ['tasks'],

  data: function(){
    return {
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

      console.log(self.tasks);

      var height = document.getElementById("treemap").clientHeight;
      var width = document.getElementById("treemap").clientWidth;

      var treemap = d3.layout.treemap()
        .size([width, height])
        .value(function(d) { return d.size; });

      d3.select("#treemap")
        .datum(self.tasks)
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
        .style("border", "solid 1px white")
        .style("padding", "0px")
        .html(function(d) {
          if (d.children){ return ""; }
          return [
            '<div class="task-name">' + d.name + '</div>',
            '<div class="task-size">' + d.size + '</div>',
          ].join("");
        });
    }
  }
});

module.exports = taskTreemap;
