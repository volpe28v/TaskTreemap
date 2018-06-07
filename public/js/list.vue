<template>
  <div class="list">
    <mini-app 
      v-for="taskMap in taskMapList"
      :key="taskMap.id"
      :map_id="taskMap.id"
      >
    </mini-app>
  </div>
</template>

<style>
#app{
  overflow: auto !important;
}

.list {
  display: flex;
  flex-direction: row;
}
</style>

<script>
var axios = require("axios");

var miniApp = require("./mini_app.vue").default;

module.exports = {
  components: {
    'mini-app': miniApp,
  },

  data: function(){
    return {
      taskMapList: [],
    }
  },

  mounted: function(){
    var self = this;

    axios.get('all_maps')
      .then(function(result){
        self.taskMapList = result.data;
      });
  }
}
</script>

