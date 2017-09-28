var axios = require("axios");
var Range = ace.require('ace/range').Range;

var taskTextarea = Vue.component('task-textarea',{
  template: '<div>\
    <div class="task-info">残り {{todo_count}}/{{ count }} タスク. {{todo_sizes}}/{{ sizes }} 規模. [{{sepaMode.mode}}]</div>\
    <div id="editor"></div>\
  </div>',

  props: ['tasks','line','id','socket'],

  data: function(){
    return {
      count: 0,
      todo_count: 0,
      doing_count: 0,
      done_count: 0,

      sizes: 0,
      todo_sizes: 0,
      doing_sizes: 0,
      done_sizes: 0,
      text: "",

      sepaMode: this.judgeSepaMode(""),
      editor: null,
      beforeCursor: {row: -1, column: -1},

      saveTimer: null,
      markerIds: [],
    }
  },

  watch: {
    tasks: function(){
      this.updateTasks();
    },
    line: function(){
      this.editor.gotoLine(this.line, this.beforeCursor.column);
      this.editor.focus();
    },
  },

  mounted: function(){
    var self = this;

    if (self.id == null){
      self.text = self.getTextFromLocalstorage();
      if (self.text == ""){
        // デフォルトテキスト
        self.text = [
          "テキストに書いたタスクがTreemapとして表示されるよ 35 Todo Aさん",
          "フォーマットは[タスク名][規模][ステータス][アサイン]だよ 40 Todo",
          "[規模][ステータス][アサイン]は省略可能だよ 30 Doing",
          "ダブルクリックするとステータスが変わるよ 50 Todo Cさん",
          "アサイン名をタスクにドラッグできるよ 60 Todo",
          "タスクを選択すると対応するテキストにフォーカスするよ 70 Doing Aさん",
          "カーソル位置に対応するタスクが選択されるよ 80 Done",
          "Excelからコピペできるよ 55 Todo Aさん",
          "区切りはタブとスペースに対応しているよ 45 Doing",
          "ステータスがDoneになると残り規模が減るよ 35 Done Cさん",
          "タスクはローカルストレージに保存されるよ 90 Done Bさん",
        ].join("\n");
      }
    }else{
      // id に紐づくデータをサーバから取得する
      self.socket.on("id_" + self.id, function(data){
        console.log("id_" + self.id);
        console.log(data);
        self.editor.setValue(data.text, -1)
      });

      self.socket.emit('get_data', {id: self.id});
    }

    // ade editor setting
    self.editor = ace.edit("editor");
    self.editor.setTheme("ace/theme/chaos");
    self.editor.getSession().setUseWrapMode(true);
    self.editor.$blockScrolling = Infinity;
    self.editor.session.setOptions({ tabSize: 2, useSoftTabs: false});
    self.editor.on('change', function(){
      clearTimeout(self.saveTimer);
      self.saveTimer = setTimeout(function(){
        var newText = self.editor.getValue();
        var oldText = self.text;

        if (newText != oldText){
          console.log("saveText");
          console.log("1 : " + newText);
          console.log("2 : " + oldText);
          self.text = newText;
          self.saveText();
        }else{
          self.updateText();
        }
      }, 1000);
    });

    self.editor.session.selection.on("changeCursor" , function(e){
      var cursor = self.editor.selection.getCursor();
      var beforeRow = self.beforeCursor.row;
      self.beforeCursor = cursor;

      if (beforeRow == cursor.row) return;

      self.updateText();
    });
    self.editor.setValue(self.text, -1)
  },

  methods: {
    saveText: function(){
      var self = this;

      if (self.id == null){
        self.setTextToLocalStorage(self.text);
      }else{
        //clearTimeout(self.saveTimer);
        //self.saveTimer = setTimeout(function(){
          console.log("saved");
          self.socket.emit('save_data', {id: self.id, text: self.text});
        //}, 1000);
      }
    },

    getSizes: function(tasks){
      if (tasks.length == 0){ return 0; }

      return tasks.length == 1 ? tasks[0].size : tasks.map(function(task){ return task.size; })
       .reduce(function(prev, size){ return prev + size; });
    },

    judgeSepaMode: function(text){
      if (text.match(/\t/)){
        return {
          mode: "tab",
          delim: "\t",
          reg: /^([^\t]+)([\t]+([\d\.]+)(([\t]+(\w+))([\t]+([^\t]+))?)?)?/
        };
      }else{
        return {
          mode: "space",
          delim: " ",
          reg: /^(\S+)([ ]+([\d\.]+)(([ ]+(\S+))([ ]+(\S+))?)?)?/
        };
      }
    },

    setTaskStatus: function(children){
      var self = this;

      var doing = children.filter(function(child){ return child.status != null && child.status.match(/Doing/i); });
      var done = children.filter(function(child){ return child.status != null && child.status.match(/Done/i); });
      var todo = children.filter(function(child){ return child.status == null || !child.status.match(/Done/i); });

      self.count = children.length;
      self.todo_count = todo.length;
      self.doing_count = doing.length;
      self.done_count = done.length;

      self.sizes = self.getSizes(children);
      self.todo_sizes = self.getSizes(todo);
      self.doing_sizes = self.getSizes(doing);
      self.done_sizes = self.getSizes(done);
    },

    updateText: function(){
      var self = this;

      // タブ区切りを自動認識
      self.sepaMode = self.judgeSepaMode(self.text);

      var cursor = self.editor.selection.getCursor();

      self.clearMarkers();
      var children = self.text.split("\n")
        .map(function(row, i){
          var matched = row.match(self.sepaMode.reg);
          if (matched == null){ return null; }
          var child = {
            i: i+1,
            cursor: i == cursor.row,
            name: matched[1],
            size: matched[3] ? Number(matched[3]) : 1,
            status: matched[6] ? matched[6] : "Todo",
            assignee: matched[8] ? matched[8] : "",
          }

          self.addMarker(child,i);

          return child;
        })
        .filter(function(row){
          return row != null;
        });

      self.setTaskStatus(children);

      self.$emit('update-tasks',
        {
          tasks: {
            children: children,
            line: cursor.row + 1
          }
        });
    },

    addMarker: function(child, i){
      var self = this;
      if(child.status != null && child.status.match(/Doing/i)){
        self.markerIds.push(self.editor.session.addMarker(new Range(i, 0, i, 100), "doing-text", "fullLine"));
      }else if (child.status == null || !child.status.match(/Done/i)){
        self.markerIds.push(self.editor.session.addMarker(new Range(i, 0, i, 100), "todo-text", "fullLine"));
      }
    },

    clearMarkers: function(){
      var self = this;
      self.markerIds.map(function(id){
        self.editor.session.removeMarker(id);
      });
      self.markerIds = [];
    },

    updateTasks: function(){
      var self = this;

      var delim = self.sepaMode.delim;
      var children = self.tasks.children;
      var tempText = [];
      var cursor = -1;

      self.clearMarkers();

      children.forEach(function(child, i){
        tempText.push(
          child.name + delim + 
          child.size + delim + 
          child.status + delim + 
          (child.assignee ? child.assignee : ""));

        if (child.cursor){
          cursor = i+1;
        }

        self.addMarker(child,i);
      });

      self.text = tempText.join("\n");
      self.editor.setValue(self.text, -1)

      self.editor.gotoLine(cursor, self.beforeCursor.column);
      self.editor.focus();
    },

    getTextFromLocalstorage: function(){
      try{
        if (localStorage && localStorage.text){
          return localStorage.text;
        }
        return "";
      }catch (err){
        return "";
      }
    },
    setTextToLocalStorage: function(text){
      try{
        if (this.id == null && localStorage){
          localStorage.text = text;
        }
      }catch (err){
      }
    },
  }
});

module.exports = taskTextarea;
