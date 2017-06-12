!function(t){function e(s){if(n[s])return n[s].exports;var i=n[s]={i:s,l:!1,exports:{}};return t[s].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,s){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:s})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=2)}([function(t,e){var n=Vue.component("task-textarea",{template:'<div>    <div class="task-info">残り {{todo_count}}/{{ count }} タスク. {{todo_sizes}}/{{ sizes }} 規模.</div>    <textarea v-model="text" placeholder="Title 30 Todo/Doing/Done Assignee"></textarea>  </div>',props:[],data:function(){return{count:0,todo_count:0,doing_count:0,done_count:0,sizes:0,todo_sizes:0,doing_sizes:0,done_sizes:0,text:""}},watch:{text:function(){this.updateText()}},mounted:function(){localStorage.text?this.text=localStorage.text:this.text=["タスク1 30 Todo","タスク2 40 Todo","タスク3 50 Todo Cさん","タスク4 60 Todo","タスク5 70 Doing Aさん","タスク6 80 Done","タスク7 55 Todo Aさん","タスク8 45 Doing","タスク9 35 Done Cさん","タスク10 90 Done Bさん"].join("\n")},methods:{getReg:function(t){return"space"==t?/(\S+)[ ]+([\d\.]+)([ ]+(\S+))?([ ]+(\S+))?/:/(.+)[\t]+([\d\.]+)([\t]+(\w+))?([\t]+(.+))?/},getSizes:function(t){return 0==t.length?0:1==t.length?t[0].size:t.map(function(t){return t.size}).reduce(function(t,e){return t+e})},updateText:function(){var t=this;localStorage&&(localStorage.text=t.text);var e="space";t.text.match(/\t/)&&(e="tab");var n=t.getReg(e),s={children:null},i=t.text.split("\n").filter(function(t){return null!=t.match(n)}).map(function(t){var e=t.match(n);return{name:e[1],size:Number(e[2]),status:e[4]?e[4]:"Todo",assignee:e[6]}});s.children=i;var o=i.filter(function(t){return null!=t.status&&t.status.match(/Doing/i)}),r=i.filter(function(t){return null!=t.status&&t.status.match(/Done/i)}),a=i.filter(function(t){return null==t.status||!t.status.match(/Done/i)});t.count=i.length,t.todo_count=a.length,t.doing_count=o.length,t.done_count=r.length,t.sizes=t.getSizes(i),t.todo_sizes=t.getSizes(a),t.doing_sizes=t.getSizes(o),t.done_sizes=t.getSizes(r),t.$emit("update-tasks",{tasks:s})}}});t.exports=n},function(t,e){var n=Vue.component("task-treemap",{template:'<div>    <div class="task-info">      残り規模 <span class="user-info" v-for="user in users"><span v-bind:class="user.class">{{user.name}}</span> {{user.todo_sizes}}/{{user.sizes}}</span>    </div>    <div id="treemap"></div>  </div>',props:["tasks"],data:function(){return{ColorMax:9,users:[]}},watch:{tasks:function(){this.setTasks()}},methods:{setTasks:function(){this.update()},getColorNo:function(t){return t%(this.ColorMax-1)+1},getStatusColor:function(t){var e="rgb(152, 223, 138)";return null==t?e:t.match(/Done/i)?"rgb(199, 199, 199)":t.match(/Doing/i)?"rgb(174, 199, 232)":e},getSizes:function(t){return 0==t.length?0:1==t.length?t[0].size:t.map(function(t){return t.size}).reduce(function(t,e){return t+e})},update:function(){for(var t=this,e=document.getElementById("treemap");e.firstChild;)e.removeChild(e.firstChild);if(t.users=[],null!=t.tasks&&null!=t.tasks.children&&0!=t.tasks.children.length){var n=t.tasks.children,s={"":{id:0,children:[]}},i=0;n.forEach(function(t){var e=null!=t.assignee?t.assignee:"";null==s[e]?s[e]={id:++i,children:[t]}:s[e].children.push(t)});var o={name:"root_dir",children:Object.keys(s).map(function(t){return{name:t,children:s[t].children}})};t.users=o.children.map(function(e){return{name:""!=e.name?e.name:"未アサイン",class:"task-assignee assignee-"+t.getColorNo(s[e.name].id),sizes:t.getSizes(e.children),todo_sizes:t.getSizes(e.children.filter(function(t){return null==t.status||!t.status.match(/Done/i)}))}});var r=document.getElementById("treemap").clientHeight,a=document.getElementById("treemap").clientWidth,u=d3.layout.treemap().size([a,r]).value(function(t){return t.size});d3.select("#treemap").datum(o).selectAll("div").data(u.nodes).enter().append("div").style("left",function(t){return t.x+"px"}).style("top",function(t){return t.y+"px"}).style("width",function(t){return t.dx-2+"px"}).style("height",function(t){return t.dy-2+"px"}).style("background",function(e,n){return t.getStatusColor(e.status)}).style("position","absolute").style("overflow","hidden").style("border","solid 1px #333").style("padding","0px").on("click",function(t){console.log(t)}).html(function(e){return e.children?"":[e.assignee?'<div><span class="task-assignee assignee-'+t.getColorNo(s[e.assignee].id)+'">'+e.assignee+"</span></div>":"",'<div class="task-name">'+e.name+"</div>",'<div class="task-size">'+e.size+"</div>"].join("")})}}}});t.exports=n},function(t,e,n){n(1),n(0);new Vue({el:"#app",data:{tasks:null},methods:{updateTasks:function(t){this.tasks=t.tasks}}})}]);