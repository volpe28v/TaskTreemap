var burnDown = Vue.component('burn-down',{
  template: '<div>\
    <div id="burndown"></div>\
    <div id="burndown_editor"></div>\
  </div>',

  data: function(){
    return {
      text: "",
      idealData: [],
      actualData: [],
      maxSum: 0,
    }
  },
 
  mounted: function(){
    var self = this;
    self.addResizeHandler();

    self.editor = ace.edit("burndown_editor");
    self.editor.setTheme("ace/theme/chaos");
    self.editor.getSession().setUseWrapMode(true);
    self.editor.$blockScrolling = Infinity;
    self.editor.session.setOptions({ tabSize: 2, useSoftTabs: false});
    self.editor.on('change', function(){
      self.text = self.editor.getValue();
      self.parseText(self.text.split("\n"));
      self.update();

      /*
      clearTimeout(self.saveTimer);
      self.saveTimer = setTimeout(function(){
        if (self.text != self.preText){
          self.preText = self.text;
          self.saveText();
        }
      }, 500);
      */
    });

    self.text = [
      "5",
      "1562/1562",
      "1282/1562",
      "1100/1562",
    ].join("\n");

    self.editor.setValue(self.text, -1)
  },

  methods: {
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

    parseText: function(text){
      var self = this;

      var sprintReg = /(\d+)/;
      var valueReg = /(\d+)\/(\d+)/;

      var sprintMatched = text[0].match(sprintReg);
      if (sprintMatched == null){ return; }
      var sprintNum = parseInt(sprintMatched[1]);

      var lastSum = 0;
      var actuals = [];
      self.maxSum = 0;
      for (var i = 1; i < text.length; i++){
        var matched = text[i].match(valueReg);
        if (matched == null){ continue; }
        actuals.push(parseInt(matched[1]));
        lastSum = parseInt(matched[2]);
        if (self.maxSum < lastSum){ self.maxSum = lastSum; }
      }

      self.idealData = [];
      self.actualData = [];
      for (var i = 0; i <= sprintNum; i++){
        self.idealData.push({
          sprint: i,
          value: lastSum - (lastSum / sprintNum * i)
        });

        if (actuals[i] != null){
          self.actualData.push({
            sprint: i,
            value: actuals[i]
          })
        }
      }
    },

    update: function(){
      var self = this;

      // 初期化
      d3.select("#burndown").selectAll("svg").remove();

      var div_height = document.getElementById("burndown").clientHeight;
      var div_width = document.getElementById("burndown").clientWidth;
      
			var margin = { top: 20, right: 20, bottom: 30, left: 50 },
				width = div_width - margin.left - margin.right,
				height = div_height - margin.top - margin.bottom;

			// スケールと出力レンジの定義
			var x = d3.scale.linear()
        .domain(d3.extent(self.idealData, function(d) { return d.sprint; }))
				.range([0, width]);

			var y = d3.scale.linear()
        .domain([0, self.maxSum])
				.range([height, 0]);

			// 軸の定義
			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			// 線の定義
			var line = d3.svg.line()
				.x(function(d) { return x(d.sprint); })
				.y(function(d) { return y(d.value); });


			// svgの定義
			var svg = d3.select("#burndown").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

      // x軸をsvgに表示
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // y軸をsvgに表示
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")

      svg.append("path")
        .datum(self.idealData)
        .attr("class", "line")
        .attr("d", line);

      svg.append("path")
        .datum(self.actualData)
        .attr("class", "actual-line")
        .attr("d", line);

    }
	}
});

