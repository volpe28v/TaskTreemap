<template>
  <div>
    <div class="burndown_left">
      <div class="burndown_apply">
        <a class="apply-progress" href="#" v-on:click="applyProgress">{{applyText}}</a>
      </div>
      <div class="burndown_editor" :id="burndownEditorId"></div>
    </div>
    <div class="burndown" :id="burndownId"></div>
  </div>
</template>

<style>
.burndown {
  flex: 2;
  position: relative;
  background: #161616;
  margin-top: 3px;
}

.burndown_left {
  width: 150px;
  display: flex;
  flex-direction: column;
  margin-top: 3px;
  background: #161616;
}

.burndown_apply {
  background: #161616;
  padding: 2px 5px;
  font-size: 12px;
  height: 20px;
}

.burndown_apply a {
  color: gray;
  text-decoration: none;
  margin-left: 3px;
}

.burndown_apply a:hover {
  color: yellow;
}

.burndown_editor {
  flex: 1;
  position: relative;
  margin-left: 10px;
}

.axis path,
.axis line {
	fill: none;
	stroke: #ccc;
	shape-rendering: crispEdges;
	stroke-width: 1.5px;
}

.axis text {
  fill: #ccc;
  font-size: 11px;
}

.line {
	fill: none;
  stroke: #ccc;
	stroke-width: 1.5px;
}

.actual-line {
	fill: none;
	stroke: rgba(136, 194, 92, 0.8);
	stroke-width: 4.0px;
}

.assigned-line {
	fill: none;
	stroke: rgba(50, 185, 253, 0.8);
	stroke-width: 3.0px;
  stroke-dasharray: 2, 2;
}

.latest-line {
	fill: none;
	stroke: rgba(50, 185, 253, 0.8);
	stroke-width: 4.0px;
}

.bar {
  fill: rgba(148, 95, 79, 1.0)
}

.done-bar{
  fill: rgba(102,102,102,0.8);
}

</style>

