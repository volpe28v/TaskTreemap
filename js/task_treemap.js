var taskTreemap = Vue.component('task-treemap',{
  template: '<div id="myGraph">\
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

      if (self.tasks == null){ return; }

      var myNode = document.getElementById("myGraph");
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }

      var colorList = d3.scale.category10();  // 10色を指定

      var treemap = d3.layout.treemap()
        .size([480, 300])	// 横幅480px, 縦幅300px
        .value(function(d) { return d.size; });

      d3.select("#myGraph")
        .datum(self.tasks)	// データを割り付け
        .selectAll("div")	// divに表示するボックスを割り当てる
        .data(treemap.nodes)	// Treemapのノードを対象に処理
        .enter()
        .append("div")	// div要素を追加
        .style("left", function(d) { return d.x + "px"; })	// 表示する座標と幅などを設定
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return d.dx + "px"; })
        .style("height", function(d) { return d.dy + "px"; })
        .style("background", function(d, i){
          if (d.status == "Done"){ return colorList(0); }
          if (d.status == "Doing"){ return colorList(1); }
          if (d.status == "Todo"){ return colorList(2); }
          return colorList(0);	// あらかじめ用意されたカラーを返す
        })
        .style("position", "absolute")
        .style("overflow", "hidden")
        .style("border", "solid 2px white")
        .text(function(d) { 
          if (d.children){ return ""; }	// 子ノードがある場合は親ノードの名前を表示しない
          return d.name;	// 名前を返す
        });
    }
  }
});

module.exports = taskTreemap;
