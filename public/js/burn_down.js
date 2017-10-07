var burnDown = Vue.component('burn-down',{
  template: '<div>\
    <div id="burndown_left">\
      <div id="burndown_apply">\
        <button v-on:click="applyProgress" v-show="isApplyButtonEnabled">{{applyText}}</button>\
      </div>\
      <div id="burndown_editor"></div>\
    </div>\
    <div id="burndown"></div>\
  </div>',

  props: ['id','progress','socket'],

  data: function(){
    return {
      preText: "",
      sprintNum: 0,
      idealData: [],
      actualData: [],
      latestData: [],
      maxSum: 0,
      applyText: "",
      DefaultSprintNum: 4
    }
  },
 
  computed: {
    isApplyButtonEnabled: function(){
      var self = this;
      if (self.progress == null) return false;
      if (self.progress.total == 0) return false;
      if (self.isFinished()) return false;
      return true;
    },
  },

  watch: {
    progress: function(){
      var self = this;
      if (self.progress == null) return;

      var text = self.editor.getValue();
      if (text == ""){
        self.editor.setValue("" + self.DefaultSprintNum, -1)
      }else{
        var text = self.editor.getValue();
        self.parseText(text.split("\n"));
        self.update();
      }
    },
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
      var text = self.editor.getValue();
      self.parseText(text.split("\n"));
      self.update();

      clearTimeout(self.saveTimer);
      self.saveTimer = setTimeout(function(){
        var text = self.editor.getValue();
        if (text != self.preText){
          self.preText = text;
          self.socket.emit('save_burn', {id: self.id, text: text});
        }
      }, 500);
    });

    if (self.id == null){
      var text = [
        "5",
        "1562/1562",
        "1282/1562",
        "1100/1562",
      ].join("\n");
      self.editor.setValue(text, -1)
    }else{
      // id に紐づくデータをサーバから取得する
      self.socket.on("burn_" + self.id, function(data){
        var text = "";
        if (data != null){
          text = data.text;
        }
        self.preText = text;
        self.editor.setValue(text, -1)
      });

      self.socket.emit('get_burn', {id: self.id});
    }
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

      self.maxSum = 0;
      self.idealData = [];
      self.actualData = [];

      var sprintMatched = text[0].match(sprintReg);
      self.sprintNum = 0;
      if (sprintMatched != null){
        self.sprintNum = parseInt(sprintMatched[1]);
      }else{
        return;
      }

      var lastSum = 0;
      var actuals = [];
      for (var i = 1; i < text.length; i++){
        var matched = text[i].match(valueReg);
        if (matched == null){ continue; }
        actuals.push(parseInt(matched[1]));
        lastSum = parseInt(matched[2]);
        if (self.maxSum < lastSum){ self.maxSum = lastSum; }
      }

      if (self.progress != null){
        lastSum = self.progress.total;
        if (self.progress.total > self.maxSum){
          self.maxSum = self.progress.total;
        }
      }

      for (var i = 0; i <= self.sprintNum; i++){
        self.idealData.push({
          sprint: i,
          value: lastSum - (lastSum / self.sprintNum * i)
        });

        if (actuals[i] != null){
          self.actualData.push({
            sprint: i,
            value: actuals[i]
          })
        }
      }

      self.latestData = [];
      if (self.progress != null && self.actualData.length > 0){
        var lastActual = self.actualData[self.actualData.length-1];
        if (lastActual.sprint < self.sprintNum){
          self.latestData = [
            {
              sprint: lastActual.sprint,
              value: lastActual.value,
            },
            {
              sprint: lastActual.sprint + 1,
              value: self.progress.remaining,
            }
          ];
        }
      }

      if (self.actualData.length > 0){
        var lastActual = self.actualData[self.actualData.length-1];
        self.applyText = "Apply to " + (lastActual.sprint + 1) + " sprint";
      }else{
        self.applyText = "Apply to initial plan";
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

      if (self.idealData.length == 0) return;
      svg.append("path")
        .datum(self.idealData)
        .attr("class", "line")
        .attr("d", line);

      svg.append("path")
        .datum(self.actualData)
        .attr("class", "actual-line")
        .attr("d", line);

      svg.append("path")
        .datum(self.latestData)
        .attr("class", "latest-line")
        .attr("d", line);
    },

    applyProgress: function(){
      var self = this;
      var textArray = self.editor.getValue().trim().split("\n");
      textArray.push(self.progress.remaining + "/" + self.progress.total);
      self.editor.setValue(textArray.join("\n"), -1)
    },

    isFinished: function(){
      var self = this;
      if (self.actualData.length > 0){
        var lastActual = self.actualData[self.actualData.length-1];
        return lastActual.sprint >= self.sprintNum;
      }else{
        return false;
      }
    }
	}
});