<script>
  module.exports = {
    props: ['id','tasks', 'progress','socket','trigger'],

    data: function(){
      return {
        preText: "",
        sprintNum: 0,
        idealData: [],
        actualData: [],
        latestData: [],
        assignedData: [],
        addedData: [],
        doneData: [],
        maxSum: 0,
        applyText: "",
        DefaultSprintNum: 4
      }
    },

    computed: {
      burndownId: function(){
        return 'burndown_' + this.id;
      },
      burndownEditorId: function(){
        return 'burndown_editor_' + this.id;
      }
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
          self.parseText(text);
          self.update();
        }
      },

      tasks: function(){
        var self = this;
        var text = self.editor.getValue();
        self.parseText(text);
        self.update();
      },

      trigger: function(){
        this.update();
      }
    },

    mounted: function(){
      var self = this;
      self.addResizeHandler();

      self.editor = ace.edit(this.burndownEditorId);
      self.editor.setTheme("ace/theme/chaos");
      self.editor.getSession().setUseWrapMode(true);
      self.editor.$blockScrolling = Infinity;
      self.editor.session.setOptions({ tabSize: 2, useSoftTabs: false});
      self.editor.setOptions({
        showLineNumbers: false,
        showGutter: false,
      });
      self.editor.on('change', function(){
        var text = self.editor.getValue();
        self.parseText(text);
        self.update();

        clearTimeout(self.saveTimer);
        self.saveTimer = setTimeout(function(){
          var text = self.editor.getValue();
          if (text != self.preText){
            self.preText = text;
            self.saveText();
          }
        }, 500);
      });

      if (self.id == null){
        self.text = self.getTextFromLocalstorage();
        if (self.text == ""){
          self.text = [
            "5",
            "590/590",
            "510/590",
            "420/590",
          ].join("\n");
        }
        self.editor.setValue(self.text, -1)
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

      self.update();
    },

    methods: {
      saveText: function(){
        var self = this;

        if (self.id == null){
          self.setTextToLocalStorage(self.preText);
        }else{
          self.socket.emit('save_burn', {id: self.id, text: self.preText});
        }
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

      parseText: function(text){
        var self = this;

        var sprintReg = /(\d+)/;
        var valueReg = /([\d\.]+)\/([\d\.]+)/;

        var rows = text.split(/\r\n|\r|\n/);
        self.maxSum = 0;
        self.idealData = [];
        self.actualData = [];
        self.addedData = [];
        self.doneData = [];

        var sprintMatched = rows[0].match(sprintReg);
        self.sprintNum = 0;
        if (sprintMatched != null){
          self.sprintNum = parseInt(sprintMatched[1]);
        }else{
          return;
        }

        var lastSum = 0;
        var actuals = [];
        var sums = [];
        for (var i = 1; i < rows.length; i++){
          var matched = rows[i].match(valueReg);
          if (matched == null){ continue; }
          actuals.push(Number(matched[1]));
          lastSum = Number(matched[2]);
          sums.push(lastSum);
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

            // 追加・完了を算出
            if (i >= 1){
              self.addedData.push({
                sprint: i,
                value: Math.max(sums[i] - sums[i-1], 0),
              });
              self.doneData.push({
                sprint: i,
                value: Math.max(actuals[i-1] + (sums[i] - sums[i-1]) - actuals[i], 0),
              });
            }
          }
        }

        self.latestData = [];
        if (self.progress != null && self.actualData.length > 0){
          var lastActual = self.actualData[self.actualData.length-1];
          if (lastActual.sprint < self.sprintNum){
            var curretSprint = lastActual.sprint + 1;
            self.latestData = [
              {
                sprint: lastActual.sprint,
                value: lastActual.value,
              },
              {
                sprint: curretSprint,
                value: self.progress.remaining,
              }
            ];

            self.addedData.push({
              sprint: curretSprint,
              value: Math.max(self.progress.total - sums[lastActual.sprint], 0),
            });
            self.doneData.push({
              sprint: curretSprint,
              value: Math.max(actuals[lastActual.sprint] + (self.progress.total - sums[lastActual.sprint]) - self.progress.remaining, 0),
            });
          }
        }

        self.assignedData = [];
        if (self.tasks != null && self.tasks.children.length > 0 && self.actualData.length > 0){
          var lastActual = self.actualData[self.actualData.length-1];
          if (lastActual.sprint < self.sprintNum){
            var curretSprint = lastActual.sprint + 1;

            var assignedSize = 0;
            self.tasks.children.forEach(function(child){
              if (!child.status.match(/(Done|Close)/i) && child.assignee != ""){
                assignedSize += child.size;
              }
            });

            self.assignedData = [
              {
                sprint: lastActual.sprint,
                value: lastActual.value,
              },
              {
                sprint: curretSprint,
                value: self.progress.remaining - assignedSize,
              }
            ];
          }
        }
      },

      update: function(){
        var self = this;

        self.setApplyText();

        // 初期化
        d3.select("#" + this.burndownId).selectAll("svg").remove();

        var div_height = document.getElementById(this.burndownId).clientHeight;
        var div_width = document.getElementById(this.burndownId).clientWidth;

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
          .orient("bottom")
          .ticks(self.sprintNum);

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

        // 線の定義
        var line = d3.svg.line()
          .x(function(d) { return x(d.sprint); })
          .y(function(d) { return y(d.value); })
          .interpolate("monotone");


        // svgの定義
        var svg = d3.select("#" + this.burndownId).append("svg")
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

        svg.selectAll(".bar")
          .data(self.addedData)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.sprint) - 10; })
          .attr("width", 10)
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); });

        svg.selectAll(".done-bar")
          .data(self.doneData)
          .enter().append("rect")
          .attr("class", "done-bar")
          .attr("x", function(d) { return x(d.sprint); })
          .attr("width", 10)
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); });

        svg.append("path")
          .datum(self.idealData)
          .attr("class", "line")
          .attr("d", line);

        svg.append("path")
          .datum(self.actualData)
          .attr("class", "actual-line")
          .attr("d", line);

        svg.append("path")
          .datum(self.assignedData)
          .attr("class", "assigned-line")
          .attr("d", line);

        svg.append("path")
          .datum(self.latestData)
          .attr("class", "latest-line")
          .attr("d", line);
      },

      setApplyText: function(){
        var self = this;

        if (self.sprintNum == 0){
          self.applyText = "Enter sprints number";
        }
        else if (self.isFinished()){
          self.applyText = "Sprint finished";
        }else{
          if (self.actualData.length > 0){
            var lastActual = self.actualData[self.actualData.length-1];
            var currentSprint = lastActual.sprint + 1;
            self.applyText = "Apply to " + currentSprint + " sprint" + (currentSprint > 1 ? "s": "");
          }else{
            self.applyText = "Apply to initial plan";
          }
        }
      },

      applyProgress: function(){
        var self = this;

        if (self.progress == null) return;
        if (self.progress.total == 0) return;
        if (self.sprintNum == 0) return;
        if (self.isFinished()) return;

        var textArray = self.editor.getValue().trim().split("\n");
        textArray.push(self.progress.remaining + "/" + self.progress.total);
        self.editor.setValue(textArray.join("\n"), -1)

        // Done を Closed へ
        var tasks = {
          "children": null
        }

        self.tasks.children.forEach(function(child){
          if (child.status.match(/Done/i)){
            child.status = "Closed";
          }
        });

        tasks.children = self.tasks.children;
        self.$emit('update-tasks',
          {
            tasks: tasks
          });
      },

      isFinished: function(){
        var self = this;
        if (self.actualData.length > 0){
          var lastActual = self.actualData[self.actualData.length-1];
          return lastActual.sprint >= self.sprintNum;
        }else{
          return false;
        }
      },

      getTextFromLocalstorage: function(){
        try{
          if (localStorage && localStorage.burndown){
            return localStorage.burndown;
          }
          return "";
        }catch (err){
          return "";
        }
      },
      setTextToLocalStorage: function(text){
        try{
          if (this.id == null && localStorage){
            localStorage.burndown = text;
          }
        }catch (err){
        }
      },
    }
  };
</script>
